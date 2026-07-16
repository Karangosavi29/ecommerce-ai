import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useCartStore from "@/store/cartStore";
import { useAuth } from "@/hooks/useAuth";
import { createOrder } from "@/api/orders.api";
import { createPaymentOrder, verifyPayment } from "@/api/payments.api";
import { loadRazorpayScript } from "@/utils/helpers";
import { AddressForm } from "@/components/checkout/AddressForm";
import { OrderMethod } from "@/components/checkout/OrderMethod";
import { CheckoutOrderSummary } from "@/components/checkout/CheckoutOrderSummary";
import { OrderSuccessOverlay } from "@/components/checkout/OrderSuccessOverlay";
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

  // Purely presentational — does not change when navigate() fires below.
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

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
            setSuccessOrderId(realOrderId);
            setShowSuccess(true);
            window.setTimeout(() => {
              navigate(`/orders/${realOrderId}`, { replace: true });
            }, 1400);
          } catch (err) {
            toast.error("Payment verification failed. Contact support if amount was deducted.");
          } finally {
            setIsPaying(false);
          }
        },
        modal: {
          ondismiss: () => setIsPaying(false),
        },
        theme: { color: "#2563EB" },
      });

      razorpay.open();
    } catch (err) {
      toast.error("Failed to start payment. Please try again.");
      setIsPaying(false);
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
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <AddressForm address={address} errors={errors} onChange={handleChange} />
          <OrderMethod isPaying={isPaying} onRazorpay={handleRazorpayCheckout} />
        </div>

        <CheckoutOrderSummary items={items} subtotal={subtotal} />
      </div>

      <OrderSuccessOverlay show={showSuccess} orderId={successOrderId ?? undefined} />
    </div>
  );
}