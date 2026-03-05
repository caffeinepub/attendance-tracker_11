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
import { Pencil, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { type Product, type SkillLevel, useApp } from "../context/AppContext";
import SkillBadge from "./SkillBadge";

const EMPTY_PRODUCT: Omit<Product, "id"> = {
  name: "",
  description: "",
  price: 0,
  skillLevel: "Beginner",
  category: "",
  imageUrl: "",
};

export default function ProductCatalog() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(EMPTY_PRODUCT);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const openAdd = () => {
    setEditingProduct(null);
    setForm(EMPTY_PRODUCT);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
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
    if (editingProduct) {
      updateProduct(editingProduct.id, form);
      toast.success("Product updated successfully.");
    } else {
      addProduct(form);
      toast.success("Product added to catalog.");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteProduct(deleteTarget);
      toast.success("Product removed.");
      setDeleteTarget(null);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="font-display text-4xl font-bold text-foreground mb-2">
            Products
          </h2>
          <p className="text-muted-foreground">
            Premium papers, tools, and kits for every level.
          </p>
        </div>
        <Button
          data-ocid="products.add_button"
          onClick={openAdd}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div
          data-ocid="products.empty_state"
          className="text-center py-20 text-muted-foreground"
        >
          <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No products yet. Add the first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              data-ocid={`products.item.${i + 1}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="bg-card border border-border rounded-xl shadow-card overflow-hidden group hover:shadow-card-hover transition-shadow"
            >
              {p.imageUrl ? (
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] bg-muted/40 flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-display font-semibold text-foreground text-sm leading-snug">
                    {p.name}
                  </h3>
                  <span className="font-semibold text-accent text-sm whitespace-nowrap">
                    ${p.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed mb-3 line-clamp-3">
                  {p.description}
                </p>
                <div className="flex items-center justify-between">
                  <SkillBadge level={p.skillLevel} />
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      data-ocid={`products.edit_button.${i + 1}`}
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => openEdit(p)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      data-ocid={`products.delete_button.${i + 1}`}
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(p.id)}
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

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="p-name">Name *</Label>
              <Input
                id="p-name"
                data-ocid="products.input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Washi Paper Pack"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="p-desc">Description *</Label>
              <Textarea
                id="p-desc"
                data-ocid="products.textarea"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Product details..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="p-price">Price ($)</Label>
                <Input
                  id="p-price"
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
                  <SelectTrigger data-ocid="products.select" className="mt-1">
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
              <Label htmlFor="p-cat">Category *</Label>
              <Input
                id="p-cat"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                placeholder="e.g. Paper, Tools, Kit"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="p-img">Image URL (optional)</Label>
              <Input
                id="p-img"
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
              data-ocid="products.cancel_button"
            >
              Cancel
            </Button>
            <Button
              data-ocid="products.submit_button"
              onClick={handleSubmit}
              className="bg-primary text-primary-foreground"
            >
              {editingProduct ? "Save Changes" : "Add Product"}
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
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="products.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="products.confirm_button"
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
