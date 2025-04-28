import Stripe from 'stripe';
import { storage } from './storage';
import { addDays, format } from 'date-fns';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

// Initialize Stripe client with the API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil',
});

// Get price ID from environment variables
const PRICE_ID = process.env.STRIPE_PRICE_ID;
if (!PRICE_ID) {
  throw new Error('Missing STRIPE_PRICE_ID environment variable. Please set this to your Stripe price ID.');
}

// Default trial period (7 days)
const TRIAL_DAYS = 7;

export async function createCustomer(email: string, username: string): Promise<string> {
  try {
    const customer = await stripe.customers.create({
      email,
      name: username,
      metadata: {
        username
      }
    });
    
    return customer.id;
  } catch (error: any) {
    console.error('Error creating Stripe customer:', error.message);
    throw new Error(`Failed to create Stripe customer: ${error.message}`);
  }
}

export async function createTrialSubscription(
  userId: number, 
  email: string,
  username: string
): Promise<{
  subscriptionId: string;
  trialEndsAt: Date;
  clientSecret?: string;
}> {
  try {
    // Get user or create Stripe customer if needed
    let user = await storage.getUser(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Create Stripe customer if user doesn't have one
    if (!user.stripeCustomerId) {
      const customerId = await createCustomer(email, username);
      user = await storage.updateUserStripeInfo(userId, { 
        stripeCustomerId: customerId 
      });
    }

    // Calculate trial end date (7 days from now)
    const trialEndDate = addDays(new Date(), TRIAL_DAYS);
    
    // Create a trial subscription
    const subscription = await stripe.subscriptions.create({
      customer: user.stripeCustomerId!,
      items: [{ price: PRICE_ID }],
      trial_end: Math.floor(trialEndDate.getTime() / 1000), // Convert to Unix timestamp
      metadata: {
        userId: userId.toString()
      }
    });

    // Update user with subscription information
    await storage.updateUserStripeInfo(userId, {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: 'trialing',
      trialEndsAt: trialEndDate
    });

    return {
      subscriptionId: subscription.id,
      trialEndsAt: trialEndDate
    };
  } catch (error: any) {
    console.error('Error creating trial subscription:', error.message);
    throw new Error(`Failed to create trial subscription: ${error.message}`);
  }
}

export async function createPaymentSubscription(userId: number): Promise<{
  subscriptionId: string;
  clientSecret: string;
}> {
  try {
    let user = await storage.getUser(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Create Stripe customer if user doesn't have one
    if (!user.stripeCustomerId) {
      const customerId = await createCustomer(user.email, user.username);
      user = await storage.updateUserStripeInfo(userId, { 
        stripeCustomerId: customerId 
      });
    }

    // If user already has a subscription, check its status
    if (user.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        
        // If subscription is active, no need to pay again
        if (subscription.status === 'active') {
          return {
            subscriptionId: subscription.id,
            clientSecret: 'subscription_already_active'
          };
        }
        
        // Cancel the existing subscription if it's not active
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
        
      } catch (error) {
        console.log('Error retrieving existing subscription:', error);
        // Subscription might not exist anymore, continue with creating a new one
      }
    }

    // We know PRICE_ID is valid from our earlier check
    if (!PRICE_ID) {
      throw new Error('Missing PRICE_ID environment variable');
    }
    
    // Get the price from Stripe to confirm it exists
    try {
      await stripe.prices.retrieve(PRICE_ID);
    } catch (error) {
      console.error('Error retrieving price:', error);
      throw new Error(`Invalid price ID: ${PRICE_ID}`);
    }

    // Create a payment intent directly
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000, // Will be replaced by the subscription amount
      currency: 'usd',
      customer: user.stripeCustomerId!,
      setup_future_usage: 'off_session',
      metadata: {
        userId: userId.toString()
      }
    });

    // Create a new subscription without attaching the payment method yet
    const subscription = await stripe.subscriptions.create({
      customer: user.stripeCustomerId!,
      items: [{ price: PRICE_ID }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription'
      },
      metadata: {
        userId: userId.toString(),
        paymentIntentId: paymentIntent.id
      }
    });

    const clientSecret = paymentIntent.client_secret!;

    // Update user with subscription information
    await storage.updateUserStripeInfo(userId, {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: 'incomplete'
    });

    return {
      subscriptionId: subscription.id,
      clientSecret
    };
  } catch (error: any) {
    console.error('Error creating payment subscription:', error.message);
    throw new Error(`Failed to create payment subscription: ${error.message}`);
  }
}

export async function cancelSubscription(userId: number): Promise<boolean> {
  try {
    const user = await storage.getUser(userId);
    
    if (!user || !user.stripeSubscriptionId) {
      return false;
    }

    // Cancel the subscription at the end of the current period
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    // Update user status
    await storage.updateUserStripeInfo(userId, {
      subscriptionStatus: 'canceling'
    });

    return true;
  } catch (error: any) {
    console.error('Error canceling subscription:', error.message);
    throw new Error(`Failed to cancel subscription: ${error.message}`);
  }
}

export async function reactivateSubscription(userId: number): Promise<boolean> {
  try {
    const user = await storage.getUser(userId);
    
    if (!user || !user.stripeSubscriptionId) {
      return false;
    }

    // Reactivate the subscription
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    // Update user status
    await storage.updateUserStripeInfo(userId, {
      subscriptionStatus: 'active'
    });

    return true;
  } catch (error: any) {
    console.error('Error reactivating subscription:', error.message);
    throw new Error(`Failed to reactivate subscription: ${error.message}`);
  }
}

// Handle Stripe webhooks to update subscription status
export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = Number(subscription.metadata.userId);
        
        if (!userId) break;
        
        const status = subscription.status;
        let subscriptionStatus;
        
        switch (status) {
          case 'trialing':
            subscriptionStatus = 'trialing';
            break;
          case 'active':
            subscriptionStatus = 'active';
            break;
          case 'canceled':
            subscriptionStatus = 'canceled';
            break;
          case 'unpaid':
            subscriptionStatus = 'unpaid';
            break;
          case 'past_due':
            subscriptionStatus = 'past_due';
            break;
          default:
            subscriptionStatus = status;
        }
        
        // Update subscription status in our database
        await storage.updateUserStripeInfo(userId, {
          subscriptionStatus,
          subscriptionEndsAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : undefined
        });
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = Number(subscription.metadata.userId);
        
        if (!userId) break;
        
        // Update user status to canceled
        await storage.updateUserStripeInfo(userId, {
          subscriptionStatus: 'canceled',
          stripeSubscriptionId: null
        });
        
        break;
      }
    }
  } catch (error: any) {
    console.error('Error handling Stripe webhook:', error.message);
    throw new Error(`Failed to handle Stripe webhook: ${error.message}`);
  }
}