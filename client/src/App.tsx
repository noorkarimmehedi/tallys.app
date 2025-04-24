import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import FormBuilder from "@/pages/form-builder";
import FormPreview from "@/pages/form-preview";
import FormDemo from "@/pages/form-demo";
import Inbox from "@/pages/inbox";
import Settings from "@/pages/settings";
import Calendar from "@/pages/calendar";
import MainLayout from "@/components/layouts/MainLayout";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <MainLayout>
          <Dashboard />
        </MainLayout>
      </Route>
      <Route path="/form-builder/:id?">
        <MainLayout>
          <FormBuilder />
        </MainLayout>
      </Route>
      <Route path="/preview/:id">
        <MainLayout>
          <FormPreview />
        </MainLayout>
      </Route>
      <Route path="/form-demo">
        <MainLayout>
          <FormDemo />
        </MainLayout>
      </Route>
      <Route path="/inbox">
        <MainLayout>
          <Inbox />
        </MainLayout>
      </Route>
      <Route path="/settings">
        <MainLayout>
          <Settings />
        </MainLayout>
      </Route>
      <Route path="/calendar">
        <MainLayout>
          <Calendar />
        </MainLayout>
      </Route>
      <Route path="/f/:shortId">
        <FormPreview />
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
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
