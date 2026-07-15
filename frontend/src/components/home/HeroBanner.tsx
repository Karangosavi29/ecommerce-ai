import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Slide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  gradient: string; 
}

const SLIDES: Slide[] = [
  {
    id: "s1",
    eyebrow: "New season",
    title: "Upgrade your setup for less",
    subtitle: "Fresh arrivals across mobiles, laptops and audio.",
    ctaLabel: "Shop New Arrivals",
    ctaHref: "/?sort=new",
    gradient: "from-blue-600 via-blue-500 to-indigo-500",
  },
  {
    id: "s2",
    eyebrow: "Trusted checkout",
    title: "Secure payments, fast delivery",
    subtitle: "Razorpay-secured checkout with real-time order tracking.",
    ctaLabel: "Start Shopping",
    ctaHref: "/",
    gradient: "from-slate-800 via-slate-700 to-slate-600",
  },
  {
    id: "s3",
    eyebrow: "Every category",
    title: "Everything electronic, one store",
    subtitle: "Browse curated picks across every category we carry.",
    ctaLabel: "Explore Categories",
    ctaHref: "#categories",
    gradient: "from-indigo-600 via-violet-500 to-blue-500",
  },
];

const AUTO_ADVANCE_MS = 6000;

export function HeroBanner() {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => setIndex((i) => (i + 1) % SLIDES.length), []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    const timer = window.setInterval(next, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [next]);

  const slide = SLIDES[index];

  return (
    <section
      className="relative overflow-hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotions"
    >
      <div className="relative h-[360px] sm:h-[420px] lg:h-[480px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={cn("absolute inset-0 bg-gradient-to-br", slide.gradient)}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${SLIDES.length}`}
          >
            <div className="container flex h-full items-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-xl text-white"
              >
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/80">
                  {slide.eyebrow}
                </p>
                <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                  {slide.title}
                </h1>
                <p className="mt-4 text-base text-white/90 sm:text-lg">{slide.subtitle}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to={slide.ctaHref}>
                    <Button
                      size="lg"
                      className="rounded-full bg-white text-slate-900 hover:bg-white/90"
                    >
                      {slide.ctaLabel}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Arrows */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/30 sm:left-6"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/30 sm:right-6"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}