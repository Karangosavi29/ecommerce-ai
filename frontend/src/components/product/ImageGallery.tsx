import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ImageGalleryProps {
  product: Product;
}

function getImages(product: Product): string[] {
  const raw = (product as Record<string, unknown>).images;
  if (Array.isArray(raw) && raw.length > 0) {
    const urls = raw
      .map((item) => (typeof item === "string" ? item : (item as { url?: string })?.url))
      .filter((u): u is string => typeof u === "string" && u.length > 0);
    if (urls.length > 0) return urls;
  }
  return product.imageUrl ? [product.imageUrl] : [];
}

export function ImageGallery({ product }: ImageGalleryProps) {
  const images = getImages(product);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  const activeImage = images[activeIndex];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
        No image
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row-reverse">
      {/* Main image */}
      <div className="relative flex-1">
        <div
          className="group relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-lg bg-muted"
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setLightboxOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Open full-size image"
          onKeyDown={(e) => e.key === "Enter" && setLightboxOpen(true)}
        >
          <img
            src={activeImage}
            alt={product.name}
            className={cn(
              "h-full w-full object-contain p-6 transition-transform duration-200 ease-out",
              isZooming && "scale-150"
            )}
            style={
              isZooming
                ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                : undefined
            }
          />
          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-muted-foreground shadow-soft opacity-0 transition-opacity group-hover:opacity-100">
            <ZoomIn className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-y-auto sm:overflow-x-visible">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === activeIndex}
              className={cn(
                "aspect-square w-16 shrink-0 overflow-hidden rounded-md border-2 bg-muted sm:w-full",
                i === activeIndex ? "border-primary" : "border-border"
              )}
            >
              <img src={img} alt="" className="h-full w-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-3xl border-0 bg-transparent p-0 shadow-none">
          <div className="relative flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                src={activeImage}
                alt={product.name}
                className="max-h-[80vh] w-full rounded-lg bg-white object-contain"
              />
            </AnimatePresence>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => setActiveIndex((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-soft"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => setActiveIndex((i) => (i + 1) % images.length)}
                  className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-soft"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}