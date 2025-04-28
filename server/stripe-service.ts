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

    // If user already has a subscription, return the payment intent for that
    if (user.stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      
      // If subscription is active, no need to pay again
      if (subscription.status === 'active') {
        return {
          subscriptionId: subscription.id,
          clientSecret: 'subscription_already_active'
        };
      }
      
      // If subscription is past due or incomplete, get the payment intent
      if (typeof subscription.latest_invoice === 'string') {
        const latestInvoice = await stripe.invoices.retrieve(subscription.latest_invoice);
        // Use type assertion to handle payment_intent property
        const invoice = latestInvoice as unknown as { payment_intent?: string };
        if (typeof invoice.payment_intent === 'string') {
          const paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
          
          return {
            subscriptionId: subscription.id,
            clientSecret: paymentIntent.client_secret!
          };
        }
      }
      
      // If we can't get a payment intent, create a new subscription
      await stripe.subscriptions.cancel(subscription.id);
    }

    // Create a new subscription with default payment settings
    const subscription = await stripe.subscriptions.create({
      customer: user.stripeCustomerId!,
      items: [{ price: PRICE_ID }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription'
      },
      expand: ['latest_invoice'],
      metadata: {
        userId: userId.toString()
      }
    });

    // Get client secret from the payment intent
    let clientSecret: string;
    
    // Get invoice ID from the subscription
    let invoiceId: string;
    
    if (typeof subscription.latest_invoice === 'object' && 
        subscription.latest_invoice !== null &&
        'id' in subscription.latest_invoice &&
        subscription.latest_invoice.id) {
      invoiceId = subscription.latest_invoice.id as string;
    } else if (typeof subscription.latest_invoice === 'string') {
      invoiceId = subscription.latest_invoice;
    } else {
      throw new Error('Unable to get latest invoice from subscription');
    }
    
    // Double-check that we have a valid invoice ID
    if (!invoiceId) {
      throw new Error('Invalid invoice ID from subscription');
    }
    
    // Retrieve the invoice with payment intent expanded
    const invoiceResponse = await stripe.invoices.retrieve(invoiceId, {
      expand: ['payment_intent']
    });
    
    // We need to cast the response to access expanded properties
    type InvoiceWithPaymentIntent = {
      payment_intent?: {
        client_secret?: string;
      };
    };
    
    // Cast the invoice response to our custom type
    const invoice = invoiceResponse as unknown as InvoiceWithPaymentIntent;
    
    // Check if payment intent exists and has a client secret
    if (invoice.payment_intent?.client_secret) {
      clientSecret = invoice.payment_intent.client_secret;
    } else {
      throw new Error('Unable to get client secret from invoice payment intent');
    }

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