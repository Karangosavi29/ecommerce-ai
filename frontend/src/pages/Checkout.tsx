import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useCartStore from "@/store/cartStore";
import { useAuth } from "@/hooks/useAuth";
import { createOrder } from "@/api/orders.api";
import { createPaymentOrder, verifyPayment } from "@/api/payments.api";
import { loadRazorpayScript } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ShippingAddress } from "@/types";

type FormErrors = Partial<Record<keyof ShippingAddress, string>>;

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: user?.name || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isPaying, setIsPaying] = useState(false);
  const [isWhatsappSubmitting, setIsWhatsappSubmitting] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleChange = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!address.fullName.trim()) newErrors.fullName = "Required";
    if (!/^\d{10}$/.test(address.phone)) newErrors.phone = "Enter a valid 10-digit phone number";
    if (!address.addressLine1.trim()) newErrors.addressLine1 = "Required";
    if (!address.city.trim()) newErrors.city = "Required";
    if (!address.state.trim()) newErrors.state = "Required";
    if (!/^\d{6}$/.test(address.pincode)) newErrors.pincode = "Enter a valid 6-digit pincode";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRazorpayCheckout = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsPaying(true);
    try {
      // 1. Create the order — backend builds items from the server-side cart
      const orderRes = await createOrder({
        shippingAddress: address,
        orderType: "online",
        paymentMethod: "razorpay",
      });
      const { order, orderId } = orderRes.data;
      const realOrderId = orderId ?? order?._id;

      // 2. Create a Razorpay order against it
      const paymentRes = await createPaymentOrder(realOrderId);
      const { razorpayOrderId, amount, currency, keyId } = paymentRes.data;

      // 3. Load Razorpay checkout script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Failed to load payment gateway. Check your connection.");
        setIsPaying(false);
        return;
      }

      // 4. Open Razorpay modal
      const razorpay = new window.Razorpay({
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency: currency || "INR",
        name: "GIRIElectronics",
        description: "Order Payment",
        order_id: razorpayOrderId,
        prefill: {
          name: address.fullName,
          contact: address.phone,
          email: user?.email,
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: realOrderId,
            });
            await clear();
            toast.success("Payment successful! Order placed.");
            navigate(`/orders/${realOrderId}`, { replace: true });
          } catch (err) {
            toast.error("Payment verification failed. Contact support if amount was deducted.");
          } finally {
            setIsPaying(false);
          }
        },
        modal: {
          ondismiss: () => setIsPaying(false),
        },
        theme: { color: "#000000" },
      });

      razorpay.open();
    } catch (err) {
      toast.error("Failed to start payment. Please try again.");
      setIsPaying(false);
    }
  };

  const handleWhatsAppOrder = async () => {
    if (!validate()) return;
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsWhatsappSubmitting(true);
    try {
      const res = await createOrder({
        shippingAddress: address,
        orderType: "whatsapp",
      });
      const { whatsappUrl } = res.data;

      await clear();
      toast.success("Order created — continue on WhatsApp");

      if (whatsappUrl) {
        window.open(whatsappUrl, "_blank");
      }
      navigate("/orders", { replace: true });
    } catch (err) {
      toast.error("Failed to create WhatsApp order");
    } finally {
      setIsWhatsappSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-10">
        <p className="text-muted-foreground">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={address.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                />
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={address.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="10-digit mobile number"
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address line 1</Label>
              <Input
                id="addressLine1"
                value={address.addressLine1}
                onChange={(e) => handleChange("addressLine1", e.target.value)}
              />
              {errors.addressLine1 && (
                <p className="text-sm text-destructive">{errors.addressLine1}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address line 2 (optional)</Label>
              <Input
                id="addressLine2"
                value={address.addressLine2}
                onChange={(e) => handleChange("addressLine2", e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={address.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                />
                {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={address.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                />
                {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={address.pincode}
                  onChange={(e) => handleChange("pincode", e.target.value)}
                />
                {errors.pincode && <p className="text-sm text-destructive">{errors.pincode}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              {items.map((item) => (
                <div key={item.product} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.name} × {item.qty}
                  </span>
                  <span>₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between border-t pt-3 text-base font-semibold">
              <span>Total</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Free shipping on orders ₹500+, otherwise ₹50 shipping applies.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={handleRazorpayCheckout} disabled={isPaying} size="lg">
                {isPaying ? "Processing..." : "Pay with Razorpay"}
              </Button>
              <Button
                variant="outline"
                onClick={handleWhatsAppOrder}
                disabled={isWhatsappSubmitting}
                size="lg"
              >
                {isWhatsappSubmitting ? "Placing order..." : "Order via WhatsApp"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}