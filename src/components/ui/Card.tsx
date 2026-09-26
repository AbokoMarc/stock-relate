export default function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-base-700 bg-base-900 p-4 lg:p-5 ${className}`}>
      {children}
    </div>
  );
}
