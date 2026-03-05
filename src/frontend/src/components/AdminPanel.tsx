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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Product,
  type SkillLevel,
  type SuggestionStatus,
  type Tutorial,
  type TutorialCategory,
  useApp,
} from "../context/AppContext";
import SkillBadge from "./SkillBadge";

// ── Admin Products Tab ──────────────────────────────────────────────────────

const EMPTY_PRODUCT: Omit<Product, "id"> = {
  name: "",
  description: "",
  price: 0,
  skillLevel: "Beginner",
  category: "",
  imageUrl: "",
};

function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(EMPTY_PRODUCT);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_PRODUCT);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      skillLevel: p.skillLevel,
      category: p.category,
      imageUrl: p.imageUrl ?? "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.category.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (editingId) {
      updateProduct(editingId, form);
      toast.success("Product updated.");
    } else {
      addProduct(form);
      toast.success("Product added.");
    }
    setDialogOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-semibold text-lg text-foreground">
          Products ({products.length})
        </h3>
        <Button
          data-ocid="admin.products.add_button"
          size="sm"
          onClick={openAdd}
          className="gap-1.5 bg-primary text-primary-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No products yet.
                </TableCell>
              </TableRow>
            ) : (
              products.map((p, i) => (
                <TableRow key={p.id} data-ocid={`admin.products.row.${i + 1}`}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.category}
                  </TableCell>
                  <TableCell>
                    <SkillBadge level={p.skillLevel} />
                  </TableCell>
                  <TableCell>${p.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        data-ocid={`admin.products.edit_button.${i + 1}`}
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => openEdit(p)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        data-ocid={`admin.products.delete_button.${i + 1}`}
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => setDeleteTarget(p.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingId ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      price: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Skill Level</Label>
                <Select
                  value={form.skillLevel}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, skillLevel: v as SkillLevel }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Category *</Label>
              <Input
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                placeholder="e.g. Paper, Tools, Kit"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={form.imageUrl ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-primary text-primary-foreground"
            >
              {editingId ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deleteProduct(deleteTarget);
                  toast.success("Deleted.");
                  setDeleteTarget(null);
                }
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Admin Tutorials Tab ─────────────────────────────────────────────────────

function AdminTutorials() {
  const { tutorials, addTutorial, updateTutorial, deleteTutorial } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Tutorial, "id">>({
    title: "",
    description: "",
    difficulty: "Beginner",
    category: "Animals",
    estimatedTime: "",
    steps: [{ step: 1, instruction: "" }],
  });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const openAdd = () => {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      difficulty: "Beginner",
      category: "Animals",
      estimatedTime: "",
      steps: [{ step: 1, instruction: "" }],
    });
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
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Fill in all required fields.");
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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-semibold text-lg text-foreground">
          Tutorials ({tutorials.length})
        </h3>
        <Button
          data-ocid="admin.tutorials.add_button"
          size="sm"
          onClick={openAdd}
          className="gap-1.5 bg-primary text-primary-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tutorials.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No tutorials yet.
                </TableCell>
              </TableRow>
            ) : (
              tutorials.map((t, i) => (
                <TableRow key={t.id} data-ocid={`admin.tutorials.row.${i + 1}`}>
                  <TableCell className="font-medium">{t.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.category}
                  </TableCell>
                  <TableCell>
                    <SkillBadge level={t.difficulty} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.estimatedTime}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        data-ocid={`admin.tutorials.edit_button.${i + 1}`}
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => openEdit(t)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        data-ocid={`admin.tutorials.delete_button.${i + 1}`}
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => setDeleteTarget(t.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingId ? "Edit Tutorial" : "Add Tutorial"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Level</Label>
                <Select
                  value={form.difficulty}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, difficulty: v as SkillLevel }))
                  }
                >
                  <SelectTrigger className="mt-1">
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
                <Label>Time</Label>
                <Input
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
              <Label>Steps</Label>
              <div className="space-y-2 mt-1">
                {form.steps.map((s, idx) => (
                  <div
                    key={`step-${s.step}-${idx}`}
                    className="flex gap-2 items-start"
                  >
                    <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground mt-2 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <Textarea
                      value={s.instruction}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          steps: f.steps.map((st, i) =>
                            i === idx
                              ? { ...st, instruction: e.target.value }
                              : st,
                          ),
                        }))
                      }
                      rows={1}
                      className="flex-1 text-sm"
                    />
                    {form.steps.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 mt-1 text-destructive"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            steps: f.steps
                              .filter((_, i) => i !== idx)
                              .map((st, i) => ({ ...st, step: i + 1 })),
                          }))
                        }
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-1"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      steps: [
                        ...f.steps,
                        { step: f.steps.length + 1, instruction: "" },
                      ],
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" /> Add Step
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-primary text-primary-foreground"
            >
              {editingId ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this tutorial?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deleteTutorial(deleteTarget);
                  toast.success("Deleted.");
                  setDeleteTarget(null);
                }
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Admin Gallery Tab ───────────────────────────────────────────────────────

