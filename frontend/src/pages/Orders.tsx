import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getMyOrders } from "@/api/orders.api";
import Spinner from "@/components/shared/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Order } from "@/types";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then((res) => {
        const payload = res.data.orders ?? res.data.data?.orders ?? res.data.data ?? res.data;
        setOrders(Array.isArray(payload) ? payload : []);
      })
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Spinner fullScreen />;

  if (orders.length === 0) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-10 text-center">
        <h1 className="text-xl font-semibold">No orders yet</h1>
        <p className="text-muted-foreground">
          When you place an order, it will show up here.
        </p>
        <Link to="/">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-bold">My Orders</h1>

      <div className="flex flex-col gap-4">
        {orders.map((order) => {
          const orderId = order._id ?? order.orderId;
          const statusKey = order.orderStatus?.toLowerCase();
          const statusClass =
            statusColors[statusKey] ?? "bg-muted text-muted-foreground";

          // Thumbnail: show the first item's image, with a fallback for
          // orders that somehow have no image (older test data, etc.)
          const thumbnail = order.items?.[0]?.image;
          const extraItemCount = (order.items?.length ?? 0) - 1;

          return (
            <Link key={orderId} to={`/orders/${orderId}`}>
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={order.items?.[0]?.name ?? "Order item"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        Order #{String(orderId).slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {" · "}
                        {order.items?.length ?? 0} item
                        {order.items?.length === 1 ? "" : "s"}
                        {extraItemCount > 0 && ` (+${extraItemCount} more)`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusClass}`}
                    >
                      {order.orderStatus}
                    </span>
                    <p className="text-sm font-semibold">
                      ₹{order.totalAmount?.toLocaleString("en-IN")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}