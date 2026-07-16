import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { CancelOrderDialog } from "@/components/orders/CancelOrderDialog";
import type { Order } from "@/types";

interface OrderCardProps {
  order: Order;
  onCancelled: (orderId: string) => void;
}


const CANCELLABLE_STATUSES = new Set(["pending", "confirmed"]);

export function OrderCard({ order, onCancelled }: OrderCardProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const orderId = String(order._id ?? order.orderId);
  const statusKey = order.orderStatus?.toLowerCase();
  const thumbnail = order.items?.[0]?.image;
  const extraItemCount = (order.items?.length ?? 0) - 1;
  const canCancel = CANCELLABLE_STATUSES.has(statusKey);

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden shadow-soft transition-shadow hover:shadow-soft-lg">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Link to={`/orders/${orderId}`} className="flex flex-1 items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={order.items?.[0]?.name ?? "Order item"}
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  No image
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">
                Order #{orderId.slice(-8).toUpperCase()}
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
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex flex-col items-end gap-1.5">
              <OrderStatusBadge status={order.orderStatus} />
              <p className="text-sm font-bold text-foreground">
                ₹{order.totalAmount?.toLocaleString("en-IN")}
              </p>
            </div>

            {canCancel && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  setCancelDialogOpen(true);
                }}
                aria-label="Cancel order"
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            <Link to={`/orders/${orderId}`} aria-hidden="true" tabIndex={-1}>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </CardContent>
      </Card>

      <CancelOrderDialog
        orderId={orderId}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onCancelled={() => onCancelled(orderId)}
      />
    </motion.div>
  );
}