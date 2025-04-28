import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Home, List } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useQueryClient } from '@tanstack/react-query';

const SubscriptionSuccessPage = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Refresh user data to get updated subscription information
    queryClient.invalidateQueries({ queryKey: ['/api/user'] });
  }, [queryClient]);
  
  return (
    <MainLayout>
      <div className="container max-w-3xl py-16">
        <Card className="border-green-100 bg-green-50/10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-green-700">Payment Successful</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-gray-600">
              Thank you for subscribing to tallys! Your payment has been processed successfully.
            </p>
            <div className="bg-white p-6 rounded-lg border border-gray-100 mb-6">
              <h3 className="font-semibold text-lg mb-2">Your subscription includes:</h3>
              <ul className="space-y-3 text-left">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Unlimited form and event creations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Advanced form customization options</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Company branding and logo integration</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Unlimited form responses and bookings</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Priority support</span>
                </li>
              </ul>
            </div>
            <p className="text-gray-600">
              Your subscription is now {user?.subscriptionStatus}. You can manage your subscription from your account settings.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button
              onClick={() => navigate('/account/subscription')}
              className="flex items-center"
            >
              <List className="h-4 w-4 mr-2" />
              Manage Subscription
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SubscriptionSuccessPage;