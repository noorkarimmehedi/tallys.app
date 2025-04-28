import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Shield } from 'lucide-react';

// Load Stripe outside of component render to avoid recreating the Stripe object on every render
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Stripe public key is missing. Make sure VITE_STRIPE_PUBLIC_KEY is set in environment variables.');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Component for the actual payment form
const CheckoutForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL where the customer should be redirected after payment
        return_url: `${window.location.origin}/subscription/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      // Show error to your customer
      setMessage(error.message || 'An unexpected error occurred.');
      toast({
        title: 'Payment Failed',
        description: error.message || 'Something went wrong with your payment.',
        variant: 'destructive',
      });
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment is successful
      setMessage('Payment successful!');
      toast({
        title: 'Payment Successful',
        description: 'Thank you for your subscription.',
      });
      
      // Redirect to success page
      setLocation('/subscription/success');
    } else {
      setMessage('Payment status: ' + paymentIntent?.status);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <PaymentElement />
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
        <div className="flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          <span>All payments are secured and encrypted</span>
        </div>
      </div>
      
      {message && (
        <div className="p-4 mb-4 text-sm rounded-md bg-primary/10">
          {message}
        </div>
      )}
      
      <div className="flex gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setLocation('/')}
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
        
        <Button 
          type="submit" 
          className="flex-1" 
          disabled={!stripe || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Complete Subscription'
          )}
        </Button>
      </div>
    </form>
  );
};

// Main checkout page component
const CheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [searchParams] = useState<URLSearchParams>(
    new URLSearchParams(window.location.search)
  );
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // If the user is not authenticated, redirect to auth page
    if (!user) {
      setLocation('/auth');
      return;
    }
    
    // Get the client secret from the URL
    const secret = searchParams.get('client_secret');
    if (secret) {
      setClientSecret(secret);
    } else {
      // If no client secret is provided, display an error
      toast({
        title: 'Error',
        description: 'No payment information provided. Please try again.',
        variant: 'destructive',
      });
      setLocation('/');
    }
  }, [user, searchParams, setLocation, toast]);
  
  if (!clientSecret || !user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container max-w-3xl py-8">
        <h1 className="text-3xl font-bold mb-8">Complete Your Subscription</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>
              Secure payment for your tallys subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements 
              stripe={stripePromise} 
              options={{ clientSecret }}
            >
              <CheckoutForm />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CheckoutPage;