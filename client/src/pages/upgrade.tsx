import React, { useState } from "react";
import { 
  Check, Crown, CreditCard, HelpCircle, ArrowRight, CheckCircle, X, Gem 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define our pricing plans
const pricingPlans = [
  {
    id: "free",
    name: "Free",
    description: "For individuals just getting started",
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      "3 forms",
      "100 responses per month",
      "Basic form builder",
      "Email notifications",
      "CSV exports",
    ],
    limitations: [
      "No custom domains",
      "No form logic",
      "No file uploads",
      "No API access",
      "Basic support only",
    ],
    recommended: false,
    cta: "Current Plan",
    disabled: true,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For professionals and small teams",
    price: {
      monthly: 29,
      yearly: 290,
    },
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
    limitations: [],
    recommended: true,
    cta: "Upgrade to Pro",
    disabled: false,
  },
  {
    id: "business",
    name: "Business",
    description: "For growing businesses and teams",
    price: {
      monthly: 79,
      yearly: 790,
    },
    features: [
      "Everything in Pro",
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
    limitations: [],
    recommended: false,
    cta: "Upgrade to Business",
    disabled: false,
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
    answer: "Yes, we offer a 17% discount for annual billing compared to paying monthly. We also offer special discounts for nonprofits and educational institutions. Contact our sales team for details.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards including Visa, Mastercard, American Express, and Discover. We also support payment via PayPal and bank transfers for annual plans.",
  },
];

const Upgrade = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Upgrade Your Plan</h1>
        <p className="text-muted-foreground">
          Choose the right plan for your needs and scale as you grow.
        </p>
      </div>
      
      <div className="flex justify-center mb-8">
        <div className="bg-muted p-1 rounded-lg inline-flex items-center">
          <div className="flex items-center space-x-2 px-4">
            <Label htmlFor="billing-toggle" className="text-sm font-medium">
              {billingCycle === "monthly" ? "Monthly billing" : "Annual billing"}
            </Label>
            <Switch 
              id="billing-toggle" 
              checked={billingCycle === "yearly"}
              onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
            />
          </div>
          {billingCycle === "yearly" && (
            <Badge variant="outline" className="ml-2 bg-green-50 text-green-600 border-green-200">
              Save 17%
            </Badge>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pricingPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${
              plan.recommended ? "border-primary ring-2 ring-primary ring-opacity-25" : ""
            }`}
          >
            {plan.recommended && (
              <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/2">
                <Badge className="bg-primary hover:bg-primary">Most Popular</Badge>
              </div>
            )}
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription className="mt-1">{plan.description}</CardDescription>
                </div>
                {plan.id !== "free" && (
                  <div className="p-2 bg-primary/10 rounded-full">
                    {plan.id === "pro" ? (
                      <Crown className="h-5 w-5 text-primary" />
                    ) : (
                      <Gem className="h-5 w-5 text-primary" />
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">${plan.price[billingCycle]}</span>
                  {plan.price[billingCycle] > 0 && (
                    <span className="text-muted-foreground ml-1">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                  )}
                </div>
                {plan.id === "free" ? (
                  <p className="text-xs text-muted-foreground mt-1">Forever free, no credit card required</p>
                ) : billingCycle === "yearly" ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    ${(plan.price.monthly * 12).toFixed(2)} billed annually
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    Billed monthly, cancel anytime
                  </p>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                
                {plan.limitations.map((limitation, i) => (
                  <div key={i} className="flex items-start text-muted-foreground">
                    <X className="h-4 w-4 text-muted-foreground mr-2 mt-0.5" />
                    <span className="text-sm">{limitation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={plan.id === "free" ? "outline" : "default"}
                disabled={plan.disabled}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
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
                      <th className="text-center py-3 px-4 font-medium">Free</th>
                      <th className="text-center py-3 px-4 font-medium">Pro</th>
                      <th className="text-center py-3 px-4 font-medium">Business</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons.map((item, i) => (
                      <tr 
                        key={i} 
                        className={`border-b ${i % 2 === 0 ? "bg-muted/30" : ""}`}
                      >
                        <td className="text-sm py-3 px-4">{item.feature}</td>
                        <td className="text-center text-sm py-3 px-4">
                          {item.free === "No" ? (
                            <X className="h-4 w-4 text-red-500 mx-auto" />
                          ) : item.free === "Yes" ? (
                            <Check className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            item.free
                          )}
                        </td>
                        <td className="text-center text-sm py-3 px-4">
                          {item.pro === "No" ? (
                            <X className="h-4 w-4 text-red-500 mx-auto" />
                          ) : item.pro === "Yes" ? (
                            <Check className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            item.pro
                          )}
                        </td>
                        <td className="text-center text-sm py-3 px-4">
                          {item.business === "No" ? (
                            <X className="h-4 w-4 text-red-500 mx-auto" />
                          ) : item.business === "Yes" ? (
                            <Check className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            item.business
                          )}
                        </td>
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