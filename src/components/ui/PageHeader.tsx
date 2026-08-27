export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-3xl sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
