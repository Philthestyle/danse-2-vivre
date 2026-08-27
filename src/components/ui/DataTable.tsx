import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  empty = "Aucun élément.",
  actions,
}: {
  rows: T[];
  columns: Column<T>[];
  empty?: string;
  actions?: (row: T) => React.ReactNode;
}) {
  if (rows.length === 0) {
    return (
      <div className="card p-8 text-center text-muted">{empty}</div>
    );
  }
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-elevated/60">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-4 py-3 text-left font-semibold uppercase tracking-wider text-xs text-muted",
                    c.className
                  )}
                >
                  {c.header}
                </th>
              ))}
              {actions && <th className="px-4 py-3" aria-label="Actions" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border">
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-4 py-3 align-middle", c.className)}>
                    {c.render
                      ? c.render(row)
                      : ((row as unknown as Record<string, unknown>)[c.key] as React.ReactNode)}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">{actions(row)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
