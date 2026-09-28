import { useEffect, useState } from "react";
import { MapPin, Clock, Navigation, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  STORE_ADDRESS,
  STORE_HOURS,
  STORE_MAPS_URL,
  buildWhatsAppUrl,
} from "@/config/contact";

export function StoreVisit() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpenRequest = () => setOpen(true);
    window.addEventListener("open-store-info", handleOpenRequest);
    return () => window.removeEventListener("open-store-info", handleOpenRequest);
  }, []);

  if (!STORE_ADDRESS) return null;

  const whatsappUrl = buildWhatsAppUrl(
    "Hi! I'd like to visit your store. Could you share the timings and directions?"
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Visit our store</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex gap-3 text-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="font-medium leading-snug">{STORE_ADDRESS}</p>
          </div>
          {STORE_HOURS && (
            <div className="flex gap-3 text-muted-foreground">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>{STORE_HOURS}</p>
            </div>
          )}
        </div>

        {(STORE_MAPS_URL || whatsappUrl) && (
          <DialogFooter className="gap-2">
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full gap-1.5 sm:w-auto">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
              </a>
            )}
            {STORE_MAPS_URL && (
              <a href={STORE_MAPS_URL} target="_blank" rel="noopener noreferrer">
                <Button className="w-full gap-1.5 sm:w-auto">
                  <Navigation className="h-4 w-4" />
                  Get directions
                </Button>
              </a>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}