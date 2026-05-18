import { createRoot } from "react-dom/client";
import { AuthProvider } from "@/auth/AuthContext";
import { Toaster } from "sonner";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
    <Toaster position="top-right" richColors closeButton />
  </AuthProvider>
);
