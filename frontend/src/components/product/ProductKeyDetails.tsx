interface ProductKeyDetailsProps {
  description: string;
}

export function ProductKeyDetails({ description }: ProductKeyDetailsProps) {
  const lines = description
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-2 text-sm font-semibold text-foreground">Product Details</p>
      {lines.length > 1 ? (
        <ul className="space-y-1.5">
          {lines.map((line, i) => (
            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
              {line}
            </li>
          ))}
        </ul>
      ) : (
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}