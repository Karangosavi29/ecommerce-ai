import { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { Star, MessageSquarePlus, Search } from "lucide-react";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from "@/api/reviews.api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { StarRatingInput } from "@/components/reviews/StarRatingInput";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { cn } from "@/lib/utils";
import { getReviewUserId, getReviewUserName, type Review } from "@/types/review";
import type { ApiErrorResponse } from "@/types";

interface ReviewsSectionProps {
  productId: string;
}

type SortOption = "newest" | "oldest" | "highest" | "lowest";

const unwrap = (res: any) => res.data?.data ?? res.data;
const getErrorMessage = (err: unknown, fallback: string) => {
  const axiosErr = err as AxiosError<ApiErrorResponse>;
  return axiosErr.response?.data?.message || fallback;
};

export function ReviewsSection({ productId }: ReviewsSectionProps) {
  const { user, isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const fetchReviews = useCallback(() => {
    setIsLoading(true);
    getProductReviews(productId, 1, 50)
      .then((res) => {
        const data = unwrap(res);
        const list: Review[] = data?.reviews ?? (Array.isArray(data) ? data : []);
        setReviews(list);
      })
      .catch(() => setReviews([]))
      .finally(() => setIsLoading(false));
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const myReview = useMemo(
    () => (user ? reviews.find((r) => getReviewUserId(r) === user._id) : undefined),
    [reviews, user]
  );

  const { average, count } = useMemo(() => {
    if (reviews.length === 0) return { average: 0, count: 0 };
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return { average: sum / reviews.length, count: reviews.length };
  }, [reviews]);

  const visibleReviews = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let list = reviews;

    if (query) {
      list = list.filter(
        (r) =>
          getReviewUserName(r).toLowerCase().includes(query) ||
          (r.comment ?? "").toLowerCase().includes(query)
      );
    }

    const sorted = [...list];
    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "highest":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        sorted.sort((a, b) => a.rating - b.rating);
        break;
    }
    return sorted;
  }, [reviews, searchQuery, sortBy]);

  const openCreateForm = () => {
    setRating(0);
    setComment("");
    setFormOpen(true);
  };

  const openEditForm = () => {
    if (!myReview) return;
    setRating(myReview.rating);
    setComment(myReview.comment ?? "");
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      if (myReview) {
        await updateReview(productId, { rating, comment: comment.trim() || undefined });
        toast.success("Review updated");
      } else {
        await createReview(productId, { rating, comment: comment.trim() || undefined });
        toast.success("Review submitted");
      }
      setFormOpen(false);
      fetchReviews();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to submit review"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your review?")) return;
    try {
      await deleteReview(productId);
      toast.success("Review deleted");
      fetchReviews();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete review"));
    }
  };

  return (
    <div className="mt-10 border-t border-border pt-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Customer Reviews</h2>
          {count > 0 ? (
            <div className="mt-1 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.round(average) ? "fill-warning text-warning" : "fill-muted text-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {average.toFixed(1)} · {count} review{count === 1 ? "" : "s"}
              </span>
            </div>
          ) : (
            !isLoading && <p className="mt-1 text-sm text-muted-foreground">No reviews yet</p>
          )}
        </div>

        {isAuthenticated && !myReview && !formOpen && (
          <Button variant="outline" onClick={openCreateForm} className="gap-1.5">
            <MessageSquarePlus className="h-4 w-4" />
            Write a review
          </Button>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{myReview ? "Update your review" : "Write a review"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Your rating</p>
              <StarRatingInput value={rating} onChange={setRating} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Your review (optional)</p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={5}
                placeholder="Share your thoughts about this product"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">{comment.length}/1000</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : myReview ? "Update review" : "Submit review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {reviews.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews"
              aria-label="Search reviews"
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by</span>
            <Select value={sortBy} onValueChange={(v: SortOption) => setSortBy(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Rated</SelectItem>
                <SelectItem value="lowest">Lowest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-lg" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Be the first to review this product.
        </p>
      ) : visibleReviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No reviews match "{searchQuery}".
        </p>
      ) : (
        <div className="space-y-3">
          {visibleReviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              isOwn={!!user && getReviewUserId(review) === user._id}
              onEdit={openEditForm}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}