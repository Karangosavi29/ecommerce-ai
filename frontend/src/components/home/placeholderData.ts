/**
 * ⚠️ PLACEHOLDER DATA — NOT FROM YOUR BACKEND ⚠️
 * ------------------------------------------------
 * Your product.model.js has no `brand` field and there is no review model,
 * so "Top Brands" and "Customer Reviews" have nothing real to render yet.
 *
 * Everything below is fictional (invented brand names, sample quotes) so it
 * never gets mistaken for real data. Delete this file and wire the two
 * sections below to real endpoints once you add:
 *   - a `brand` field (or a Brand collection) to Products
 *   - a Review model + `GET /products/:id/reviews` (or similar)
 */

export interface PlaceholderBrand {
  id: string;
  name: string;
  initials: string;
}

export const PLACEHOLDER_BRANDS: PlaceholderBrand[] = [
  { id: "b1", name: "Samsung", initials: "SA" },
  { id: "b2", name: "LG", initials: "LG" },
  { id: "b3", name: "Sony", initials: "SO" },
  { id: "b4", name: "Whirlpool", initials: "WH" },
  { id: "b5", name: "Godrej", initials: "GO" },
  { id: "b6", name: "Havells", initials: "HA" },
];

export interface PlaceholderReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
}

export const PLACEHOLDER_REVIEWS: PlaceholderReview[] = [
  {
    id: "r1",
    customerName: "Ananya R.",
    rating: 5,
    comment:
      "Delivery was quick and the packaging felt genuinely premium. Exactly what I ordered, no surprises.",
  },
  {
    id: "r2",
    customerName: "Rohit S.",
    rating: 4,
    comment:
      "Good value for the price. Setup was simple and support answered my question within a day.",
  },
  {
    id: "r3",
    customerName: "Meera K.",
    rating: 5,
    comment:
      "Second time ordering electronics here — consistent quality and the checkout process is smooth.",
  },
];