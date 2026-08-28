import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXAMPLE_QUERY = "I need a phone under ₹50,000 with a good camera.";

export function AIFinderBanner() {
  const handleFindProduct = () => {
    window.dispatchEvent(new CustomEvent("open-ai-assistant"));
  };

  return (
    <section className="py-10 sm:py-12">
      <div className="container">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary to-blue-700 px-6 py-10 sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-14 left-1/3 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex flex-col items-start gap-5 text-white sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                <Sparkles className="h-3.5 w-3.5" />
                AI Product Finder
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl">Not sure what to buy?</h2>
              <p className="mt-2 text-sm text-white/85 sm:text-base">
                Tell GIRI what you're looking for and we'll help you choose.
              </p>
              <p className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-sm italic text-white/90">
                "{EXAMPLE_QUERY}"
              </p>
            </div>

            <Button
              size="lg"
              onClick={handleFindProduct}
              className="w-full shrink-0 gap-1.5 rounded-full bg-white text-primary hover:bg-white/90 sm:w-auto"
            >
              Find My Product
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}