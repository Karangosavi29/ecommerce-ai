import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ProductSpecsTableProps {
  specifications?: { key: string; value: string }[];
}

const COLLAPSED_LIMIT = 5;

export function ProductSpecsTable({ specifications }: ProductSpecsTableProps) {
  const [expanded, setExpanded] = useState(false);

  if (!specifications || specifications.length === 0) return null;

  const hasMore = specifications.length > COLLAPSED_LIMIT;
  const visibleSpecs = expanded ? specifications : specifications.slice(0, COLLAPSED_LIMIT);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-3 text-sm font-semibold text-foreground">Specifications</p>
      <dl className="divide-y divide-border">
        {visibleSpecs.map((spec) => (
          <div key={spec.key} className="grid grid-cols-2 gap-4 py-2 text-sm">
            <dt className="text-muted-foreground">{spec.key}</dt>
            <dd className="text-foreground">{spec.value}</dd>
          </div>
        ))}
      </dl>

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
              Show {specifications.length - COLLAPSED_LIMIT} more <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      )}
    </div>
  );
}