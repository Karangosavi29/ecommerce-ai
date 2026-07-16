import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ShippingAddress } from "@/types";

type FormErrors = Partial<Record<keyof ShippingAddress, string>>;

interface AddressFormProps {
  address: ShippingAddress;
  errors: FormErrors;
  onChange: (field: keyof ShippingAddress, value: string) => void;
}

export function AddressForm({ address, errors, onChange }: AddressFormProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MapPin className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-bold text-foreground">Shipping Address</h2>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={address.fullName}
              onChange={(e) => onChange("fullName", e.target.value)}
              aria-invalid={!!errors.fullName}
            />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={address.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="10-digit mobile number"
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="addressLine1">Address line 1</Label>
          <Input
            id="addressLine1"
            value={address.addressLine1}
            onChange={(e) => onChange("addressLine1", e.target.value)}
            aria-invalid={!!errors.addressLine1}
          />
          {errors.addressLine1 && <p className="text-sm text-destructive">{errors.addressLine1}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="addressLine2">Address line 2 (optional)</Label>
          <Input
            id="addressLine2"
            value={address.addressLine2}
            onChange={(e) => onChange("addressLine2", e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={address.city}
              onChange={(e) => onChange("city", e.target.value)}
              aria-invalid={!!errors.city}
            />
            {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={address.state}
              onChange={(e) => onChange("state", e.target.value)}
              aria-invalid={!!errors.state}
            />
            {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              value={address.pincode}
              onChange={(e) => onChange("pincode", e.target.value)}
              aria-invalid={!!errors.pincode}
            />
            {errors.pincode && <p className="text-sm text-destructive">{errors.pincode}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}