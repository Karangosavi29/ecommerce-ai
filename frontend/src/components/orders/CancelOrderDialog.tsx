import { useState } from "react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cancelOrder } from "@/api/orders.api";
import type { ApiErrorResponse } from "@/types";

interface CancelOrderDialogProps {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled: (responseData?: unknown) => void;
}

export function CancelOrderDialog({ orderId, open, onOpenChange, onCancelled }: CancelOrderDialogProps) {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleConfirm = async () => {
    setIsCancelling(true);
    try {
      const res = await cancelOrder(orderId);
      toast.success("Order cancelled");
      onCancelled(res.data);
      onOpenChange(false);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      toast.error(axiosErr.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive sm:mx-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle className="mt-3">Cancel this order?</DialogTitle>
          <DialogDescription>
            This can't be undone. Order #{orderId.slice(-8).toUpperCase()} will be marked as cancelled.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCancelling}>
            Keep order
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isCancelling}>
            {isCancelling ? "Cancelling..." : "Yes, cancel order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}