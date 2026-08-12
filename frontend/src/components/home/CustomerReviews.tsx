import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { PLACEHOLDER_REVIEWS } from "@/components/home/placeholderData";
import { cn } from "@/lib/utils";

export function CustomerReviews() {
  return (
    <section className="py-10 sm:py-12">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6 sm:mb-8"
        >
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Reviews
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            What Customers Say
          </h2>
        </motion.div>

        {/* Mobile: horizontal swipeable scroll. sm+: original grid. */}
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 no-scrollbar sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 sm:snap-none">
          {PLACEHOLDER_REVIEWS.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="flex w-[85%] shrink-0 snap-start flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-soft sm:w-auto sm:shrink"
            >
              <Quote className="h-5 w-5 text-primary/40" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-foreground">{review.comment}</p>
              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="text-sm font-semibold text-foreground">{review.customerName}</span>
                <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={cn(
                        "h-3.5 w-3.5",
                        idx < review.rating ? "fill-warning text-warning" : "fill-muted text-muted"
                      )}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}