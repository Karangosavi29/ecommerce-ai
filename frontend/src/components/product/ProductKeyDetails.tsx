import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ProductKeyDetailsProps {
  description: string;
}

const COLLAPSED_LIMIT = 4;

export function ProductKeyDetails({ description }: ProductKeyDetailsProps) {
  const [expanded, setExpanded] = useState(false);

  const lines = description
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const hasMore = lines.length > 1 && lines.length > COLLAPSED_LIMIT;
  const visibleLines = expanded ? lines : lines.slice(0, COLLAPSED_LIMIT);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="mb-3 text-base font-bold text-foreground">About this item</p>
      {lines.length > 1 ? (
        <>
          <ul className="space-y-2.5">
            {visibleLines.map((line, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span className="leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>

          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {expanded ? (
                <>
                  Show less <ChevronUp className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Show {lines.length - COLLAPSED_LIMIT} more <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          )}
        </>
      ) : (
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}