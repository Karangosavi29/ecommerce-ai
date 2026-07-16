import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface OrderSuccessOverlayProps {
  show: boolean;
  orderId?: string;
}


export function OrderSuccessOverlay({ show, orderId }: OrderSuccessOverlayProps) {
  const displayId = orderId ? orderId.slice(-8).toUpperCase() : null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex flex-col items-center gap-2 rounded-lg bg-card p-8 text-center shadow-soft-xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 18 }}
            >
              <CheckCircle2 className="h-14 w-14 text-success" />
            </motion.div>
            <p className="text-lg font-bold text-foreground">Payment Successful 🎉</p>
            <p className="text-sm text-muted-foreground">Your order has been confirmed.</p>
            {displayId && (
              <p className="mt-1 text-sm font-semibold text-foreground">Order ID: #{displayId}</p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Track your order from My Orders.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}