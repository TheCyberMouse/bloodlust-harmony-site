/**
 * CSS-only hover tooltip. Server-renderable: shows `panel` above the child on
 * hover. Pass panel = null to render the child bare.
 */
export default function HoverCard({
  children,
  panel,
  className = "",
}: {
  children: React.ReactNode;
  panel: React.ReactNode;
  className?: string;
}) {
  if (!panel) return <>{children}</>;
  return (
    <span className={`group relative inline-block ${className}`}>
      {children}
      <span className="pointer-events-none invisible absolute bottom-full left-1/2 z-30 mb-2 w-max max-w-xs -translate-x-1/2 rounded-lg border border-bh-rule bg-bh-night px-3 py-2.5 opacity-0 shadow-xl transition-opacity duration-100 group-hover:visible group-hover:opacity-100">
        {panel}
      </span>
    </span>
  );
}
