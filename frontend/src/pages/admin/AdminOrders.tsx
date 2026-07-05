import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getAdminOrders, updateOrderStatus } from "@/api/admin.api";
import Spinner from "@/components/shared/Spinner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { Order } from "@/types";

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

// Small helper so payment method + status render consistently.
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  razorpay: "Razorpay",
  whatsapp_cod: "COD (WhatsApp)",
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  refunded: "bg-gray-200 text-gray-700",
};

function PaymentBadge({ order }: { order: Order }) {
  const methodLabel =
    PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod;
  const statusStyle =
    PAYMENT_STATUS_STYLES[order.paymentStatus] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-block w-fit rounded px-2 py-0.5 text-xs font-medium ${statusStyle}`}
      >
        {order.paymentStatus === "paid"
          ? "Paid"
          : order.paymentStatus === "refunded"
          ? "Refunded"
          : order.paymentMethod === "whatsapp_cod"
          ? "Cash on Delivery"
          : "Unpaid"}
      </span>
      <span className="text-xs text-muted-foreground">{methodLabel}</span>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    getAdminOrders()
      .then((res) => setOrders(res.data.orders ?? res.data))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setIsLoading(false));
  }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdatingId(orderId);

    try {
      await updateOrderStatus(orderId, status);

      setOrders((prev) =>
        prev.map((o) =>
          (o._id ?? o.orderId) === orderId ? { ...o, status } : o
        )
      );

      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    // Hide Razorpay orders where payment never completed — these are
    // abandoned/failed checkout attempts (retries, closed modal, etc.),
    // not real orders. COD/WhatsApp orders are unaffected since "pending"
    // payment is expected for them until delivery.
    const visibleOrders = orders.filter(
      (order) => !(order.paymentMethod === "razorpay" && order.paymentStatus !== "paid")
    );

    if (!search.trim()) return visibleOrders;

    const query = search.toLowerCase();

    return visibleOrders.filter((order) => {
      const orderId = String(order._id ?? order.orderId).toLowerCase();
      const customerName = (
        order.shippingAddress?.fullName ?? ""
      ).toLowerCase();

      return (
        orderId.includes(query) ||
        customerName.includes(query)
      );
    });
  }, [orders, search]);

  if (isLoading) return <Spinner fullScreen />;

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>

        <Input
          placeholder="Search by Order ID or Customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 text-left font-medium">Order</th>
              <th className="p-3 text-left font-medium">Customer</th>
              <th className="p-3 text-left font-medium">Date</th>
              <th className="p-3 text-left font-medium">Total</th>
              <th className="p-3 text-left font-medium">Payment</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-left font-medium">Items</th>
            </tr>
          </thead>

          <tbody>
  {filteredOrders.map((order) => {
    const orderId = String(order._id);

    return (
      <>
        <tr key={orderId} className="border-b">
          <td className="p-3 font-medium">
            #{orderId.slice(-8).toUpperCase()}
          </td>

          <td className="p-3">
            {order.shippingAddress.fullName}
          </td>

          <td className="p-3">
            {new Date(order.createdAt).toLocaleDateString("en-IN")}
          </td>

          <td className="p-3">
            ₹{order.totalAmount.toLocaleString("en-IN")}
          </td>

          <td className="p-3">
            <PaymentBadge order={order} />
          </td>

          <td className="p-3">
            <Select
              value={order.orderStatus}
              onValueChange={(value) =>
                handleStatusChange(orderId, value)
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </td>

          <td className="p-3">
            <button
              className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
              onClick={() =>
                setExpandedOrder(
                  expandedOrder === orderId ? null : orderId
                )
              }
            >
              {expandedOrder === orderId ? "Hide" : "View"}
            </button>
          </td>
        </tr>

        {expandedOrder === orderId && (
          <tr className="bg-gray-50">
            <td colSpan={7} className="p-4">
              <h3 className="mb-3 font-semibold">Products</h3>

              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Image</th>
                    <th className="border p-2">Product</th>
                    <th className="border p-2">Price</th>
                    <th className="border p-2">Qty</th>
                    <th className="border p-2">Subtotal</th>
                  </tr>
                </thead>

                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border p-2">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-14 w-14 rounded object-cover"
                        />
                      </td>

                      <td className="border p-2">
                        {item.name}
                      </td>

                      <td className="border p-2">
                        ₹{item.price.toLocaleString("en-IN")}
                      </td>

                      <td className="border p-2">
                        {item.quantity}
                      </td>

                      <td className="border p-2 font-medium">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 text-right font-bold">
                Total: ₹{order.totalAmount.toLocaleString("en-IN")}
              </div>
            </td>
          </tr>
        )}
      </>
    );
  })}
</tbody>
        </table>
      </div>
    </div>
  );
}