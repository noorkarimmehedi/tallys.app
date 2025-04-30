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
import { AuthProvider as FirebaseAuthProvider } from "@/hooks/use-firebase-auth";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import PlaceholderPage from "@/pages/placeholder-page";
import WorkspacePage from "@/pages/workspace-page";
import Members from "@/pages/members";
import Domains from "@/pages/domains-fixed";
import Upgrade from "@/pages/upgrade";

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
      
      {/* Account Section Routes */}
      <ProtectedRoute path="/members" component={() => (
        <MainLayout>
          <Members />
        </MainLayout>
      )} />
      
      <ProtectedRoute path="/domains" component={() => (
        <MainLayout>
          <Domains />
        </MainLayout>
      )} />
      
      <ProtectedRoute path="/upgrade" component={() => (
        <MainLayout>
          <Upgrade />
        </MainLayout>
      )} />
      
      {/* Workspace Section Routes */}
      <ProtectedRoute path="/workspace" component={() => (
        <MainLayout>
          <WorkspacePage />
        </MainLayout>
      )} />
      
      {/* Product Section Routes */}
      <ProtectedRoute path="/templates" component={() => (
        <MainLayout>
          <PlaceholderPage title="Templates" description="Browse and use pre-designed templates for forms and events" />
        </MainLayout>
      )} />
      
      <ProtectedRoute path="/whats-new" component={() => (
        <MainLayout>
          <PlaceholderPage title="What's New" description="Discover the latest features and updates" />
        </MainLayout>
      )} />
      
      <ProtectedRoute path="/feature-requests" component={() => (
        <MainLayout>
          <PlaceholderPage title="Feature Requests" description="Submit and vote on feature requests for the platform" />
        </MainLayout>
      )} />
      
      <ProtectedRoute path="/trash" component={() => (
        <MainLayout>
          <PlaceholderPage title="Trash" description="View and restore deleted items" />
        </MainLayout>
      )} />
      
      {/* Help Section Routes */}
      <ProtectedRoute path="/support" component={() => (
        <MainLayout>
          <PlaceholderPage title="Contact Support" description="Get help from our support team" />
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
      <FirebaseAuthProvider>
        <AuthProvider>
          <WorkspaceProvider>
            <TooltipProvider>
              <Router />
              <Toaster />
            </TooltipProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </FirebaseAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
