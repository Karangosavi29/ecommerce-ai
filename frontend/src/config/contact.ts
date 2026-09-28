export const WHATSAPP_NUMBER = "917038188599";

export const STORE_ADDRESS = "SHREE GIRI ELECTRONIC, 45, Mandai - Dhamankar Naka Rd, Zaitunpura, Samad Nagar, Mandai, Bhiwandi, Maharashtra 421308";
export const STORE_HOURS = "10am - 11pm, Mon - Sun";
export const STORE_MAPS_URL = "https://maps.app.goo.gl/cu9i1meiMbt4wvjq6";

export function buildWhatsAppUrl(message: string): string | null {
  if (!WHATSAPP_NUMBER) {
    console.warn(
      "[contact.ts] WHATSAPP_NUMBER is not set — WhatsApp links are disabled until it is configured."
    );
    return null;
  }
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}