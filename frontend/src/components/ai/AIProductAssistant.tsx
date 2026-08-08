import { useState, useRef, useEffect, FormEvent } from "react";
import { Send, Bot, User } from "lucide-react";
import { askAssistant, AssistantTurn } from "@/api/ai.api";
import ProductCard from "@/components/shared/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
}

const STARTER_PROMPTS = [
  "📺 Help me find the perfect TV for my home",
  "❄️ Recommend a refrigerator that suits my needs",
  "📱 Help me choose the right smartphone",
];

const AIProductAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I can help you find the perfect gadget. Tell me what you need — TV, refrigerator, mobile, laptop, audio, or accessories."
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const history: AssistantTurn[] = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await askAssistant(text, history);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: res.message,
          products: res.products,
        },
      ]);
    } catch (err) {
      setError("Something went wrong reaching the assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="flex h-[480px] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
        <Bot className="h-4 w-4 text-primary-foreground" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">Shopping Assistant</p>
        <p className="text-xs text-muted-foreground">Ask me what you're looking for</p>
      </div>
    </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className={`max-w-[80%] ${m.role === "user" ? "order-first" : ""}`}>
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm ${m.role === "user"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-muted/70 text-foreground shadow-sm"
                  }`}
              >
                {m.content.split("\n").map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>

              {m.products && m.products.length > 0 && (
                <div className="mt-3 space-y-3">
                  {m.products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </div>
            {m.role === "user" && (
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start gap-2">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-md bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{error}</p>
        )}

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pl-9">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => send(prompt)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border px-3 py-3">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type what you're looking for…"
          disabled={loading}
          className="flex-1 rounded-full"
        />
        <Button
          type="submit"
          size="icon"
          disabled={loading || !input.trim()}
          aria-label="Send message"
          className="flex-shrink-0 rounded-full"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default AIProductAssistant;