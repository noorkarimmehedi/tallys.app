import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import FormBuilder from "@/pages/form-builder";
import FormPreview from "@/pages/form-preview";
import FormDetails from "@/pages/form-details";
import EventBuilder from "@/pages/event-builder-weekly";
import EventBuilderNew from "@/pages/event-builder-new";
import EventBooking from "@/pages/event-booking";
import Inbox from "@/pages/inbox";
import Settings from "@/pages/settings";
import Calendar from "@/pages/calendar";
import DemoAccordion from "@/pages/demo-accordion";
import MainLayout from "@/components/layouts/MainLayout";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "@/components/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

// Subscription-related pages
import CheckoutPage from "@/pages/subscription/checkout";
import SubscriptionSuccessPage from "@/pages/subscription/success";
import AccountSubscriptionPage from "@/pages/account/subscription";

// Wrapper for protected routes with MainLayout
const ProtectedPage = ({ component: Component }: { component: React.ComponentType }) => {
  return (
    <MainLayout>
      <Component />
    </MainLayout>
  );
};

function Router() {
  return (
    <Switch>
      {/* Protected Routes */}
      <ProtectedRoute path="/" component={() => (
        <MainLayout>
          <Dashboard />
        </MainLayout>
      )} />
      
      <ProtectedRoute path="/dashboard" component={() => (
        <MainLayout>
          <Dashboard />
        </MainLayout>
      )} />
      
      <ProtectedRoute path="/form-builder/:id?" component={() => (
        <MainLayout>
          <FormBuilder />
        </MainLayout>
      )} />
      
      <ProtectedRoute path="/preview/:id" component={() => (
        <MainLayout>
          <FormPreview />
        </MainLayout>
      )} />
      
      <ProtectedRoute path="/form-details/:id" component={() => (
        <MainLayout>
          <FormDetails />
        </MainLayout>
      )} />
      
      <ProtectedRoute path="/inbox" component={() => (
        <MainLayout>
          <Inbox />
        </MainLayout>
      )} />
      
      <ProtectedRoute path="/settings" component={() => (
        <MainLayout>
          <Settings />
        </MainLayout>
      )} />
      
      <ProtectedRoute path="/calendar" component={() => (
        <MainLayout>
          <Calendar />
        </MainLayout>
      )} />
      
      <ProtectedRoute path="/event-builder/new" component={() => (
        <MainLayout>
          <EventBuilderNew />
        </MainLayout>
      )} />

      <ProtectedRoute path="/event-builder/:id" component={() => (
        <MainLayout>
          <EventBuilder />
        </MainLayout>
      )} />
      
      {/* Subscription Routes */}
      <ProtectedRoute path="/subscription/checkout" component={CheckoutPage} />
      <ProtectedRoute path="/subscription/success" component={SubscriptionSuccessPage} />
      <ProtectedRoute path="/account/subscription" component={AccountSubscriptionPage} />
      
      {/* Public Routes */}
      <Route path="/auth">
        <AuthPage />
      </Route>
      
      <Route path="/f/:shortId">
        <FormPreview />
      </Route>
      
      <Route path="/e/:shortId">
        <EventBooking />
      </Route>
      
      <Route path="/demo-accordion">
        <DemoAccordion />
      </Route>
      
      <Route>
        <MainLayout>
          <NotFound />
        </MainLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
