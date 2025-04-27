import { useAuth } from "@/hooks/use-auth";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({
  path,
  component: Component,
}: ProtectedRouteProps) {
  const { user, isLoading: isDbLoading } = useAuth();
  const { currentUser, loading: isFirebaseLoading } = useFirebaseAuth();
  
  const isLoading = isDbLoading || isFirebaseLoading;
  const isAuthenticated = user || currentUser;

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  return (
    <Route path={path}>
      {isAuthenticated ? <Component /> : <Redirect to="/auth" />}
    </Route>
  );
}