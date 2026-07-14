import { cn } from "@/lib/utils";

function getStrength(password: string): { score: number; label: string } {
  if (!password) return { score: 0, label: "" };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  return { score, label: labels[Math.min(score, 4)] };
}

const BAR_COLORS = ["bg-destructive", "bg-destructive", "bg-warning", "bg-primary", "bg-success"];

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { score, label } = getStrength(password);

  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < score ? BAR_COLORS[Math.min(score, 4)] : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}