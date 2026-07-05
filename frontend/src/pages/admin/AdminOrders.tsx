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
    if (!search.trim()) return orders;

    const query = search.toLowerCase();

    return orders.filter((order) => {
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
            <td colSpan={6} className="p-4">
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