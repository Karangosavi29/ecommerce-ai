import { useEffect, useState, useRef, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus, ImagePlus } from "lucide-react";
import {
    getAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from "@/api/admin.api";
import Spinner from "@/components/shared/Spinner";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import type { Product } from "@/types";

interface FormState {
    name:        string;
    description: string;
    price:       number;
    category:    string;
    stock:       number;
}

const emptyForm: FormState = {
    name:        "",
    description: "",
    price:       0,
    category:    "",
    stock:       0,
};

export default function AdminProducts() {
    const [products,     setProducts]     = useState<Product[]>([]);
    const [isLoading,    setIsLoading]    = useState(true);
    const [dialogOpen,   setDialogOpen]   = useState(false);
    const [editingId,    setEditingId]    = useState<string | null>(null);
    const [form,         setForm]         = useState<FormState>(emptyForm);
    const [imageFile,    setImageFile]    = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchProducts = () => {
        setIsLoading(true);
        getAdminProducts()
            .then((res) => setProducts(res.data.products ?? []))
            .catch(() => toast.error("Failed to load products"))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => { fetchProducts(); }, []);

    const openCreateDialog = () => {
        setEditingId(null);
        setForm(emptyForm);
        setImageFile(null);
        setImagePreview("");
        setDialogOpen(true);
    };

    const openEditDialog = (product: Product) => {
        setEditingId(product._id);
        setForm({
            name:        product.name,
            description: product.description,
            price:       product.price,
            category:    product.category,
            stock:       product.stock,
        });
        setImageFile(null);
        setImagePreview(product.imageUrl ?? "");
        setDialogOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);

        setImageFile(file);
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
        if (!editingId && !imageFile) {
            toast.error("Please upload a product image");
            return;
        }

        // Build FormData — backend expects multipart/form-data
        const formData = new FormData();
        formData.append("name",        form.name);
        formData.append("description", form.description);
        formData.append("price",       String(form.price));
        formData.append("stock",       String(form.stock));
        formData.append("category",    form.category);
        if (imageFile) {
            formData.append("image", imageFile); // must match upload.single("image")
        }

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
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Products</h1>
                <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            <th className="p-3 text-left font-medium">Image</th>
                            <th className="p-3 text-left font-medium">Name</th>
                            <th className="p-3 text-left font-medium">Category</th>
                            <th className="p-3 text-left font-medium">Price</th>
                            <th className="p-3 text-left font-medium">Stock</th>
                            <th className="p-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product._id} className="border-b last:border-0">
                                <td className="p-3">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="h-12 w-12 rounded-md object-cover"
                                        />
                                    ) : (
                                        <div className="h-12 w-12 rounded-md bg-muted" />
                                    )}
                                </td>
                                <td className="p-3 font-medium">{product.name}</td>
                                <td className="p-3 capitalize text-muted-foreground">{product.category}</td>
                                <td className="p-3">₹{product.price.toLocaleString("en-IN")}</td>
                                <td className="p-3">{product.stock}</td>
                                <td className="p-3">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product._id)}>
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

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label>Product Image</Label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-4 transition hover:border-primary"
                            >
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="h-32 w-32 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <ImagePlus className="h-10 w-10" />
                                        <span className="text-sm">Click to upload image</span>
                                    </div>
                                )}
                                {imageFile && (
                                    <p className="mt-2 text-xs text-muted-foreground">{imageFile.name}</p>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
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