import { useEffect, useState, useRef, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus, ImagePlus, X, GripVertical } from "lucide-react";
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/api/admin.api";
import Spinner from "@/components/shared/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import type { Product, ProductImage } from "@/types";

interface FormState {
  name: string;
  description: string;
  price: number;
  mrp: string;
  category: string;
  stock: number;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  price: 0,
  mrp: "",
  category: "",
  stock: 0,
};

const MAX_IMAGES = 6;

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalImageCount = existingImages.length + newImageFiles.length;

  const fetchProducts = () => {
    setIsLoading(true);
    getAdminProducts()
      .then((res) => setProducts(res.data.products ?? []))
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetImageState = () => {
    setExistingImages([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    resetImageState();
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      mrp: product.mrp != null ? String(product.mrp) : "",
      category: product.category,
      stock: product.stock,
    });
    const existing =
      product.images && product.images.length > 0
        ? product.images
        : product.imageUrl
        ? [{ url: product.imageUrl, cloudinaryId: product.cloudinaryId ?? "" }]
        : [];
    setExistingImages(existing);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setDialogOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const room = MAX_IMAGES - totalImageCount;
    if (room <= 0) {
      toast.error(`You can only have up to ${MAX_IMAGES} images`);
      return;
    }
    const accepted = files.slice(0, room);
    if (files.length > accepted.length) {
      toast.error(`Only added ${accepted.length} — max ${MAX_IMAGES} images per product`);
    }

    setNewImageFiles((prev) => [...prev, ...accepted]);
    accepted.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setNewImagePreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.category.trim()) {
      toast.error("Name and category are required");
      return;
    }
    if (form.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }
    if (form.mrp && Number(form.mrp) < form.price) {
      toast.error("MRP should be greater than or equal to the price");
      return;
    }
    if (!editingId && totalImageCount === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", String(form.price));
    formData.append("stock", String(form.stock));
    formData.append("category", form.category);
    if (form.mrp) formData.append("mrp", form.mrp);

    if (editingId) {
      formData.append("existingImages", JSON.stringify(existingImages));
    }
    newImageFiles.forEach((file) => {
      formData.append("images", file); 
    });

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateProduct(editingId, formData);
        toast.success("Product updated");
      } else {
        await createProduct(formData);
        toast.success("Product created");
      }
      setDialogOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(editingId ? "Failed to update product" : "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error("Failed to delete product");
    }
  };

  if (isLoading) return <Spinner fullScreen />;

  return (
    <div className="container py-8">
      <AdminPageHeader
        title="Products"
        description={`${products.length} product${products.length === 1 ? "" : "s"}`}
        action={
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        }
      />

      {/* Products Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="p-3 text-left font-semibold text-foreground">Image</th>
              <th className="p-3 text-left font-semibold text-foreground">Name</th>
              <th className="p-3 text-left font-semibold text-foreground">Category</th>
              <th className="p-3 text-left font-semibold text-foreground">Price</th>
              <th className="p-3 text-left font-semibold text-foreground">Stock</th>
              <th className="p-3 text-right font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-b border-border last:border-0 hover:bg-accent/40">
                <td className="p-3">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-12 w-12 rounded-md bg-muted object-contain p-1"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-md bg-muted" />
                  )}
                </td>
                <td className="p-3 font-semibold text-foreground">{product.name}</td>
                <td className="p-3 capitalize text-muted-foreground">{product.category}</td>
                <td className="p-3 text-foreground">
                  ₹{product.price.toLocaleString("en-IN")}
                  {product.mrp && product.mrp > product.price && (
                    <span className="ml-1.5 text-xs text-muted-foreground line-through">
                      ₹{product.mrp.toLocaleString("en-IN")}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <span
                    className={
                      product.stock <= 0
                        ? "font-medium text-destructive"
                        : product.stock <= 5
                        ? "font-medium text-warning"
                        : "text-foreground"
                    }
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(product._id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Multi-image upload */}
            <div className="space-y-2">
              <Label>Product Images ({totalImageCount}/{MAX_IMAGES})</Label>

              {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {existingImages.map((img, i) => (
                    <div key={`existing-${img.url}-${i}`} className="group relative aspect-square">
                      <img
                        src={img.url}
                        alt=""
                        className="h-full w-full rounded-lg border border-border bg-muted object-contain p-1"
                      />
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        aria-label="Remove image"
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow-soft"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {newImagePreviews.map((src, i) => (
                    <div key={`new-${i}`} className="group relative aspect-square">
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full rounded-lg border-2 border-primary/40 bg-muted object-contain p-1"
                      />
                      <span className="absolute bottom-1 left-1 rounded bg-success px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        New
                      </span>
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        aria-label="Remove image"
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow-soft"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {totalImageCount < MAX_IMAGES && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-4 text-muted-foreground transition-colors hover:border-primary"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span className="mt-1 text-xs">
                    Click to add image{totalImageCount > 0 ? "s" : ""} (up to {MAX_IMAGES} total)
                  </span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
              <p className="text-xs text-muted-foreground">
                First image is the primary one shown in listings.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-name">Name</Label>
              <Input
                id="p-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-description">Description</Label>
              <textarea
                id="p-description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-price">Price (₹)</Label>
                <Input
                  id="p-price"
                  type="number"
                  min={1}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-mrp">MRP (₹, optional)</Label>
                <Input
                  id="p-mrp"
                  type="number"
                  min={0}
                  value={form.mrp}
                  onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                  placeholder="Original price, for a strikethrough"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-stock">Stock</Label>
                <Input
                  id="p-stock"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-category">Category</Label>
                <Input
                  id="p-category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingId ? "Save Changes" : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}