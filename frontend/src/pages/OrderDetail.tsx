import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getOrderById, cancelOrder } from "@/api/orders.api";
import Spinner from "@/components/shared/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order } from "@/types";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

// Matches backend's cancellableStatuses exactly
const CANCELLABLE_STATUSES = ["pending", "confirmed"];

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    setIsLoading(true);
    getOrderById(orderId)
      .then((res) => setOrder(res.data.order ?? res.data))
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  const handleCancel = async () => {
    if (!orderId) return;
    const confirmed = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmed) return;

    setIsCancelling(true);
    try {
      const res = await cancelOrder(orderId);
      setOrder(res.data.order ?? res.data);
      toast.success("Order cancelled");
    } catch (err) {
      toast.error("Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) return <Spinner fullScreen />;

  if (notFound || !order) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 py-10">
        <h1 className="text-xl font-semibold">Order not found</h1>
        <Button variant="outline" onClick={() => navigate("/orders")}>
          Back to my orders
        </Button>
      </div>
    );
  }

  const displayId = String(order._id).slice(-8).toUpperCase();
  const statusKey = order.orderStatus?.toLowerCase();
  const statusClass = statusColors[statusKey] ?? "bg-muted text-muted-foreground";
  const canCancel = CANCELLABLE_STATUSES.includes(statusKey);

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order #{displayId}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-sm font-medium capitalize ${statusClass}`}>
          {order.orderStatus}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {order.items?.map((item, idx) => (
              <div key={item.product ?? idx} className="flex gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <Link
                      to={`/products/${item.product}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}

            <div className="space-y-1 border-t pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Items total</span>
                <span>₹{order.itemsTotal?.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>
                  {order.shippingCharge === 0
                    ? "Free"
                    : `₹${order.shippingCharge?.toLocaleString("en-IN")}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-1">
                <span>Total</span>
                <span>₹{order.totalAmount?.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping + actions */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.phone}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                {order.shippingAddress?.pincode}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p>
                Method: <span className="capitalize text-foreground">{order.paymentMethod}</span>
              </p>
              <p>
                Status: <span className="capitalize text-foreground">{order.paymentStatus}</span>
              </p>
            </CardContent>
          </Card>

          {canCancel && (
            <Button variant="destructive" onClick={handleCancel} disabled={isCancelling}>
              {isCancelling ? "Cancelling..." : "Cancel Order"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}