import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, Check } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    toast.success("Thanks for subscribing!");
    setEmail("");
    window.setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="py-10 sm:py-14">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center gap-4 rounded-lg bg-gradient-to-br from-primary to-blue-700 px-6 py-12 text-center text-white sm:px-12"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
            <Mail className="h-6 w-6" />
          </span>
          <h2 className="text-2xl font-bold sm:text-3xl">Get deals in your inbox</h2>
          <p className="max-w-md text-sm text-white/85 sm:text-base">
            Sign up for occasional updates on new arrivals and offers. No spam.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-2 flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <Input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 rounded-full border-0 bg-white text-foreground placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              size="lg"
              className="h-11 shrink-0 gap-2 rounded-full bg-white text-primary hover:bg-white/90"
            >
              {submitted ? <Check className="h-4 w-4" /> : null}
              {submitted ? "Subscribed" : "Subscribe"}
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}