import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  LogOut,
  UserCheck,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AttendanceEntry, Employee } from "../backend.d.ts";
import { useActor } from "../hooks/useActor";

interface EnforcerDashboardProps {
  employee: Employee;
  onLogout: () => void;
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTodayDisplay() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function EnforcerDashboard({
  employee: initialEmployee,
  onLogout,
}: EnforcerDashboardProps) {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const today = getTodayDate();

  // Fresh employee data
  const { data: employee = initialEmployee, isLoading: empLoading } =
    useQuery<Employee>({
      queryKey: ["employee", initialEmployee.employeeId],
      queryFn: async () => {
        if (!actor) return initialEmployee;
        return actor.getEmployee(initialEmployee.employeeId);
      },
      enabled: !!actor && !actorFetching,
    });

  // Check if today is already marked
  const { data: todayMarked, isLoading: todayLoading } = useQuery<boolean>({
    queryKey: ["todayMarked", initialEmployee.employeeId],
    queryFn: async () => {
      if (!actor) return false;
      return actor.getMarkToday(initialEmployee.employeeId, today);
    },
    enabled: !!actor && !actorFetching,
  });

  // Attendance history sorted newest first
  const { data: history = [], isLoading: historyLoading } = useQuery<
    AttendanceEntry[]
  >({
    queryKey: ["history", initialEmployee.employeeId],
    queryFn: async () => {
      if (!actor) return [];
      const raw = await actor.getAttendanceHistory(initialEmployee.employeeId);
      return [...raw].sort((a, b) => (a.date < b.date ? 1 : -1));
    },
    enabled: !!actor && !actorFetching,
  });

  const [markingStatus, setMarkingStatus] = useState<string | null>(null);

  const markMutation = useMutation({
    mutationFn: async (status: string) => {
      if (!actor) throw new Error("No actor");
      await actor.markAttendance(initialEmployee.employeeId, today, status);
    },
    onMutate: (status) => {
      setMarkingStatus(status);
    },
    onSuccess: (_, status) => {
      toast.success(`Marked ${status} for today`);
      queryClient.invalidateQueries({
        queryKey: ["employee", initialEmployee.employeeId],
      });
      queryClient.invalidateQueries({
        queryKey: ["todayMarked", initialEmployee.employeeId],
      });
      queryClient.invalidateQueries({
        queryKey: ["history", initialEmployee.employeeId],
      });
      setMarkingStatus(null);
    },
    onError: () => {
      toast.error("Failed to mark attendance. Please try again.");
      setMarkingStatus(null);
    },
  });

  const leavesUsed = Number(employee.leavesUsed);
  const leavesRemaining = Number(employee.leavesRemaining);
  const totalLeaves = 15;
  const leaveProgressPercent = (leavesUsed / totalLeaves) * 100;

  const leaveColor =
    leavesRemaining > 5
      ? "oklch(0.52 0.15 145)"
      : leavesRemaining >= 1
        ? "oklch(0.55 0.18 65)"
        : "oklch(0.55 0.22 27)";

  const todayEntry = history.find((e) => e.date === today);
  const isAlreadyMarked = todayMarked || !!todayEntry;
  const todayStatus = todayEntry?.status;

  const isLoading = empLoading || todayLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Enforcer Header */}
      <header
        className="text-white sticky top-0 z-30"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.25 0.08 220), oklch(0.2 0.06 235))",
          borderBottom: "1px solid oklch(1 0 0 / 0.08)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm"
              style={{
                background: "oklch(0.65 0.14 240 / 0.25)",
                border: "1px solid oklch(0.65 0.14 240 / 0.4)",
              }}
            >
              {employee.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display font-bold text-base leading-tight">
                {employee.name}
              </h1>
              <p
                className="text-xs font-mono"
                style={{ color: "oklch(0.75 0.03 240)" }}
              >
                ID: {employee.employeeId}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5"
            data-ocid="enforcer.logout_button"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Leave Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="sm:col-span-1"
          >
            <Card
              className="border shadow-xs h-full"
              data-ocid="enforcer.leave_balance_card"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display text-muted-foreground">
                  Leave Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span
                        className="text-4xl font-display font-bold"
                        style={{ color: leaveColor }}
                      >
                        {leavesRemaining}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / {totalLeaves}
                      </span>
                    </div>
                    <Progress
                      value={leaveProgressPercent}
                      className="h-2 mb-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{leavesUsed} used</span>
                      <span>{leavesRemaining} remaining</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Mark Attendance Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="sm:col-span-2"
          >
            <Card className="border shadow-xs h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Today's Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  {formatTodayDisplay()}
                </p>

                {isLoading ? (
                  <div className="space-y-2" data-ocid="enforcer.loading_state">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : isAlreadyMarked ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 border"
                    style={{
                      background:
                        todayStatus === "Present"
                          ? "oklch(0.52 0.15 145 / 0.08)"
                          : "oklch(0.55 0.22 27 / 0.08)",
                      borderColor:
                        todayStatus === "Present"
                          ? "oklch(0.52 0.15 145 / 0.25)"
                          : "oklch(0.55 0.22 27 / 0.25)",
                    }}
                    data-ocid="enforcer.already_marked_state"
                  >
                    {todayStatus === "Present" ? (
                      <CheckCircle
                        className="w-5 h-5 flex-shrink-0"
                        style={{ color: "oklch(0.52 0.15 145)" }}
                      />
                    ) : todayStatus === "Absent" ? (
                      <XCircle
                        className="w-5 h-5 flex-shrink-0"
                        style={{ color: "oklch(0.55 0.22 27)" }}
                      />
                    ) : (
                      <Clock className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-semibold">
                        {todayStatus
                          ? `Marked as ${todayStatus}`
                          : "Attendance already marked"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Attendance already recorded for today
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex gap-3">
                    <TooltipProvider>
                      <Button
                        className="flex-1 gap-2 h-10"
                        onClick={() => markMutation.mutate("Present")}
                        disabled={markMutation.isPending}
                        style={{
                          background: "oklch(0.52 0.15 145)",
                          color: "white",
                        }}
                        data-ocid="enforcer.mark_present_button"
                      >
                        {markingStatus === "Present" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Mark Present
                      </Button>

                      {employee.leavesRemaining === 0n ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex-1">
                              <Button
                                className="w-full gap-2 h-10"
                                variant="outline"
                                disabled
                                style={{
                                  borderColor: "oklch(0.55 0.22 27 / 0.3)",
                                  color: "oklch(0.55 0.22 27 / 0.5)",
                                }}
                                data-ocid="enforcer.mark_absent_button"
                              >
                                <XCircle className="w-4 h-4" />
                                Mark Absent
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>No leaves remaining</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Button
                          className="flex-1 gap-2 h-10"
                          variant="outline"
                          onClick={() => markMutation.mutate("Absent")}
                          disabled={markMutation.isPending}
                          style={{
                            borderColor: "oklch(0.55 0.22 27 / 0.4)",
                            color: "oklch(0.55 0.22 27)",
                          }}
                          data-ocid="enforcer.mark_absent_button"
                        >
                          {markingStatus === "Absent" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          Mark Absent
                        </Button>
                      )}
                    </TooltipProvider>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Attendance History */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.16 }}
        >
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Attendance History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {historyLoading ? (
                <div
                  className="space-y-2"
                  data-ocid="enforcer.history_loading_state"
                >
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-md" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div
                  className="text-center py-10 text-muted-foreground"
                  data-ocid="enforcer.history.empty_state"
                >
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">
                    No attendance records yet
                  </p>
                  <p className="text-xs mt-1">
                    Mark your attendance to see history here
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-ocid="enforcer.attendance_table">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Date</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((entry, idx) => (
                        <TableRow
                          key={entry.date}
                          className="hover:bg-muted/40 transition-colors"
                          data-ocid={`enforcer.attendance_row.${idx + 1}`}
                        >
                          <TableCell className="text-sm font-mono py-2.5">
                            {formatDate(entry.date)}
                          </TableCell>
                          <TableCell className="py-2.5">
                            {entry.status === "Present" ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold leave-badge-green rounded-full px-2.5 py-0.5">
                                <CheckCircle className="w-3 h-3" />
                                Present
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold leave-badge-red rounded-full px-2.5 py-0.5">
                                <XCircle className="w-3 h-3" />
                                Absent
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-4 border-t text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
