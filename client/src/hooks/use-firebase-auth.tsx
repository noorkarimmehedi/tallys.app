import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getIdToken
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Authenticate with backend when Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Get the Firebase ID token
          const idToken = await getIdToken(user);
          
          // Authenticate with our backend
          await apiRequest('POST', '/api/firebase-auth', { idToken });
          
          // Refresh user data in React Query cache
          queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        } catch (error) {
          console.error('Error authenticating with backend:', error);
          toast({
            title: "Authentication Error",
            description: "There was a problem connecting to the server.",
            variant: "destructive",
          });
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [toast]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });
    } catch (error) {
      console.error("Error signing in with Google", error);
      toast({
        title: "Sign in failed",
        description: "There was a problem signing in with Google.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // First logout from our backend
      await apiRequest('POST', '/api/logout');
      
      // Then logout from Firebase
      await firebaseSignOut(auth);
      
      // Invalidate user data in cache
      queryClient.setQueryData(['/api/user'], null);
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out.",
      });
    } catch (error) {
      console.error("Error signing out", error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing out.",
        variant: "destructive",
      });
    }
  };

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useFirebaseAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useFirebaseAuth must be used within an AuthProvider");
  }
  return context;
}