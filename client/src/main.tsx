import { createRoot } from "react-dom/client";
import { AuthProvider as FirebaseAuthProvider } from "@/hooks/use-firebase-auth";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <FirebaseAuthProvider>
    <App />
  </FirebaseAuthProvider>
);
