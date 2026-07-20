import { Star, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getReviewUserName, type Review } from "@/types/review";

interface ReviewCardProps {
  review: Review;
  isOwn: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function ReviewCard({ review, isOwn, onEdit, onDelete }: ReviewCardProps) {
  const formattedDate = new Date(review.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold text-foreground">
            {getReviewUserName(review)}
            {isOwn && <span className="ml-2 text-xs font-normal text-primary">(You)</span>}
          </p>
          <div
            className="mt-1 flex flex-wrap items-center gap-1.5"
            aria-label={`Rated ${review.rating} out of 5`}
          >
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < review.rating ? "fill-warning text-warning" : "fill-muted text-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({review.rating.toFixed(1)}) | {formattedDate}
            </span>
          </div>
        </div>

        {isOwn && (
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={onEdit}
              aria-label="Edit your review"
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label="Delete your review"
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {review.comment && (
        <p className="mt-2 text-sm leading-relaxed text-foreground">{review.comment}</p>
      )}
    </div>
  );
}