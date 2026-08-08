import { useEffect, useState } from "react";
import { Bot, X } from "lucide-react";
import AIProductAssistant from "./AIProductAssistant";

const AIChatButton = () => {
  const [open, setOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("ai_assistant_seen");

    if (!seen) {
      const timer = setTimeout(() => {
        setShowGreeting(true);
        localStorage.setItem("ai_assistant_seen", "true");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {/* Greeting Popup */}
      {showGreeting && !open && (
        <div
          className="
          fixed
          bottom-24
          right-6
          z-50
          w-[300px]
          rounded-2xl
          border
          bg-card
          p-4
          shadow-2xl
          animate-in
          fade-in
          slide-in-from-bottom-4
          "
        >
          <button
            onClick={() => setShowGreeting(false)}
            className="
            absolute
            right-3
            top-3
            text-muted-foreground
            hover:text-foreground
            "
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3">
            <div
              className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-primary
              "
            >
              <Bot  className="h-5 w-5 text-primary-foreground" />
            </div>

            <div>
              <h3 className="font-semibold">
                Need help choosing a gadget?
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                I can help with TVs, mobiles, laptops and appliances.
              </p>
            </div>
          </div>


          <button
            onClick={() => {
              setOpen(true);
              setShowGreeting(false);
            }}
            className="
            mt-4
            w-full
            rounded-full
            bg-primary
            px-4
            py-2
            text-sm
            font-medium
            text-primary-foreground
            hover:opacity-90
            "
          >
            Start Chat
          </button>
        </div>
      )}


      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="
          fixed
          bottom-6
          right-6
          z-50
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-full
          bg-primary
          text-primary-foreground
          shadow-xl
          transition
          hover:scale-110
          "
        >
          <Bot className="h-7 w-7" />
        </button>
      )}


      {/* Chat Window */}
      {open && (
        <div
          className="
          fixed
          bottom-6
          right-6
          z-50
          w-[380px]
          max-w-[calc(100vw-48px)]
          "
        >
          <div className="relative">

            <button
              onClick={() => setOpen(false)}
              className="
              absolute
              right-3
              top-3
              z-10
              rounded-full
              bg-muted
              p-1
              "
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