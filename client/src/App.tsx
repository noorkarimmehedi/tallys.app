import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import FormBuilder from "@/pages/form-builder";
import FormPreview from "@/pages/form-preview";
import EventBuilder from "@/pages/event-builder-new";
import Inbox from "@/pages/inbox";
import Settings from "@/pages/settings";
import Calendar from "@/pages/calendar";
import DemoAccordion from "@/pages/demo-accordion";
import MainLayout from "@/components/layouts/MainLayout";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "@/components/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

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
      
      <ProtectedRoute path="/event-builder/:id?" component={EventBuilder} />
      
      {/* Public Routes */}
      <Route path="/auth">
        <AuthPage />
      </Route>
      
      <Route path="/f/:shortId">
        <FormPreview />
      </Route>
      
      <Route path="/e/:shortId">
        {(params) => (
          <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <h1 className="text-2xl font-bold mb-4">Event Booking</h1>
              <p className="text-gray-600 mb-2">This is a placeholder for the event booking page.</p>
              <p className="text-gray-600">Event ID: <span className="font-mono">{params.shortId}</span></p>
            </div>
          </div>
        )}
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
