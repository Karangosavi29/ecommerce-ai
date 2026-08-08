import { useState } from "react";
import { Bot, X } from "lucide-react";
import AIProductAssistant from "./AIProductAssistant";
import { Button } from "@/components/ui/button";

export default function FloatingAIProductAssistant() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[calc(100vw-40px)] max-w-md">
          <div className="relative">
            <Button
              onClick={() => setOpen(false)}
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 z-10"
            >
              <X className="h-5 w-5" />
            </Button>

            <AIProductAssistant />
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition hover:scale-110"
        aria-label="Open AI Assistant"
      >
        <Bot className="h-7 w-7" />
      </button>
    </>
  );
}