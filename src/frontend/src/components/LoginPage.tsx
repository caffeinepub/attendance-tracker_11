import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Loader2, ShieldCheck, UserCheck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Employee } from "../backend.d.ts";
import { useActor } from "../hooks/useActor";

interface LoginPageProps {
  onAdminLogin: () => void;
  onEnforcerLogin: (employee: Employee) => void;
}

const ADMIN_CREDENTIALS = [
  { username: "Raghav", password: "Border@4321" },
  { username: "Kayan", password: "password" },
];

export default function LoginPage({
  onAdminLogin,
  onEnforcerLogin,
}: LoginPageProps) {
  const { actor } = useActor();

  // Admin form
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  // Enforcer form
  const [employeeId, setEmployeeId] = useState("");
  const [enforcerError, setEnforcerError] = useState("");
  const [enforcerLoading, setEnforcerLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    setAdminLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    if (
      ADMIN_CREDENTIALS.some(
        (c) => c.username === adminUsername && c.password === adminPassword,
      )
    ) {
      onAdminLogin();
    } else {
      setAdminError("Invalid username or password.");
    }
    setAdminLoading(false);
  };

  const handleEnforcerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnforcerError("");
    if (!employeeId.trim()) {
      setEnforcerError("Please enter your Employee ID.");
      return;
    }
    setEnforcerLoading(true);
    try {
      if (!actor) {
        setEnforcerError("System not ready. Please try again.");
        return;
      }
      const employee = await actor.getEmployee(employeeId.trim());
      onEnforcerLogin(employee);
    } catch {
      setEnforcerError("Employee not found. Please check your ID.");
    } finally {
      setEnforcerLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.2 0.07 258), oklch(0.15 0.055 265) 60%, oklch(0.18 0.04 250))",
      }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(oklch(1 0 0 / 0.04) 1px, transparent 1px),
            linear-gradient(90deg, oklch(1 0 0 / 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4"
            style={{
              background: "oklch(0.65 0.14 240 / 0.2)",
              border: "1px solid oklch(0.65 0.14 240 / 0.4)",
            }}
          >
            <ShieldCheck className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Attendance Tracker
          </h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.75 0.03 240)" }}>
            Secure workforce management system
          </p>
        </div>

        <Card
          className="border-0 shadow-2xl"
          style={{ background: "oklch(0.98 0.005 240)" }}
        >
          <CardHeader className="pb-3">
            <CardTitle
              className="text-xl font-display text-center"
              style={{ color: "oklch(0.18 0.06 255)" }}
            >
              Sign In
            </CardTitle>
            <CardDescription className="text-center text-xs">
              Choose your role to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="enforcer" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger
                  value="enforcer"
                  className="text-sm font-medium"
                  data-ocid="login.enforcer_tab"
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                  Employee
                </TabsTrigger>
                <TabsTrigger
                  value="admin"
                  className="text-sm font-medium"
                  data-ocid="login.admin_tab"
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  Admin
                </TabsTrigger>
              </TabsList>

              {/* Employee Login */}
              <TabsContent value="enforcer">
                <form onSubmit={handleEnforcerLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="employee-id"
                      className="text-sm font-medium"
                    >
                      Employee ID
                    </Label>
                    <Input
                      id="employee-id"
                      placeholder="Enter your employee ID"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      autoComplete="username"
                      data-ocid="login.employee_id_input"
                      className="h-10"
                    />
                  </div>

                  {enforcerError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-md px-3 py-2"
                      data-ocid="login.error_state"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {enforcerError}
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-10 font-medium"
                    disabled={enforcerLoading}
                    data-ocid="login.submit_button"
                  >
                    {enforcerLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Sign In as Employee"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Admin Login */}
              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="admin-username"
                      className="text-sm font-medium"
                    >
                      Username
                    </Label>
                    <Input
                      id="admin-username"
                      placeholder="Admin username"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      autoComplete="username"
                      data-ocid="login.username_input"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="admin-password"
                      className="text-sm font-medium"
                    >
                      Password
                    </Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Admin password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      autoComplete="current-password"
                      data-ocid="login.password_input"
                      className="h-10"
                    />
                  </div>

                  {adminError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-md px-3 py-2"
                      data-ocid="login.error_state"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {adminError}
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-10 font-medium"
                    disabled={adminLoading}
                    data-ocid="login.submit_button"
                  >
                    {adminLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      "Sign In as Admin"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p
          className="text-center mt-6 text-xs"
          style={{ color: "oklch(0.6 0.02 240)" }}
        >
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
