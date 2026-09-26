export default function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "warn" | "good";
}) {
  const toneClass =
    tone === "warn" ? "text-clay-400" : tone === "good" ? "text-forest-400" : "text-paper";
  return (
    <div className="rounded-xl border border-base-700 bg-base-900 p-4">
      <p className="text-xs text-paper/50">{label}</p>
      <p className={`font-display text-2xl mt-1.5 ${toneClass}`}>{value}</p>
      {hint && <p className="text-xs text-paper/40 mt-1">{hint}</p>}
    </div>
  );
}
