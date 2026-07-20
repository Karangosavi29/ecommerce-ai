export interface ReviewUser {
  _id: string;
  name?: string;
}

export interface Review {
  _id: string;
  rating: number;
  comment?: string;
  user: string | ReviewUser;
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export function getReviewUserId(review: Review): string {
  return typeof review.user === "string" ? review.user : review.user._id;
}

export function getReviewUserName(review: Review): string {
  if (typeof review.user === "string") return "Customer";
  return review.user.name || "Customer";
}