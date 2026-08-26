import { useEffect, useState } from "react";
import { Bot, X, Sparkles } from "lucide-react";
import AIProductAssistant from "./AIProductAssistant";

const AIChatButton = () => {
  const [open, setOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreeting(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Greeting */}
      {showGreeting && !open && (
        <div className="fixed bottom-24 right-5 z-50 w-[320px] max-w-[calc(100vw-32px)] animate-in fade-in slide-in-from-bottom-3">
          <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-4 shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />

            <button
              type="button"
              onClick={() => setShowGreeting(false)}
              aria-label="Close greeting"
              className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3 pr-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-sm">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>

              <div>
                <h3 className="font-semibold text-foreground">
                  Need help choosing?
                </h3>

                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Tell me your budget and what you need. I’ll find matching
                  products for you.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setOpen(true);
                setShowGreeting(false);
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              <Bot className="h-4 w-4" />
              Start shopping
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      {!open && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setShowGreeting(false);
          }}
          aria-label="Open shopping assistant"
          className="group fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl active:scale-95"
        >
          <span className="absolute inset-0 animate-ping rounded-2xl bg-primary opacity-20" />

          <Sparkles className="relative h-6 w-6 transition group-hover:rotate-12" />
        </button>
      )}

      {/* Chat */}
      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-[430px] max-w-[calc(100vw-24px)] animate-in fade-in slide-in-from-bottom-4 sm:bottom-5 sm:right-5">
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close shopping assistant"
              className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground shadow-sm backdrop-blur transition hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <AIProductAssistant />
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatButton;
