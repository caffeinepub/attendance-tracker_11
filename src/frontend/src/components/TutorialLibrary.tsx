import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type SkillLevel,
  type Tutorial,
  type TutorialCategory,
  type TutorialStep,
  useApp,
} from "../context/AppContext";
import SkillBadge from "./SkillBadge";

type FormData = Omit<Tutorial, "id">;

const EMPTY_FORM: FormData = {
  title: "",
  description: "",
  difficulty: "Beginner",
  category: "Animals",
  estimatedTime: "",
  steps: [{ step: 1, instruction: "" }],
};

export default function TutorialLibrary() {
  const { tutorials, addTutorial, updateTutorial, deleteTutorial } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (t: Tutorial) => {
    setEditingId(t.id);
    setForm({
      title: t.title,
      description: t.description,
      difficulty: t.difficulty,
      category: t.category,
      estimatedTime: t.estimatedTime,
      steps: [...t.steps],
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.estimatedTime.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (editingId) {
      updateTutorial(editingId, form);
      toast.success("Tutorial updated.");
    } else {
      addTutorial(form);
      toast.success("Tutorial added.");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteTutorial(deleteTarget);
      toast.success("Tutorial removed.");
      setDeleteTarget(null);
    }
  };

  const addStep = () => {
    setForm((f) => ({
      ...f,
      steps: [...f.steps, { step: f.steps.length + 1, instruction: "" }],
    }));
  };

  const updateStep = (idx: number, instruction: string) => {
    setForm((f) => ({
      ...f,
      steps: f.steps.map((s, i) => (i === idx ? { ...s, instruction } : s)),
    }));
  };

  const removeStep = (idx: number) => {
    setForm((f) => ({
      ...f,
      steps: f.steps
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, step: i + 1 })),
    }));
  };

  const categoryColors: Record<TutorialCategory, string> = {
    Animals: "bg-primary/10 text-primary border-primary/20",
    Flowers: "bg-accent/15 text-accent border-accent/30",
    Geometric: "bg-muted text-muted-foreground border-border",
    Modular: "bg-success/10 text-success border-success/20",
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="font-display text-4xl font-bold text-foreground mb-2">
            Tutorials
          </h2>
          <p className="text-muted-foreground">
            Step-by-step folding guides for every level.
          </p>
        </div>
        <Button
          data-ocid="tutorials.add_button"
          onClick={openAdd}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add Tutorial
        </Button>
      </div>

      {tutorials.length === 0 ? (
        <div
          data-ocid="tutorials.empty_state"
          className="text-center py-20 text-muted-foreground"
        >
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No tutorials yet. Add the first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {tutorials.map((t, i) => (
            <motion.div
              key={t.id}
              data-ocid={`tutorials.item.${i + 1}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="bg-card border border-border rounded-xl shadow-card overflow-hidden group hover:shadow-card-hover transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground text-lg leading-snug mb-1">
                      {t.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <SkillBadge level={t.difficulty} />
                      <Badge
                        variant="outline"
                        className={`text-xs ${categoryColors[t.category] ?? ""}`}
                      >
                        {t.category}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {t.estimatedTime}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      data-ocid={`tutorials.edit_button.${i + 1}`}
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => openEdit(t)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      data-ocid={`tutorials.delete_button.${i + 1}`}
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(t.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {t.description}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(expandedId === t.id ? null : t.id)
                  }
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {expandedId === t.id ? (
                    <>
                      <ChevronUp className="h-4 w-4" /> Hide steps
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" /> Show {t.steps.length}{" "}
                      steps
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {expandedId === t.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <ol className="mt-4 space-y-2.5 border-t border-border pt-4">
                        {t.steps.map((s) => (
                          <li key={s.step} className="flex gap-3 text-sm">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                              {s.step}
                            </span>
                            <span className="text-muted-foreground leading-relaxed">
                              {s.instruction}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingId ? "Edit Tutorial" : "Add New Tutorial"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="t-title">Title *</Label>
              <Input
                id="t-title"
                data-ocid="tutorials.input"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Classic Paper Crane"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="t-desc">Description *</Label>
              <Textarea
                id="t-desc"
                data-ocid="tutorials.textarea"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Difficulty</Label>
                <Select
                  value={form.difficulty}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, difficulty: v as SkillLevel }))
                  }
                >
                  <SelectTrigger data-ocid="tutorials.select" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, category: v as TutorialCategory }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Animals">Animals</SelectItem>
                    <SelectItem value="Flowers">Flowers</SelectItem>
                    <SelectItem value="Geometric">Geometric</SelectItem>
                    <SelectItem value="Modular">Modular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="t-time">Est. Time *</Label>
                <Input
                  id="t-time"
                  value={form.estimatedTime}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, estimatedTime: e.target.value }))
                  }
                  placeholder="15 min"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Steps</Label>
              <div className="space-y-2">
                {form.steps.map((s: TutorialStep, idx: number) => (
                  <div
                    key={`step-${s.step}-${idx}`}
                    className="flex gap-2 items-start"
                  >
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground mt-1.5 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <Textarea
                      value={s.instruction}
                      onChange={(e) => updateStep(idx, e.target.value)}
                      rows={2}
                      placeholder={`Step ${idx + 1} instruction...`}
                      className="flex-1 text-sm"
                    />
                    {form.steps.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 mt-1.5 text-destructive"
                        onClick={() => removeStep(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStep}
                  className="gap-1.5 w-full mt-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Step
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="tutorials.cancel_button"
            >
              Cancel
            </Button>
            <Button
              data-ocid="tutorials.submit_button"
              onClick={handleSubmit}
              className="bg-primary text-primary-foreground"
            >
              {editingId ? "Save Changes" : "Add Tutorial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this tutorial?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="tutorials.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="tutorials.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
