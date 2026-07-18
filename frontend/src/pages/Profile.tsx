import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, ShoppingCart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AvatarInitials } from "@/components/shared/AvatarInitials";

interface FormErrors {
  name?: string;
  email?: string;
}

export default function Profile() {
  const { user, updateUserProfile, isSubmitting } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(email)) newErrors.email = "Enter a valid email";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await updateUserProfile({ name, email });
    if (success) setIsDirty(false);
  };

  return (
    <div className="container max-w-3xl py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <AvatarInitials name={user?.name || email} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {user?.name || "My Profile"}
            </h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Quick links to real, existing pages */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Link to="/orders">
            <Card className="shadow-soft transition-shadow hover:shadow-soft-lg">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Package className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">My Orders</p>
                  <p className="text-xs text-muted-foreground">Track & manage</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/cart">
            <Card className="shadow-soft transition-shadow hover:shadow-soft-lg">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShoppingCart className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">My Cart</p>
                  <p className="text-xs text-muted-foreground">View items</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Edit form */}
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-bold text-foreground">Account Details</h2>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setIsDirty(true);
                  }}
                  disabled={isSubmitting}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIsDirty(true);
                  }}
                  disabled={isSubmitting}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}