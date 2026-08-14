import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export default function TopLoadingBar() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setVisible(true);
    setProgress(15);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const step = prev < 50 ? 10 : prev < 75 ? 4 : 1;
        return Math.min(prev + step, 90);
      });
    }, 150);

    const finishTimeout = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setVisible(false), 250);
      if (timerRef.current) clearInterval(timerRef.current);
    }, 400);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearTimeout(finishTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, navigationType]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "3px",
        width: `${progress}%`,
        background: "linear-gradient(to right, #6366f1, #8b5cf6)",
        transition: "width 200ms ease-out, opacity 250ms ease-out",
        opacity: progress === 100 ? 0 : 1,
        zIndex: 9999,
        boxShadow: "0 0 8px rgba(99, 102, 241, 0.6)",
      }}
    />
  );
}