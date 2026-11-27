import { Wrench } from "lucide-react";
import { fmtHours } from "@/lib/api";

export interface MonthlyData {
  month: string;
  hours: number;
  orders: number;
}

export interface CategoryData {
  name: string;
  /** Número absoluto de OS da máquina. */
  count: number;
  /** Percentual sobre o total de OS (0-100). */
  percent: number;
}

interface AnalyticsProps {
  monthlyHistory?: MonthlyData[];
  categoryBreakdown?: CategoryData[];
  totalHoursMonth: number;
  totalOrdersMonth: number;
}

export function CockpitAnalytics({ monthlyHistory = [], categoryBreakdown = [] }: AnalyticsProps) {
  const maxHours = Math.max(...monthlyHistory.map((d) => d.hours), 1);
  const maxCount = Math.max(...categoryBreakdown.map((c) => c.count), 1);
  const totalHoursPeriod = monthlyHistory.reduce((s, m) => s + m.hours, 0);
  const totalOrdersPeriod = monthlyHistory.reduce((s, m) => s + m.orders, 0);

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      {/* Horas por mês (6 meses) */}
      <section aria-labelledby="horas-titulo" className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 id="horas-titulo" className="text-sm font-medium text-foreground">
              Horas técnicas por mês
            </h2>
            <p className="text-xs text-muted-foreground">Últimos 6 meses · número de OS abaixo de cada mês</p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <span className="font-mono text-foreground">{fmtHours(totalHoursPeriod)}</span> em{" "}
            <span className="font-mono text-foreground">{totalOrdersPeriod}</span> OS
          </div>
        </div>

        <div className="flex h-52 items-end gap-2 sm:gap-4" role="list">
          {monthlyHistory.map((item, idx) => {
            const isCurrent = idx === monthlyHistory.length - 1;
            const height = item.hours > 0 ? Math.max((item.hours / maxHours) * 100, 4) : 0;
            return (
              <div
                key={item.month + idx}
                role="listitem"
                aria-label={`${item.month}: ${item.hours} horas, ${item.orders} OS`}
                className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
              >
                <span className="font-mono text-[11px] text-muted-foreground">
                  {item.hours > 0 ? `${Math.round(item.hours)}h` : "—"}
                </span>
                <div className="flex h-36 w-full max-w-12 items-end border-b border-border">
                  <div
                    style={{ height: `${height}%` }}
                    className={
                      "w-full rounded-t-sm transition-[height] duration-500 ease-[var(--ease-out)] " +
                      (isCurrent ? "bg-primary" : "bg-muted-foreground/35")
                    }
                  />
                </div>
                <span className={"text-xs " + (isCurrent ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {item.month}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">{item.orders} OS</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Máquinas com mais intervenções */}
      <section aria-labelledby="maquinas-titulo" className="flex flex-col rounded-lg border border-border bg-card p-5">
        <div className="mb-4">
          <h2 id="maquinas-titulo" className="text-sm font-medium text-foreground">
            Máquinas com mais OS
          </h2>
          <p className="text-xs text-muted-foreground">Onde a manutenção mais se repete (todo o histórico)</p>
        </div>

        {categoryBreakdown.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
            <Wrench aria-hidden="true" className="mb-2 h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Sem histórico ainda</p>
            <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
              Registre ordens de serviço informando a máquina para ver onde as falhas se concentram.
            </p>
          </div>
        ) : (
          <ol className="space-y-3">
            {categoryBreakdown.map((cat, idx) => (
              <li key={cat.name + idx} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-foreground" title={cat.name}>
                    {cat.name}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {cat.count} OS · {cat.percent}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    style={{ width: `${(cat.count / maxCount) * 100}%` }}
                    className={"h-full rounded-full " + (idx === 0 ? "bg-primary" : "bg-muted-foreground/45")}
                  />
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
