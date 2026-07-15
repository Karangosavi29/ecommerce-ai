import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function getMsUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function FlashSaleCountdown() {
  const [remaining, setRemaining] = useState(getMsUntilMidnight());

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getMsUntilMidnight()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className="flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive"
      role="timer"
      aria-live="off"
    >
      <Clock className="h-4 w-4" />
      Resets in {formatDuration(remaining)}
    </div>
  );
}