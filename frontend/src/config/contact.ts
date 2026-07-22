
export const WHATSAPP_NUMBER = "";

export function buildWhatsAppUrl(message: string): string | null {
  if (!WHATSAPP_NUMBER) {
    console.warn(
      "[contact.ts] WHATSAPP_NUMBER is not set — WhatsApp links are disabled until it is configured."
    );
    return null;
  }
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}