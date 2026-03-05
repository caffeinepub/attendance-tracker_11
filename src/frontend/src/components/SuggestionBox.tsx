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
import { Lightbulb, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { type SuggestionStatus, useApp } from "../context/AppContext";

const STATUS_STYLES: Record<SuggestionStatus, string> = {
  Pending: "badge-pending",
  "Under Consideration": "badge-consideration",
  "Coming Soon": "badge-coming-soon",
  Dismissed: "badge-dismissed",
};

export default function SuggestionBox() {
  const {
    suggestions,
    addSuggestion,
    updateSuggestionStatus,
    deleteSuggestion,
  } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ submitterName: "", text: "" });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!form.submitterName.trim() || !form.text.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    addSuggestion(form);
    toast.success("Suggestion submitted! Thank you.");
    setForm({ submitterName: "", text: "" });
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteSuggestion(deleteTarget);
      toast.success("Suggestion removed.");
      setDeleteTarget(null);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="font-display text-4xl font-bold text-foreground mb-2">
            Suggestion Box
          </h2>
          <p className="text-muted-foreground">
            Got an idea for a new tutorial or product? We'd love to hear it.
          </p>
        </div>
        <Button
          data-ocid="suggestions.add_button"
          onClick={() => setDialogOpen(true)}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add Suggestion
        </Button>
      </div>

      {suggestions.length === 0 ? (
        <div
          data-ocid="suggestions.empty_state"
          className="text-center py-20 text-muted-foreground"
        >
          <Lightbulb className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No suggestions yet. Be the first to share an idea!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((s, i) => (
            <motion.div
              key={s.id}
              data-ocid={`suggestions.item.${i + 1}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="bg-card border border-border rounded-xl shadow-card p-5 group hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                      {s.submitterName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-foreground text-sm">
                      {s.submitterName}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {s.createdAt}
                    </span>
                  </div>
                  <p className="text-foreground text-sm leading-relaxed mb-3">
                    {s.text}
                  </p>

                  {/* Status Badge + Admin Change */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${STATUS_STYLES[s.status]}`}
                    >
                      {s.status}
                    </span>
                    <Select
                      value={s.status}
                      onValueChange={(v) => {
                        updateSuggestionStatus(s.id, v as SuggestionStatus);
                        toast.success(`Status updated to "${v}"`);
                      }}
                    >
                      <SelectTrigger className="h-7 w-auto text-xs px-2 py-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Under Consideration">
                          Under Consideration
                        </SelectItem>
                        <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                        <SelectItem value="Dismissed">Dismissed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  data-ocid={`suggestions.delete_button.${i + 1}`}
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  onClick={() => setDeleteTarget(s.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Submit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              Submit a Suggestion
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="s-name">Your Name *</Label>
              <Input
                id="s-name"
                data-ocid="suggestions.input"
                value={form.submitterName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, submitterName: e.target.value }))
                }
                placeholder="e.g. Priya Sharma"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="s-text">Your Suggestion *</Label>
              <Textarea
                id="s-text"
                data-ocid="suggestions.textarea"
                value={form.text}
                onChange={(e) =>
                  setForm((f) => ({ ...f, text: e.target.value }))
                }
                placeholder="I'd love to see a tutorial for..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="suggestions.cancel_button"
            >
              Cancel
            </Button>
            <Button
              data-ocid="suggestions.submit_button"
              onClick={handleSubmit}
              className="bg-primary text-primary-foreground"
            >
              Submit Suggestion
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
            <AlertDialogTitle>Delete this suggestion?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="suggestions.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="suggestions.confirm_button"
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
