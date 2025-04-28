import React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import SubscriptionStatus from '@/components/subscription/SubscriptionStatus';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

const AccountSubscriptionPage = () => {
  const [, navigate] = useLocation();
  
  return (
    <MainLayout>
      <div className="container max-w-3xl py-8">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-4" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Manage Subscription</h1>
        </div>
        
        <div className="space-y-8">
          <SubscriptionStatus />
          
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4 text-blue-700">Subscription Benefits</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center rounded-full bg-blue-100 h-6 w-6 text-blue-600 mr-3 mt-0.5 text-sm">1</span>
                <span>Unlimited form and event creations</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center rounded-full bg-blue-100 h-6 w-6 text-blue-600 mr-3 mt-0.5 text-sm">2</span>
                <span>Advanced form customization options</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center rounded-full bg-blue-100 h-6 w-6 text-blue-600 mr-3 mt-0.5 text-sm">3</span>
                <span>Company branding and logo integration</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center rounded-full bg-blue-100 h-6 w-6 text-blue-600 mr-3 mt-0.5 text-sm">4</span>
                <span>Unlimited form responses and bookings</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center rounded-full bg-blue-100 h-6 w-6 text-blue-600 mr-3 mt-0.5 text-sm">5</span>
                <span>Priority support</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Subscription FAQs</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">What happens after my trial ends?</h3>
                <p className="text-gray-600 text-sm mt-1">
                  After your 7-day trial ends, you'll need to subscribe to continue using premium features.
                  If you don't subscribe, your account will remain but with limited functionality.
                </p>
              </div>
              <div>
                <h3 className="font-medium">How do I cancel my subscription?</h3>
                <p className="text-gray-600 text-sm mt-1">
                  You can cancel your subscription anytime using the "Cancel Subscription" button above.
                  You'll continue to have access until the end of your current billing period.
                </p>
              </div>
              <div>
                <h3 className="font-medium">Can I get a refund?</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Please contact our support team if you have questions about refunds or
                  if you're experiencing any issues with your subscription.
                </p>
              </div>
              <div>
                <h3 className="font-medium">I have other questions about billing</h3>
                <p className="text-gray-600 text-sm mt-1">
                  For any other questions about billing or your subscription, please contact
                  our support team at support@tallys.app
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AccountSubscriptionPage;