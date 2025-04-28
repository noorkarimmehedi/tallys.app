import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { ParticleButton } from '@/components/ui/particle-button';

// Helper function to get status badge color
const getStatusBadge = (status: string | undefined) => {
  if (!status) return null;
  
  const statusConfig = {
    'trial': { color: 'bg-blue-500', icon: <Clock className="h-4 w-4 mr-1" /> },
    'trialing': { color: 'bg-blue-500', icon: <Clock className="h-4 w-4 mr-1" /> },
    'active': { color: 'bg-green-500', icon: <CheckCircle className="h-4 w-4 mr-1" /> },
    'incomplete': { color: 'bg-yellow-500', icon: <AlertCircle className="h-4 w-4 mr-1" /> },
    'past_due': { color: 'bg-red-500', icon: <AlertCircle className="h-4 w-4 mr-1" /> },
    'canceled': { color: 'bg-gray-500', icon: <AlertCircle className="h-4 w-4 mr-1" /> },
    'unpaid': { color: 'bg-red-500', icon: <AlertCircle className="h-4 w-4 mr-1" /> },
    'canceling': { color: 'bg-yellow-500', icon: <Clock className="h-4 w-4 mr-1" /> },
  } as const;
  
  const config = statusConfig[status as keyof typeof statusConfig] || 
    { color: 'bg-gray-500', icon: null };
  
  return (
    <Badge className={`${config.color} text-white flex items-center px-2 py-1`}>
      {config.icon}
      <span className="capitalize">{status}</span>
    </Badge>
  );
};

const SubscriptionStatus: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mutation for starting a trial
  const startTrialMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/subscription/trial');
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Trial Started',
        description: 'Your 7-day free trial has been started successfully.',
      });
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start trial',
        variant: 'destructive',
      });
    },
  });
  
  // Mutation for starting payment process
  const startPaymentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/subscription/payment');
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.clientSecret === 'subscription_already_active') {
        toast({
          title: 'Subscription Active',
          description: 'Your subscription is already active.',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        return;
      }
      
      // Redirect to payment page with client secret
      window.location.href = `/subscription/checkout?client_secret=${data.clientSecret}`;
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process payment',
        variant: 'destructive',
      });
    },
  });
  
  // Mutation for canceling subscription
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/subscription/cancel');
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Subscription Canceled',
        description: 'Your subscription has been canceled.',
      });
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel subscription',
        variant: 'destructive',
      });
    },
  });
  
  // Mutation for reactivating subscription
  const reactivateSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/subscription/reactivate');
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Subscription Reactivated',
        description: 'Your subscription has been reactivated.',
      });
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reactivate subscription',
        variant: 'destructive',
      });
    },
  });
  
  if (!user) {
    return null;
  }
  
  // Format trial end date if available
  const trialEndsAt = user.trialEndsAt 
    ? new Date(user.trialEndsAt) 
    : null;
  
  const formattedTrialEndsAt = trialEndsAt 
    ? formatDistanceToNow(trialEndsAt, { addSuffix: true })
    : null;
  
  // Format subscription end date if available
  const subscriptionEndsAt = user.subscriptionEndsAt 
    ? new Date(user.subscriptionEndsAt) 
    : null;
  
  const formattedSubscriptionEndsAt = subscriptionEndsAt 
    ? formatDistanceToNow(subscriptionEndsAt, { addSuffix: true })
    : null;
  
  const isTrialing = user.subscriptionStatus === 'trial' || user.subscriptionStatus === 'trialing';
  const isActive = user.subscriptionStatus === 'active';
  const isCanceling = user.subscriptionStatus === 'canceling';
  const isPastDue = user.subscriptionStatus === 'past_due';
  const isIncomplete = user.subscriptionStatus === 'incomplete';
  
  const hasPendingActions = startTrialMutation.isPending || 
    startPaymentMutation.isPending || 
    cancelSubscriptionMutation.isPending || 
    reactivateSubscriptionMutation.isPending;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Subscription Status</span>
          {getStatusBadge(user.subscriptionStatus || undefined)}
        </CardTitle>
        <CardDescription>
          Manage your subscription to access all features
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isTrialing && (
          <div className="space-y-4">
            <p>You are currently on a trial which will end {formattedTrialEndsAt}.</p>
            <p>After your trial ends, you'll need to subscribe to continue using all features.</p>
          </div>
        )}
        
        {isActive && (
          <div className="space-y-4">
            <p>Your subscription is active.</p>
            <p>You have access to all premium features.</p>
          </div>
        )}
        
        {isCanceling && (
          <div className="space-y-4">
            <p>Your subscription will be canceled {formattedSubscriptionEndsAt}.</p>
            <p>You can reactivate your subscription before then to maintain access.</p>
          </div>
        )}
        
        {isPastDue && (
          <div className="space-y-4">
            <p className="text-red-500">Your payment is past due.</p>
            <p>Please update your payment information to continue using premium features.</p>
          </div>
        )}
        
        {isIncomplete && (
          <div className="space-y-4">
            <p className="text-yellow-500">Your subscription is incomplete.</p>
            <p>Please complete the payment process to activate your subscription.</p>
          </div>
        )}
        
        {!user.subscriptionStatus && (
          <div className="space-y-4">
            <p>You don't have an active subscription.</p>
            <p>Start a 7-day free trial to access all premium features.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {(!user.subscriptionStatus || user.subscriptionStatus === 'canceled') && (
          <ParticleButton
            onClick={() => startTrialMutation.mutate()}
            disabled={hasPendingActions}
            className="bg-black text-white hover:bg-black/90"
          >
            {startTrialMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Trial...
              </>
            ) : (
              'Start Free Trial'
            )}
          </ParticleButton>
        )}
        
        {isTrialing && (
          <ParticleButton
            onClick={() => startPaymentMutation.mutate()}
            disabled={hasPendingActions}
            className="bg-black text-white hover:bg-black/90"
          >
            {startPaymentMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Subscribe Now'
            )}
          </ParticleButton>
        )}
        
        {isActive && (
          <Button
            variant="outline"
            onClick={() => cancelSubscriptionMutation.mutate()}
            disabled={hasPendingActions}
          >
            {cancelSubscriptionMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Canceling...
              </>
            ) : (
              'Cancel Subscription'
            )}
          </Button>
        )}
        
        {isCanceling && (
          <ParticleButton
            onClick={() => reactivateSubscriptionMutation.mutate()}
            disabled={hasPendingActions}
            className="bg-black text-white hover:bg-black/90"
          >
            {reactivateSubscriptionMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reactivating...
              </>
            ) : (
              'Reactivate Subscription'
            )}
          </ParticleButton>
        )}
        
        {(isPastDue || isIncomplete) && (
          <ParticleButton
            onClick={() => startPaymentMutation.mutate()}
            disabled={hasPendingActions}
            className="bg-black text-white hover:bg-black/90"
          >
            {startPaymentMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Complete Payment'
            )}
          </ParticleButton>
        )}
      </CardFooter>
    </Card>
  );
};

export default SubscriptionStatus;