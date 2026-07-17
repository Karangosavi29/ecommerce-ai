import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { getAdminOrders, updateOrderStatus } from "@/api/admin.api";
import Spinner from "@/components/shared/Spinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import type { Order } from "@/types";

// Small helper so payment method + status render consistently.
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  razorpay: "Razorpay",
  whatsapp_cod: "COD (WhatsApp)",
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  paid: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  refunded: "bg-muted text-muted-foreground",
};

function PaymentBadge({ order }: { order: Order }) {
  const methodLabel = PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod;
  const statusStyle = PAYMENT_STATUS_STYLES[order.paymentStatus] ?? "bg-muted text-muted-foreground";

  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-block w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle}`}>
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

      // Fixed: your table reads `order.orderStatus`, not `order.status` — the
      // original patch here wrote to a field nothing displays, so the Select
      // would silently revert to the stale value until a full refetch.
      setOrders((prev) =>
        prev.map((o) => (String(o._id ?? o.orderId) === orderId ? { ...o, orderStatus: status } : o))
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
      const customerName = (order.shippingAddress?.fullName ?? "").toLowerCase();

      return orderId.includes(query) || customerName.includes(query);
    });
  }, [orders, search]);

  if (isLoading) return <Spinner fullScreen />;

  return (
    <div className="container py-8">
      <AdminPageHeader
        title="Orders"
        description={`${filteredOrders.length} order${filteredOrders.length === 1 ? "" : "s"}`}
        action={
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Order ID or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        }
      />

      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="p-3 text-left font-semibold text-foreground">Order</th>
              <th className="p-3 text-left font-semibold text-foreground">Customer</th>
              <th className="p-3 text-left font-semibold text-foreground">Date</th>
              <th className="p-3 text-left font-semibold text-foreground">Total</th>
              <th className="p-3 text-left font-semibold text-foreground">Payment</th>
              <th className="p-3 text-left font-semibold text-foreground">Status</th>
              <th className="p-3 text-left font-semibold text-foreground">Items</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order) => {
              const orderId = String(order._id ?? order.orderId);
              const isExpanded = expandedOrder === orderId;

              return (
                <>
                  <tr key={orderId} className="border-b border-border last:border-0 hover:bg-accent/40">
                    <td className="p-3 font-semibold text-foreground">
                      #{orderId.slice(-8).toUpperCase()}
                    </td>
                    <td className="p-3 text-foreground">{order.shippingAddress?.fullName}</td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-3 font-semibold text-foreground">
                      ₹{order.totalAmount?.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3">
                      <PaymentBadge order={order} />
                    </td>
                    <td className="p-3">
                      <OrderStatusSelect
                        value={order.orderStatus}
                        onChange={(value) => handleStatusChange(orderId, value)}
                        disabled={updatingId === orderId}
                      />
                    </td>
                    <td className="p-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => setExpandedOrder(isExpanded ? null : orderId)}
                      >
                        {isExpanded ? "Hide" : "View"}
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-muted/30">
                      <td colSpan={7} className="p-4">
                        <h3 className="mb-3 text-sm font-semibold text-foreground">Products</h3>

                        <div className="overflow-hidden rounded-md border border-border">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="border-b border-border p-2 text-left">Image</th>
                                <th className="border-b border-border p-2 text-left">Product</th>
                                <th className="border-b border-border p-2 text-left">Price</th>
                                <th className="border-b border-border p-2 text-left">Qty</th>
                                <th className="border-b border-border p-2 text-left">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item, index) => (
                                <tr key={index} className="border-b border-border last:border-0">
                                  <td className="p-2">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="h-14 w-14 rounded-md bg-muted object-contain p-1"
                                    />
                                  </td>
                                  <td className="p-2 text-foreground">{item.name}</td>
                                  <td className="p-2 text-muted-foreground">
                                    ₹{item.price.toLocaleString("en-IN")}
                                  </td>
                                  <td className="p-2 text-muted-foreground">{item.quantity}</td>
                                  <td className="p-2 font-semibold text-foreground">
                                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-4 text-right text-base font-bold text-foreground">
                          Total: ₹{order.totalAmount?.toLocaleString("en-IN")}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}

            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}