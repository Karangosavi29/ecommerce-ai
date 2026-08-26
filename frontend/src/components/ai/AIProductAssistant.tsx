import { useState, useRef, useEffect, FormEvent } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import {
  askAssistant,
  AssistantTurn,
  AssistantState,
  QuickReply,
} from "@/api/ai.api";
import ProductCard from "@/components/shared/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
  timestamp: number;
  quickReplies?: QuickReply[];
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! 👋 I’m your shopping assistant. Tell me what you’re looking for and I’ll help you find the right product.",
  timestamp: Date.now(),
};

const STARTER_PROMPTS = [
  {
    emoji: "📱",
    title: "Find a smartphone",
    text: "Help me choose the right smartphone",
  },
  {
    emoji: "📺",
    title: "Find a TV",
    text: "Help me find the perfect TV for my home",
  },
  {
    emoji: "💻",
    title: "Find a laptop",
    text: "Help me choose the right laptop",
  },
  {
    emoji: "❄️",
    title: "Find a refrigerator",
    text: "Recommend a refrigerator that suits my needs",
  },
];

const AIProductAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    WELCOME_MESSAGE,
  ]);

  const [assistantState, setAssistantState] =
    useState<AssistantState>({});

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollRef.current;

    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();

    if (!trimmed || loading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const history: AssistantTurn[] = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await askAssistant(
        trimmed,
        history,
        assistantState
      );

      // Save the latest conversation state returned by backend.
      setAssistantState(res.state ?? {});

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: res.message,
          products: res.products,
          timestamp: Date.now(),
          quickReplies: res.quickReplies,
        },
      ]);
    } catch (err) {
      console.error("AI assistant error:", err);

      setError(
        "I couldn't reach the shopping assistant. Please try again."
      );
    } finally {
      setLoading(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const resetChat = () => {
    setMessages([
      {
        ...WELCOME_MESSAGE,
        id: "welcome",
        timestamp: Date.now(),
      },
    ]);

    // Important: reset conversation state too.
    setAssistantState({});

    setInput("");
    setError(null);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="flex h-[min(680px,calc(100vh-48px))] w-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-background shadow-2xl">
      {/* Header */}
      <div className="relative flex items-center justify-between border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-sm">
            <Sparkles className="h-5 w-5 text-primary-foreground" />

            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">
                Shopping Assistant
              </p>

              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                Online
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Find products that fit your needs
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={resetChat}
          title="Start new chat"
          className="rounded-xl p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-muted/20 to-background px-3 py-5 sm:px-4"
      >
        <div className="space-y-5">
          {messages.map((message) => {
            const isAssistant = message.role === "assistant";

            return (
              <div
                key={message.id}
                className={`flex gap-2.5 ${
                  isAssistant ? "justify-start" : "justify-end"
                }`}
              >
                {isAssistant && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}

                <div
                  className={`min-w-0 ${
                    isAssistant ? "max-w-[92%]" : "max-w-[82%]"
                  }`}
                >
                  {/* Message bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                      isAssistant
                        ? "rounded-tl-md border border-border/60 bg-card text-foreground shadow-sm"
                        : "rounded-tr-md bg-primary text-primary-foreground shadow-sm"
                    }`}
                  >
                    {message.content.split("\n").map((line, index, lines) => (
                      <span key={index}>
                        {line}

                        {index < lines.length - 1 && <br />}
                      </span>
                    ))}
                  </div>

                  {/* Product carousel */}
                  {message.products &&
                    message.products.length > 0 && (
                      <div className="mt-3 -mr-3 overflow-x-auto pb-2 scrollbar-thin">
                        <div className="flex w-max gap-3 pr-3">
                          {message.products.map((product) => (
                            <div
                              key={product._id}
                              className="w-[270px] shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                              <ProductCard product={product} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Quick replies from backend */}
                  {message.quickReplies &&
                    message.quickReplies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.quickReplies.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => send(option.value)}
                            disabled={loading}
                            className="rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium text-primary transition hover:border-primary/40 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}

                  {/* Recommendation actions */}
                  {message.products &&
                    message.products.length > 0 && (
                      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                        <button
                          type="button"
                          onClick={() =>
                            send(
                              "Show me more options from the current catalog that match my previous requirements."
                            )
                          }
                          disabled={loading}
                          className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary disabled:opacity-50"
                        >
                          Show more

                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            send(
                              "Help me compare the products you just recommended."
                            )
                          }
                          disabled={loading}
                          className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary disabled:opacity-50"
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5" />

                          Compare
                        </button>
                      </div>
                    )}
                </div>

                {!isAssistant && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Welcome choices */}
          {messages.length === 1 && !loading && (
            <div className="pl-10">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                What are you shopping for?
              </p>

              <div className="grid grid-cols-2 gap-2">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.text}
                    type="button"
                    onClick={() => send(prompt.text)}
                    className="group flex items-center gap-2.5 rounded-2xl border border-border/70 bg-card px-3 py-3 text-left text-xs shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="text-lg">
                      {prompt.emoji}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-foreground">
                        {prompt.title}
                      </span>

                      <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                        Get personalized recommendations
                      </span>
                    </span>

                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>

              <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-border/60 bg-card px-4 py-3 shadow-sm">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />

                <span
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: "0.15s" }}
                />

                <span
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="ml-10 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}

              <button
                type="button"
                onClick={() => setError(null)}
                className="ml-2 font-medium underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border/70 bg-background p-3">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-2xl border border-border bg-muted/30 p-1.5 transition focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10"
        >
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me what you're looking for..."
            disabled={loading}
            className="h-10 border-0 bg-transparent px-3 shadow-none focus-visible:ring-0"
          />

          <Button
            type="submit"
            size="icon"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="h-10 w-10 shrink-0 rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        <p className="pt-2 text-center text-[10px] text-muted-foreground">
          AI recommendations are based on products available in this store.
        </p>
      </div>
    </div>
  );
};

export default AIProductAssistant;
