interface AvatarInitialsProps {
  name: string;
  size?: "md" | "lg";
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AvatarInitials({ name, size = "lg" }: AvatarInitialsProps) {
  const dimensions = size === "lg" ? "h-20 w-20 text-2xl" : "h-10 w-10 text-sm";

  return (
    <div
      className={`flex ${dimensions} shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-700 font-bold text-white`}
      aria-hidden="true"
    >
      {getInitials(name || "?")}
    </div>
  );
}