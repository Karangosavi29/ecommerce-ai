import { Heart, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface ShareWishlistBarProps {
  productName: string;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}

export function ShareWishlistBar({ productName, isWishlisted, onToggleWishlist }: ShareWishlistBarProps) {
  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: productName, url });
      } catch {
        // User cancelled the native share sheet — not an error.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onToggleWishlist}
        aria-pressed={isWishlisted}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-soft transition-transform hover:scale-105 active:scale-95"
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-colors",
            isWishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"
          )}
        />
      </button>
      <button
        type="button"
        onClick={handleShare}
        aria-label="Share this product"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-soft transition-transform hover:scale-105 active:scale-95"
      >
        <Share2 className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}