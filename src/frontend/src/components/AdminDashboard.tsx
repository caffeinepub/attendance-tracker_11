import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Edit2,
  Eye,
  Loader2,
  LogOut,
  Plus,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { AttendanceEntry, Employee } from "../backend.d.ts";
import { useActor } from "../hooks/useActor";

interface AdminDashboardProps {
  onLogout: () => void;
}

type DashboardView = "overview" | "detail";

function getLeaveBadgeClass(remaining: bigint) {
  const n = Number(remaining);
  if (n > 5) return "leave-badge-green";
  if (n >= 1) return "leave-badge-yellow";
  return "leave-badge-red";
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

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const [dashView, setDashView] = useState<DashboardView>("overview");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceEntry[]>(
    [],
  );
  const [historyLoading, setHistoryLoading] = useState(false);

  // Dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Employee | null>(null);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [overrideEntry, setOverrideEntry] = useState<AttendanceEntry | null>(
    null,
  );
  const [addNewDateDialogOpen, setAddNewDateDialogOpen] = useState(false);

  // Add employee form
  const [newName, setNewName] = useState("");
  const [newEmpId, setNewEmpId] = useState("");

  // Override form
  const [overrideStatus, setOverrideStatus] = useState<string>("Present");

  // New date form
  const [newDate, setNewDate] = useState(getTodayDate());
  const [newDateStatus, setNewDateStatus] = useState<string>("Present");

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEmployees();
    },
    enabled: !!actor && !actorFetching,
  });

  // Stats
  const today = getTodayDate();
  const totalPresent = employees.reduce((count, emp) => {
    const todayEntry = emp.attendanceHistory.find((e) => e.date === today);
    return count + (todayEntry?.status === "Present" ? 1 : 0);
  }, 0);
  const totalAbsent = employees.reduce((count, emp) => {
    const todayEntry = emp.attendanceHistory.find((e) => e.date === today);
    return count + (todayEntry?.status === "Absent" ? 1 : 0);
  }, 0);
  const zeroLeaves = employees.filter((e) => e.leavesRemaining === 0n).length;

  const addMutation = useMutation({
    mutationFn: async ({
      name,
      employeeId,
    }: { name: string; employeeId: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.addEmployee({ name, employeeId });
    },
    onSuccess: () => {
      toast.success("Employee added successfully");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setAddDialogOpen(false);
      setNewName("");
      setNewEmpId("");
    },
    onError: () => toast.error("Failed to add employee"),
  });

  const removeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      if (!actor) throw new Error("No actor");
      await actor.removeEmployee(employeeId);
    },
    onSuccess: () => {
      toast.success("Employee removed");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setRemoveDialogOpen(false);
      setRemoveTarget(null);
    },
    onError: () => toast.error("Failed to remove employee"),
  });

  const overrideMutation = useMutation({
    mutationFn: async ({
      employeeId,
      date,
      status,
    }: {
      employeeId: string;
      date: string;
      status: string;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.overrideAttendance(employeeId, date, status);
    },
    onSuccess: async () => {
      toast.success("Attendance updated");
      setOverrideDialogOpen(false);
      setOverrideEntry(null);
      if (selectedEmployee) {
        await refreshHistory(selectedEmployee.employeeId);
        queryClient.invalidateQueries({ queryKey: ["employees"] });
      }
    },
    onError: () => toast.error("Failed to update attendance"),
  });

  const addDateMutation = useMutation({
    mutationFn: async ({
      employeeId,
      date,
      status,
    }: {
      employeeId: string;
      date: string;
      status: string;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.overrideAttendance(employeeId, date, status);
    },
    onSuccess: async () => {
      toast.success("Attendance entry added");
      setAddNewDateDialogOpen(false);
      setNewDate(getTodayDate());
      setNewDateStatus("Present");
      if (selectedEmployee) {
        await refreshHistory(selectedEmployee.employeeId);
        queryClient.invalidateQueries({ queryKey: ["employees"] });
      }
    },
    onError: () => toast.error("Failed to add attendance entry"),
  });

  const refreshHistory = async (empId: string) => {
    if (!actor) return;
    setHistoryLoading(true);
    try {
      const history = await actor.getAttendanceHistory(empId);
      const sorted = [...history].sort((a, b) => (a.date < b.date ? 1 : -1));
      setAttendanceHistory(sorted);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleViewAttendance = async (emp: Employee) => {
    setSelectedEmployee(emp);
    setDashView("detail");
    await refreshHistory(emp.employeeId);
  };

  const handleBack = () => {
    setDashView("overview");
    setSelectedEmployee(null);
    setAttendanceHistory([]);
  };

  const handleRemoveClick = (emp: Employee) => {
    setRemoveTarget(emp);
    setRemoveDialogOpen(true);
  };

  const handleOverrideClick = (entry: AttendanceEntry) => {
    setOverrideEntry(entry);
    setOverrideStatus(entry.status);
    setOverrideDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="admin-header text-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg"
              style={{
                background: "oklch(1 0 0 / 0.12)",
                border: "1px solid oklch(1 0 0 / 0.2)",
              }}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight">
                Admin Dashboard
              </h1>
              <p className="text-xs" style={{ color: "oklch(0.8 0.03 240)" }}>
                Welcome, Raghav
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5"
            data-ocid="admin.logout_button"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          {dashView === "overview" ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
            >
              {/* Stats bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  {
                    label: "Total Employees",
                    value: employees.length,
                    icon: Users,
                    color: "oklch(0.52 0.18 255)",
                  },
                  {
                    label: "Present Today",
                    value: totalPresent,
                    icon: CheckCircle,
                    color: "oklch(0.52 0.15 145)",
                  },
                  {
                    label: "Absent Today",
                    value: totalAbsent,
                    icon: XCircle,
                    color: "oklch(0.55 0.22 27)",
                  },
                  {
                    label: "No Leaves Left",
                    value: zeroLeaves,
                    icon: AlertTriangle,
                    color: "oklch(0.65 0.18 65)",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card className="stat-card-gradient border shadow-xs">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">
                              {stat.label}
                            </p>
                            <p
                              className="text-2xl font-display font-bold mt-0.5"
                              style={{ color: stat.color }}
                            >
                              {isLoading ? "—" : stat.value}
                            </p>
                          </div>
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                            style={{
                              background: `${stat.color.replace(")", " / 0.1)")}`,
                            }}
                          >
                            <stat.icon
                              className="w-4 h-4"
                              style={{ color: stat.color }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Employee Management */}
              <Card className="border shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <CardTitle className="text-base font-display flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Employee Management
                    </CardTitle>
                    <Button
                      size="sm"
                      className="gap-1.5 h-8 text-sm"
                      onClick={() => setAddDialogOpen(true)}
                      data-ocid="admin.add_employee_button"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Add Employee
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {isLoading ? (
                    <div className="space-y-2" data-ocid="admin.loading_state">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full rounded-md" />
                      ))}
                    </div>
                  ) : employees.length === 0 ? (
                    <div
                      className="text-center py-12 text-muted-foreground"
                      data-ocid="admin.employee_table.empty_state"
                    >
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="font-medium text-sm">No employees yet</p>
                      <p className="text-xs mt-1">
                        Add your first employee to get started
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table data-ocid="admin.employee_table">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Name</TableHead>
                            <TableHead className="text-xs">
                              Employee ID
                            </TableHead>
                            <TableHead className="text-xs text-center">
                              Leaves Used
                            </TableHead>
                            <TableHead className="text-xs text-center">
                              Leaves Remaining
                            </TableHead>
                            <TableHead className="text-xs text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {employees.map((emp, idx) => (
                            <TableRow
                              key={emp.employeeId}
                              className="hover:bg-muted/40 transition-colors"
                              data-ocid={`admin.employee_row.${idx + 1}`}
                            >
                              <TableCell className="font-medium text-sm py-3">
                                {emp.name}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground font-mono">
                                {emp.employeeId}
                              </TableCell>
                              <TableCell className="text-center text-sm">
                                {Number(emp.leavesUsed)}
                              </TableCell>
                              <TableCell className="text-center">
                                <span
                                  className={`inline-flex items-center justify-center rounded-full text-xs font-semibold px-2.5 py-0.5 ${getLeaveBadgeClass(emp.leavesRemaining)}`}
                                >
                                  {Number(emp.leavesRemaining)} / 15
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs gap-1"
                                    onClick={() => handleViewAttendance(emp)}
                                    data-ocid={`admin.view_attendance_button.${idx + 1}`}
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    View
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleRemoveClick(emp)}
                                    data-ocid={`admin.remove_button.${idx + 1}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Remove
                                  </Button>
                                </div>
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
          ) : (
            /* Attendance Detail View */
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-4 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="gap-1.5 h-8 px-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-muted-foreground">
                  Attendance —{" "}
                  <span className="font-semibold text-foreground">
                    {selectedEmployee?.name}
                  </span>
                </span>
              </div>

              {/* Employee summary card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <Card className="sm:col-span-2 stat-card-gradient border shadow-xs">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-base"
                      style={{
                        background: "oklch(0.52 0.18 255 / 0.15)",
                        color: "oklch(0.52 0.18 255)",
                        border: "1px solid oklch(0.52 0.18 255 / 0.25)",
                      }}
                    >
                      {selectedEmployee?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-display font-bold text-base">
                        {selectedEmployee?.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        ID: {selectedEmployee?.employeeId}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border shadow-xs">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      Leave Balance
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={"text-2xl font-display font-bold"}
                        style={{
                          color:
                            Number(selectedEmployee?.leavesRemaining ?? 0) > 5
                              ? "oklch(0.52 0.15 145)"
                              : Number(
                                    selectedEmployee?.leavesRemaining ?? 0,
                                  ) >= 1
                                ? "oklch(0.55 0.18 65)"
                                : "oklch(0.55 0.22 27)",
                        }}
                      >
                        {Number(selectedEmployee?.leavesRemaining ?? 0)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / 15 remaining
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base font-display">
                      Attendance History
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 h-8 text-xs"
                      onClick={() => setAddNewDateDialogOpen(true)}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Entry
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {historyLoading ? (
                    <div
                      className="space-y-2"
                      data-ocid="admin.history_loading_state"
                    >
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-md" />
                      ))}
                    </div>
                  ) : attendanceHistory.length === 0 ? (
                    <div
                      className="text-center py-10 text-muted-foreground"
                      data-ocid="admin.history.empty_state"
                    >
                      <p className="text-sm font-medium">
                        No attendance records
                      </p>
                      <p className="text-xs mt-1">
                        No entries found for this employee
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Date</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="text-xs text-right">
                              Action
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attendanceHistory.map((entry, idx) => (
                            <TableRow
                              key={entry.date}
                              className="hover:bg-muted/40"
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
                              <TableCell className="text-right py-2.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs gap-1"
                                  onClick={() => handleOverrideClick(entry)}
                                  data-ocid={
                                    idx === 0
                                      ? "admin.override_button.1"
                                      : undefined
                                  }
                                >
                                  <Edit2 className="w-3 h-3" />
                                  Override
                                </Button>
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
          )}
        </AnimatePresence>
      </main>

      {/* Add Employee Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent data-ocid="admin.add_employee_dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Employee</DialogTitle>
            <DialogDescription>
              Enter the employee details below to add them to the system.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newName.trim() || !newEmpId.trim()) return;
              addMutation.mutate({
                name: newName.trim(),
                employeeId: newEmpId.trim(),
              });
            }}
            className="space-y-4 pt-1"
          >
            <div className="space-y-1.5">
              <Label htmlFor="new-name">Full Name</Label>
              <Input
                id="new-name"
                placeholder="e.g. Priya Sharma"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                data-ocid="admin.employee_name_input"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-empid">Employee ID</Label>
              <Input
                id="new-empid"
                placeholder="e.g. EMP-001"
                value={newEmpId}
                onChange={(e) => setNewEmpId(e.target.value)}
                data-ocid="admin.employee_id_input"
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddDialogOpen(false)}
                data-ocid="admin.add_employee_cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addMutation.isPending}
                data-ocid="admin.add_employee_submit_button"
              >
                {addMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Employee"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Remove Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent data-ocid="admin.confirm_remove_dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Remove Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <strong>{removeTarget?.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setRemoveDialogOpen(false)}
              data-ocid="admin.cancel_remove_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                removeTarget && removeMutation.mutate(removeTarget.employeeId)
              }
              disabled={removeMutation.isPending}
              data-ocid="admin.confirm_remove_button"
            >
              {removeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Employee"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Override Dialog */}
      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent data-ocid="admin.override_dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              Override Attendance
            </DialogTitle>
            <DialogDescription>
              Change attendance status for{" "}
              <strong>
                {overrideEntry ? formatDate(overrideEntry.date) : ""}
              </strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={overrideStatus} onValueChange={setOverrideStatus}>
                <SelectTrigger data-ocid="admin.override_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setOverrideDialogOpen(false)}
              data-ocid="admin.override_cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selectedEmployee || !overrideEntry) return;
                overrideMutation.mutate({
                  employeeId: selectedEmployee.employeeId,
                  date: overrideEntry.date,
                  status: overrideStatus,
                });
              }}
              disabled={overrideMutation.isPending}
              data-ocid="admin.override_save_button"
            >
              {overrideMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Override"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Date Dialog */}
      <Dialog
        open={addNewDateDialogOpen}
        onOpenChange={setAddNewDateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              Add Attendance Entry
            </DialogTitle>
            <DialogDescription>
              Add or set attendance for a specific date for{" "}
              <strong>{selectedEmployee?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="new-att-date">Date</Label>
              <Input
                id="new-att-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                max={getTodayDate()}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={newDateStatus} onValueChange={setNewDateStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setAddNewDateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selectedEmployee || !newDate) return;
                addDateMutation.mutate({
                  employeeId: selectedEmployee.employeeId,
                  date: newDate,
                  status: newDateStatus,
                });
              }}
              disabled={addDateMutation.isPending}
            >
              {addDateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Entry"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
