import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import FormBuilder from "@/pages/form-builder";
import FormPreview from "@/pages/form-preview";
import Inbox from "@/pages/inbox";
import Settings from "@/pages/settings";
import Calendar from "@/pages/calendar";
import MainLayout from "@/components/layouts/MainLayout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/form-builder/:id?" component={FormBuilder} />
      <Route path="/preview/:id" component={FormPreview} />
      <Route path="/inbox" component={Inbox} />
      <Route path="/settings" component={Settings} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/f/:shortId" component={FormPreview} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MainLayout>
          <Router />
        </MainLayout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
