import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartItem } from "@/types";

interface CartItemRowProps {
  item: CartItem;
  isMutating: boolean;
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItemRow({ item, isMutating, onUpdateQty, onRemove }: CartItemRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.25 }}
      className="flex gap-4 rounded-lg border border-border bg-card p-4 shadow-soft"
    >
      <Link
        to={`/products/${item.product}`}
        className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted"
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain p-2" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/products/${item.product}`}
            className="text-sm font-semibold text-foreground hover:text-primary"
          >
            {item.name}
          </Link>
          <button
            onClick={() => onRemove(item.product)}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Remove ${item.name} from cart`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          ₹{item.price.toLocaleString("en-IN")} each
        </p>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center rounded-md border border-border">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={item.qty <= 1 || isMutating}
              onClick={() => onUpdateQty(item.product, item.qty - 1)}
              aria-label={`Decrease quantity of ${item.name}`}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium" aria-live="polite">
              {item.qty}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={isMutating}
              onClick={() => onUpdateQty(item.product, item.qty + 1)}
              aria-label={`Increase quantity of ${item.name}`}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <p className="text-base font-bold text-foreground">
            ₹{(item.price * item.qty).toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </motion.div>
  );
}