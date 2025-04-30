import React from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Pricing } from "@/components/ui/pricing";

// Define the pricing plans using the new structure
const pricingPlans = [
  {
    name: "STARTER",
    price: "0",
    yearlyPrice: "0",
    period: "per month",
    features: [
      "3 forms",
      "100 responses per month",
      "Basic form builder",
      "Email notifications",
      "CSV exports",
    ],
    description: "Perfect for individuals and small projects",
    buttonText: "Current Plan",
    href: "#",
    isPopular: false,
  },
  {
    name: "PROFESSIONAL",
    price: "19",
    yearlyPrice: "15",
    period: "per month",
    features: [
      "Unlimited forms",
      "5,000 responses per month",
      "Advanced form logic",
      "File uploads (100MB)",
      "Custom domains",
      "Remove branding",
      "Team collaboration (up to 3)",
      "Priority support",
    ],
    description: "Ideal for growing teams and businesses",
    buttonText: "Upgrade to Pro",
    href: "/subscription/checkout",
    isPopular: true,
  },
  {
    name: "ENTERPRISE",
    price: "79",
    yearlyPrice: "63",
    period: "per month",
    features: [
      "Everything in Professional",
      "Unlimited responses",
      "Unlimited file uploads (500MB)",
      "Team collaboration (up to 10)",
      "Advanced analytics",
      "Custom subdomain",
      "API access",
      "Webhooks integration",
      "Priority support",
      "Dedicated account manager",
    ],
    description: "For large organizations with specific needs",
    buttonText: "Contact Sales",
    href: "/contact",
    isPopular: false,
  },
];

const comparisons = [
  {
    feature: "Forms",
    free: "3 forms",
    pro: "Unlimited",
    business: "Unlimited",
  },
  {
    feature: "Responses",
    free: "100/month",
    pro: "5,000/month",
    business: "Unlimited",
  },
  {
    feature: "File uploads",
    free: "No",
    pro: "100MB total",
    business: "500MB total",
  },
  {
    feature: "Custom domains",
    free: "No",
    pro: "Yes (1)",
    business: "Yes (unlimited)",
  },
  {
    feature: "Form logic",
    free: "Basic",
    pro: "Advanced",
    business: "Advanced",
  },
  {
    feature: "Team members",
    free: "1",
    pro: "Up to 3",
    business: "Up to 10",
  },
  {
    feature: "Integrations",
    free: "None",
    pro: "3 integrations",
    business: "Unlimited",
  },
  {
    feature: "API access",
    free: "No",
    pro: "Limited",
    business: "Full access",
  },
  {
    feature: "Support",
    free: "Email only",
    pro: "Priority email",
    business: "Priority + phone",
  },
];

const faqs = [
  {
    question: "What happens if I exceed my plan's limits?",
    answer: "When you exceed your plan's form or response limits, you'll be notified via email. You won't lose any data, but you'll need to upgrade to continue collecting new responses until the next billing cycle.",
  },
  {
    question: "Can I change plans at any time?",
    answer: "Yes, you can upgrade your plan at any time. When you upgrade, you'll be billed the prorated amount for the remainder of your current billing cycle. If you downgrade, the new plan will take effect at the end of your current billing cycle.",
  },
  {
    question: "Is there a contract or commitment?",
    answer: "No, there's no contract required. You can cancel your subscription at any time, and your plan will remain active until the end of your current billing cycle.",
  },
  {
    question: "Do you offer any discounts?",
    answer: "Yes, we offer a 20% discount for annual billing compared to paying monthly. We also offer special discounts for nonprofits and educational institutions. Contact our sales team for details.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards including Visa, Mastercard, American Express, and Discover. We also support payment via PayPal for annual plans.",
  },
];

const Upgrade = () => {
  return (
    <div className="space-y-8">
      {/* New Pricing Component */}
      <Pricing 
        plans={pricingPlans}
        title="Choose Your Plan"
        description="Upgrade to unlock powerful features and grow your business.
All plans include core features, unlimited storage, and dedicated support."
      />
      
      <Tabs defaultValue="comparison" className="mt-12">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
          <TabsTrigger value="comparison">Plan Comparison</TabsTrigger>
          <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="comparison" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan Comparison</CardTitle>
              <CardDescription>
                Compare features across different plans to find the right fit for your needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Feature</th>
                      <th className="text-center py-3 px-4 font-medium">Starter</th>
                      <th className="text-center py-3 px-4 font-medium">Professional</th>
                      <th className="text-center py-3 px-4 font-medium">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons.map((item, i) => (
                      <tr 
                        key={i} 
                        className={`border-b ${i % 2 === 0 ? "bg-muted/30" : ""}`}
                      >
                        <td className="text-sm py-3 px-4">{item.feature}</td>
                        <td className="text-center text-sm py-3 px-4">{item.free}</td>
                        <td className="text-center text-sm py-3 px-4">{item.pro}</td>
                        <td className="text-center text-sm py-3 px-4">{item.business}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="faq" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Get answers to common questions about our pricing plans.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-sm font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="bg-muted rounded-lg p-6 text-center mt-8">
        <h3 className="text-lg font-medium mb-2">Need a custom plan?</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          Contact our sales team to discuss a custom plan tailored to your organization's specific needs.
        </p>
        <Button variant="outline" className="gap-2">
          <CreditCard className="h-4 w-4" />
          <span>Contact Sales</span>
        </Button>
      </div>
    </div>
  );
};

export default Upgrade;