function AdminGallery() {
  const { gallery, deleteGalleryEntry } = useApp();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  return (
    <div>
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">
        Gallery Submissions ({gallery.length})
      </h3>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Title</TableHead>
              <TableHead>Submitter</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gallery.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  No submissions yet.
                </TableCell>
              </TableRow>
            ) : (
              gallery.map((e, i) => (
                <TableRow key={e.id} data-ocid={`admin.gallery.row.${i + 1}`}>
                  <TableCell className="font-medium">{e.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {e.submitterName}
                  </TableCell>
                  <TableCell>{e.likes}</TableCell>
                  <TableCell>
                    <Button
                      data-ocid={`admin.gallery.delete_button.${i + 1}`}
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={() => setDeleteTarget(e.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this gallery entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deleteGalleryEntry(deleteTarget);
                  toast.success("Removed.");
                  setDeleteTarget(null);
                }
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Admin Suggestions Tab ───────────────────────────────────────────────────

function AdminSuggestions() {
  const { suggestions, updateSuggestionStatus, deleteSuggestion } = useApp();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const STATUS_LABELS: SuggestionStatus[] = [
    "Pending",
    "Under Consideration",
    "Coming Soon",
    "Dismissed",
  ];

  return (
    <div>
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">
        Suggestions ({suggestions.length})
      </h3>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Submitter</TableHead>
              <TableHead>Suggestion</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16">Del</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suggestions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No suggestions yet.
                </TableCell>
              </TableRow>
            ) : (
              suggestions.map((s, i) => (
                <TableRow
                  key={s.id}
                  data-ocid={`admin.suggestions.row.${i + 1}`}
                >
                  <TableCell className="font-medium whitespace-nowrap">
                    {s.submitterName}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs">
                    <p className="line-clamp-2 text-sm">{s.text}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {s.createdAt}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={s.status}
                      onValueChange={(v) => {
                        updateSuggestionStatus(s.id, v as SuggestionStatus);
                        toast.success("Status updated.");
                      }}
                    >
                      <SelectTrigger className="h-7 w-44 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_LABELS.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      data-ocid={`admin.suggestions.delete_button.${i + 1}`}
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={() => setDeleteTarget(s.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this suggestion?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deleteSuggestion(deleteTarget);
                  toast.success("Deleted.");
                  setDeleteTarget(null);
                }
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Admin Panel (Main) ──────────────────────────────────────────────────────

export default function AdminPanel() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Admin Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-4xl font-bold text-foreground">
            Admin Panel
          </h2>
          <p className="text-muted-foreground text-sm">
            Full control over content and submissions.
          </p>
        </div>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-6 bg-muted/60">
          <TabsTrigger
            data-ocid="admin.products_tab"
            value="products"
            className="data-[state=active]:bg-card"
          >
            Products
          </TabsTrigger>
          <TabsTrigger
            data-ocid="admin.tutorials_tab"
            value="tutorials"
            className="data-[state=active]:bg-card"
          >
            Tutorials
          </TabsTrigger>
          <TabsTrigger
            data-ocid="admin.gallery_tab"
            value="gallery"
            className="data-[state=active]:bg-card"
          >
            Gallery
          </TabsTrigger>
          <TabsTrigger
            data-ocid="admin.suggestions_tab"
            value="suggestions"
            className="data-[state=active]:bg-card"
          >
            Suggestions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <AdminProducts />
        </TabsContent>
        <TabsContent value="tutorials">
          <AdminTutorials />
        </TabsContent>
        <TabsContent value="gallery">
          <AdminGallery />
        </TabsContent>
        <TabsContent value="suggestions">
          <AdminSuggestions />
        </TabsContent>
      </Tabs>
    </main>
  );
}
