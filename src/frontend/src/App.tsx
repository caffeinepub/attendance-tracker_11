import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import type { Employee } from "./backend.d.ts";
import AdminDashboard from "./components/AdminDashboard";
import EnforcerDashboard from "./components/EnforcerDashboard";
import LoginPage from "./components/LoginPage";

export type AppView = "login" | "admin" | "enforcer";

export interface AuthState {
  view: AppView;
  employee: Employee | null;
}

export default function App() {
  const [auth, setAuth] = useState<AuthState>({
    view: "login",
    employee: null,
  });

  const handleAdminLogin = () => {
    setAuth({ view: "admin", employee: null });
  };

  const handleEnforcerLogin = (employee: Employee) => {
    setAuth({ view: "enforcer", employee });
  };

  const handleLogout = () => {
    setAuth({ view: "login", employee: null });
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      {auth.view === "login" && (
        <LoginPage
          onAdminLogin={handleAdminLogin}
          onEnforcerLogin={handleEnforcerLogin}
        />
      )}
      {auth.view === "admin" && <AdminDashboard onLogout={handleLogout} />}
      {auth.view === "enforcer" && auth.employee && (
        <EnforcerDashboard employee={auth.employee} onLogout={handleLogout} />
      )}
    </>
  );
}
