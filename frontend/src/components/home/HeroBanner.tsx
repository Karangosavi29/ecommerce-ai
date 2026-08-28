import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Smartphone, Laptop, Headphones } from "lucide-react";
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
    eyebrow: "Trusted Local Store",
    title: "The right product. The right guidance. The right support.",
    subtitle:
      "Shop genuine products with confidence, get honest guidance from our team, and visit our store whenever you need us.",
    ctaLabel: "Shop Mobiles",
    ctaHref: "/?category=mobiles",
    gradient: "from-blue-600 via-blue-500 to-indigo-500",
  },
  {
    id: "s2",
    eyebrow: "Real People. Real Support.",
    title: "We're here when you need us.",
    subtitle:
      "From choosing the right product to setup, service and support after your purchase, our team is here to help.",
    ctaLabel: "Shop Mobiles",
    ctaHref: "/?category=mobiles",
    gradient: "from-slate-800 via-slate-700 to-slate-600",
  },
  {
    id: "s3",
    eyebrow: "More Than A Purchase",
    title: "Buy from people you can come back to.",
    subtitle:
      "Shop online or visit us in person. Get genuine products, personal assistance and local after-sales support.",
    ctaLabel: "Explore Products",
    ctaHref: "#shop",
    gradient: "from-indigo-600 via-violet-500 to-blue-500",
  },
];

const TRUST_LINE = "Genuine products • Personal assistance • Local after-sales support";
const AUTO_ADVANCE_MS = 6000;

function getSecondaryCta(primary: Slide) {
  return primary.ctaLabel === "Explore Products"
    ? { label: "Shop Mobiles", href: "/?category=mobiles" }
    : { label: "Explore Products", href: "#shop" };
}

export function HeroBanner() {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => setIndex((i) => (i + 1) % SLIDES.length), []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    const timer = window.setInterval(next, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [next]);

  const slide = SLIDES[index];
  const secondaryCta = getSecondaryCta(slide);

  return (
    <section
      className="relative overflow-hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotions"
    >
      <div className="relative min-h-[500px] sm:min-h-[440px] lg:min-h-[460px]">
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
            <div className="container grid h-full items-center gap-6 py-10 sm:gap-8 sm:py-12 lg:grid-cols-2 lg:py-0">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-xl text-white"
              >
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-white/80">
                  {slide.eyebrow}
                </p>
                <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.75rem]">
                  {slide.title}
                </h1>
                <p className="mt-3 text-base text-white/90 sm:text-lg">{slide.subtitle}</p>
                <p className="mt-2 text-sm font-medium text-white/75">{TRUST_LINE}</p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link to={slide.ctaHref}>
                    <Button size="lg" className="rounded-full bg-white text-slate-900 hover:bg-white/90">
                      {slide.ctaLabel}
                    </Button>
                  </Link>
                  <Link to={secondaryCta.href}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    >
                      {secondaryCta.label}
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="relative hidden h-full min-h-[280px] items-center justify-center lg:flex"
                aria-hidden="true"
              >
                <div className="absolute h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -right-4 top-6 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

                <div className="relative flex items-center gap-5">
                  <div className="flex h-28 w-28 -rotate-6 items-center justify-center rounded-2xl border border-white/25 bg-white/10 shadow-xl backdrop-blur">
                    <Laptop className="h-11 w-11 text-white/90" />
                  </div>
                  <div className="flex h-32 w-32 translate-y-3 items-center justify-center rounded-2xl border border-white/25 bg-white/10 shadow-xl backdrop-blur">
                    <Smartphone className="h-12 w-12 text-white/90" />
                  </div>
                  <div className="flex h-24 w-24 rotate-6 items-center justify-center rounded-2xl border border-white/25 bg-white/10 shadow-xl backdrop-blur">
                    <Headphones className="h-10 w-10 text-white/90" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="absolute bottom-5 left-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/30 sm:bottom-auto sm:left-6 sm:top-1/2 sm:-translate-y-1/2"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="absolute bottom-5 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/30 sm:bottom-auto sm:right-6 sm:top-1/2 sm:-translate-y-1/2"
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