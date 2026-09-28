import { Heart, Share2, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface ShareWishlistBarProps {
  productName: string;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}
const getShareUrl = () => `${window.location.origin}${window.location.pathname}`;

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function ShareWishlistBar({ productName, isWishlisted, onToggleWishlist }: ShareWishlistBarProps) {
  const handleShare = async () => {
    const url = getShareUrl();

    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `Check out ${productName} at GIRI Electronics`,
          url,
        });
        return;
      } catch (err) {
        // User closed the share sheet — not an error.
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Any other failure: fall back to copying the link.
      }
    }

    const copied = await copyToClipboard(url);
    if (copied) {
      toast.success("Link copied — paste it anywhere to share");
    } else {
      toast.error("Couldn't copy link");
    }
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Check out ${productName} at GIRI Electronics: ${getShareUrl()}`
  )}`;

  const iconButton =
    "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-soft transition-transform hover:scale-105 active:scale-95";

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onToggleWishlist}
        aria-pressed={isWishlisted}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className={iconButton}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-colors",
            isWishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"
          )}
        />
      </button>

      <a
        href={whatsappShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share this product on WhatsApp"
        title="Share on WhatsApp"
        className={iconButton}
      >
        <MessageCircle className="h-4 w-4 text-success" />
      </a>

      <button
        type="button"
        onClick={handleShare}
        aria-label="Share this product"
        className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground shadow-soft transition-transform hover:scale-105 active:scale-95"
      >
        <Share2 className="h-4 w-4 text-muted-foreground" />
        Share
      </button>
    </div>
  );
}