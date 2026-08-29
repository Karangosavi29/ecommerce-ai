import { useEffect, useState, useRef, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus, ImagePlus, X, Sparkles, GripHorizontal } from "lucide-react";
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/api/admin.api";
import { getCategories } from "@/api/products.api";
import { generateProductDescription, generateProductSpecifications } from "@/api/ai.api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import type { Product, ProductImage } from "@/types";

interface SpecRow {
  key: string;
  value: string;
}

interface FormState {
  name: string;
  description: string;
  price: number;
  mrp: string;
  category: string;
  stock: number;
  specifications: SpecRow[];
}

const emptyForm: FormState = {
  name: "",
  description: "",
  price: 0,
  mrp: "",
  category: "",
  stock: 0,
  specifications: [],
};

const MAX_IMAGES = 6;

// Sentinel value for the "+ Add new category" option in the dropdown —
// distinct from any real category name.
const NEW_CATEGORY_VALUE = "__new_category__";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [categories, setCategories] = useState<string[]>([]);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingSpecs, setIsGeneratingSpecs] = useState(false);

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

  const fetchCategories = () => {
    getCategories()
      .then((res) => setCategories(res.data.categories ?? res.data ?? []))
      .catch(() => {
        // Non-fatal — the "+ Add new category" option still works if this fails.
      });
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const resetImageState = () => {
    setExistingImages([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsAddingNewCategory(false);
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
      specifications: Array.isArray((product as any).specifications)
        ? (product as any).specifications
        : [],
    });
    // If this product's category isn't in the fetched list yet (edge case —
    // e.g. list hasn't refreshed), fall back to the free-text input so the
    // value isn't silently lost.
    setIsAddingNewCategory(!categories.includes(product.category));
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

  const handleCategorySelect = (value: string) => {
    if (value === NEW_CATEGORY_VALUE) {
      setIsAddingNewCategory(true);
      setForm((prev) => ({ ...prev, category: "" }));
    } else {
      setIsAddingNewCategory(false);
      setForm((prev) => ({ ...prev, category: value }));
    }
  };

  const handleSuggestDescription = async () => {
    if (!form.name.trim() || !form.category.trim()) {
      toast.error("Enter a name and category first");
      return;
    }
    setIsGeneratingDescription(true);
    try {
      const { description } = await generateProductDescription(form.name.trim(), form.category.trim());
      if (description) {
        setForm((prev) => ({ ...prev, description }));
      } else {
        toast.error("Couldn't generate a description — try again");
      }
    } catch (err) {
      toast.error("Failed to generate description");
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleSuggestSpecifications = async () => {
    if (!form.name.trim() || !form.category.trim()) {
      toast.error("Enter a name and category first");
      return;
    }
    setIsGeneratingSpecs(true);
    try {
      const { specifications } = await generateProductSpecifications(
        form.name.trim(),
        form.category.trim()
      );
      if (specifications && specifications.length > 0) {
        setForm((prev) => ({ ...prev, specifications }));
      } else {
        toast.error("Couldn't generate specifications — try again");
      }
    } catch (err) {
      toast.error("Failed to generate specifications");
    } finally {
      setIsGeneratingSpecs(false);
    }
  };

  const handleSpecChange = (index: number, field: "key" | "value", value: string) => {
    setForm((prev) => {
      const specifications = [...prev.specifications];
      specifications[index] = { ...specifications[index], [field]: value };
      return { ...prev, specifications };
    });
  };

  const handleAddSpecRow = () => {
    setForm((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }],
    }));
  };

  const handleRemoveSpecRow = (index: number) => {
    setForm((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
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

    const cleanSpecs = form.specifications.filter(
      (s) => s.key.trim() && s.value.trim()
    );

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", String(form.price));
    formData.append("stock", String(form.stock));
    formData.append("category", form.category.trim());
    if (form.mrp) formData.append("mrp", form.mrp);
    formData.append("specifications", JSON.stringify(cleanSpecs));

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
      fetchCategories(); // pick up a newly-added category for next time
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
      <div className="overflow-x-auto rounded-[14px] border border-border bg-card shadow-soft">
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
                  className="flex cursor-pointer flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-border p-4 text-muted-foreground transition-colors hover:border-primary"
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
              <div className="flex items-center justify-between">
                <Label htmlFor="p-description">Description</Label>
                <button
                  type="button"
                  onClick={handleSuggestDescription}
                  disabled={isGeneratingDescription || !form.name.trim() || !form.category.trim()}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {isGeneratingDescription ? "Generating..." : "Suggest with AI"}
                </button>
              </div>
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

                {!isAddingNewCategory ? (
                  <Select
                    value={categories.includes(form.category) ? form.category : undefined}
                    onValueChange={handleCategorySelect}
                  >
                    <SelectTrigger id="p-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} className="capitalize">
                          {cat}
                        </SelectItem>
                      ))}
                      <SelectItem value={NEW_CATEGORY_VALUE} className="font-medium text-primary">
                        + Add new category
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-1.5">
                    <Input
                      id="p-category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="Type new category name"
                      required
                      autoFocus
                    />
                    {categories.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewCategory(false);
                          setForm((prev) => ({ ...prev, category: "" }));
                        }}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Choose from existing instead
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Specifications</Label>
                <button
                  type="button"
                  onClick={handleSuggestSpecifications}
                  disabled={isGeneratingSpecs || !form.name.trim() || !form.category.trim()}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {isGeneratingSpecs ? "Generating..." : "Generate with AI"}
                </button>
              </div>

              {form.specifications.length > 0 && (
                <div className="space-y-2 rounded-md border border-border p-2">
                  {form.specifications.map((spec, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <GripHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <Input
                        placeholder="Spec name (e.g. Brand)"
                        value={spec.key}
                        onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Value (e.g. Samsung)"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecRow(index)}
                        aria-label="Remove specification"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleAddSpecRow}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-primary"
              >
                <Plus className="h-3.5 w-3.5" />
                Add specification row
              </button>
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