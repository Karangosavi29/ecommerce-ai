import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Package, MapPin, CreditCard } from "lucide-react";
import Spinner from "@/components/shared/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { CancelOrderDialog } from "@/components/orders/CancelOrderDialog";
import { getOrderById } from "@/api/orders.api";
import type { Order } from "@/types";

const CANCELLABLE_STATUSES = ["pending", "confirmed"];

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    setIsLoading(true);
    getOrderById(orderId)
      .then((res) => setOrder(res.data.order ?? res.data))
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  const handleCancelled = (responseData?: unknown) => {
    const data = responseData as { order?: Order } | Order | undefined;
    if (data) {
      setOrder((data as { order?: Order }).order ?? (data as Order));
    } else {
      setOrder((prev) => (prev ? { ...prev, orderStatus: "cancelled" } : prev));
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
  const canCancel = CANCELLABLE_STATUSES.includes(statusKey);

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Order #{displayId}
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.orderStatus} className="w-fit px-3 py-1.5 text-sm" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <Card className="shadow-soft lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <Package className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Items</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {order.items?.map((item, idx) => (
              <div key={item.product ?? idx} className="flex gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-contain p-1" />
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
                      className="text-sm font-semibold text-foreground hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}

            <div className="space-y-1 border-t border-border pt-4 text-sm">
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
              <div className="flex justify-between pt-1 text-base font-bold text-foreground">
                <span>Total</span>
                <span>₹{order.totalAmount?.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping + actions */}
        <div className="flex flex-col gap-6">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.phone}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                {order.shippingAddress?.pincode}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p>
                Method: <span className="font-medium capitalize text-foreground">{order.paymentMethod}</span>
              </p>
              <p>
                Status: <span className="font-medium capitalize text-foreground">{order.paymentStatus}</span>
              </p>
            </CardContent>
          </Card>

          {canCancel && (
            <Button variant="destructive" onClick={() => setCancelDialogOpen(true)}>
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {orderId && (
        <CancelOrderDialog
          orderId={orderId}
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          onCancelled={handleCancelled}
        />
      )}
    </div>
  );
}