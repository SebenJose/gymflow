type StatProps = { label: string; value: string; hint?: string };

/** Número de destaque com rótulo, para resumos. */
export function Stat({ label, value, hint }: StatProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-surface p-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
      {hint !== undefined && <dd className="text-xs text-muted">{hint}</dd>}
    </div>
  );
}
