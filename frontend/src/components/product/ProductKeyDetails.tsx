interface ProductKeyDetailsProps {
  description: string;
}

export function ProductKeyDetails({ description }: ProductKeyDetailsProps) {
  const lines = description
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="mb-3 text-base font-bold text-foreground">
        {lines.length > 1 ? "Key Features" : "Product Details"}
      </p>
      {lines.length > 1 ? (
        <ul className="space-y-2.5">
          {lines.map((line, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span className="leading-relaxed">{line}</span>
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