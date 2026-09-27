const TONE_STYLES: Record<string, string> = {
  neutral: "bg-base-700 text-paper/70",
  clay: "bg-clay-500/20 text-clay-700",
  forest: "bg-forest-600/15 text-forest-600",
  alert: "bg-alert-500/15 text-alert-500",
};

export default function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "clay" | "forest" | "alert";
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TONE_STYLES[tone]}`}>
      {children}
    </span>
  );
}
