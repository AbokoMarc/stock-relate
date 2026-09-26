export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-display text-xl lg:text-2xl text-paper">{title}</h1>
        {subtitle && <p className="text-sm text-paper/50 mt-1 max-w-xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
