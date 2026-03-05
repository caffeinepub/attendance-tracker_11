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
import { Textarea } from "@/components/ui/textarea";
import { Heart, ImageIcon, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { type GalleryEntry, useApp } from "../context/AppContext";

type SubmitForm = Omit<GalleryEntry, "id" | "likes" | "likedByUser">;

const EMPTY_FORM: SubmitForm = {
  title: "",
  description: "",
  submitterName: "",
  imageUrl: "",
};

export default function CommunityGallery() {
  const { gallery, addGalleryEntry, toggleLike, deleteGalleryEntry } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<SubmitForm>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleSubmit = () => {
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.submitterName.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    addGalleryEntry(form);
    toast.success("Your creation has been added to the gallery!");
    setForm(EMPTY_FORM);
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteGalleryEntry(deleteTarget);
      toast.success("Entry removed from gallery.");
      setDeleteTarget(null);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="font-display text-4xl font-bold text-foreground mb-2">
            Gallery
          </h2>
          <p className="text-muted-foreground">
            Creations from the origami community. Share yours!
          </p>
        </div>
        <Button
          data-ocid="gallery.add_button"
          onClick={() => setDialogOpen(true)}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Submit Creation
        </Button>
      </div>

      {gallery.length === 0 ? (
        <div
          data-ocid="gallery.empty_state"
          className="text-center py-20 text-muted-foreground"
        >
          <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No submissions yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((entry, i) => (
            <motion.div
              key={entry.id}
              data-ocid={`gallery.item.${i + 1}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="bg-card border border-border rounded-xl shadow-card overflow-hidden group hover:shadow-card-hover transition-shadow"
            >
              {entry.imageUrl ? (
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={entry.imageUrl}
                    alt={entry.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] bg-muted/30 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/25" />
                </div>
              )}

              <div className="p-5">
                <h3 className="font-display font-semibold text-foreground text-lg mb-1">
                  {entry.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-3">
                  {entry.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      {entry.submitterName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {entry.submitterName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      data-ocid={`gallery.toggle.${i + 1}`}
                      onClick={() => {
                        toggleLike(entry.id);
                        toast(entry.likedByUser ? "Like removed" : "❤️ Liked!", {
                          duration: 1500,
                        });
                      }}
                      className={[
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm font-medium transition-colors",
                        entry.likedByUser
                          ? "bg-red-50 text-red-500 hover:bg-red-100"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted",
                      ].join(" ")}
                    >
                      <Heart
                        className={`h-4 w-4 transition-all ${entry.likedByUser ? "fill-red-500 text-red-500 scale-110" : ""}`}
                      />
                      <span>{entry.likes}</span>
                    </button>
                    <Button
                      data-ocid={`gallery.delete_button.${i + 1}`}
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setDeleteTarget(entry.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
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
              Share Your Creation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="g-name">Your Name *</Label>
              <Input
                id="g-name"
                data-ocid="gallery.input"
                value={form.submitterName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, submitterName: e.target.value }))
                }
                placeholder="e.g. Yuki Tanaka"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="g-title">Title *</Label>
              <Input
                id="g-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Paper Crane Garden"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="g-desc">Description *</Label>
              <Textarea
                id="g-desc"
                data-ocid="gallery.textarea"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Tell us about your creation..."
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="g-img">Image URL (optional)</Label>
              <Input
                id="g-img"
                value={form.imageUrl ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                placeholder="https://..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="gallery.cancel_button"
            >
              Cancel
            </Button>
            <Button
              data-ocid="gallery.submit_button"
              onClick={handleSubmit}
              className="bg-primary text-primary-foreground"
            >
              Submit to Gallery
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
            <AlertDialogTitle>Remove this submission?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this gallery entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="gallery.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="gallery.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
