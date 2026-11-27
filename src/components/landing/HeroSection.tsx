import { ArrowRight, MessageSquare, ShieldCheck, Smartphone, Wrench } from "lucide-react";

interface HeroSectionProps {
  whatsappUrlService?: string;
  whatsappUrlSoftware?: string;
}

const DEFAULT_SOFTWARE_URL =
  "https://wa.me/5547988485668?text=" +
  encodeURIComponent("Olá! Gostaria de agendar uma demonstração do software T-Maint para minha empresa.");

export function HeroSection({ whatsappUrlSoftware }: HeroSectionProps) {
  const targetSoftwareUrl = whatsappUrlSoftware || DEFAULT_SOFTWARE_URL;

  return (
    <section id="solucoes" className="relative overflow-hidden border-b border-border pb-16 pt-14 sm:pb-24 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-brand-300">Software de gestão de manutenção industrial</p>
          <h1 className="mt-4 text-[34px] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[56px]">
            Manutenção sob controle, do chão de fábrica ao faturamento.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Ordens de serviço no celular, laudo assinado na hora, horas e KM apurados sem planilha e o histórico de cada
            máquina a um QR Code de distância.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={targetSoftwareUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-[background-color,transform] duration-[120ms] hover:bg-primary/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
            >
              <MessageSquare aria-hidden="true" className="h-4 w-4" /> Agendar demonstração
            </a>
            <a
              href="#plataforma"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-6 text-sm font-medium text-foreground transition-[background-color,transform] duration-[120ms] hover:bg-accent active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
            >
              Ver o sistema por dentro <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>

          <ul className="mt-8 flex flex-col items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground sm:flex-row">
            <li className="flex items-center gap-2">
              <Wrench aria-hidden="true" className="h-4 w-4 text-brand-400" /> Criado por técnico com 7 anos na WEG
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" className="h-4 w-4 text-brand-400" /> Dados isolados por empresa (LGPD)
            </li>
            <li className="flex items-center gap-2">
              <Smartphone aria-hidden="true" className="h-4 w-4 text-brand-400" /> Sem app para instalar
            </li>
          </ul>
        </div>

        <ProductPreview />
      </div>
    </section>
  );
}

/**
 * Prévia do Painel real do T-Maint, montada com os mesmos padrões visuais do sistema.
 * Usa dados de exemplo (nunca dados de clientes) e é rotulada como tal.
 */
function ProductPreview() {
  const actions = [
    { n: 2, label: "Urgentes ou alta prioridade", hint: "Torno CNC · alarme de spindle", bar: "bg-destructive", text: "text-destructive" },
    { n: 3, label: "Abertas há mais de 7 dias", hint: "Mais antiga: OS #0412 · 11 dias", bar: "bg-warning", text: "text-warning" },
    { n: 1, label: "Sem assinatura do cliente", hint: "Laudo sem aceite formal", bar: "bg-info", text: "text-info" },
    { n: 4, label: "Fechadas, a receber", hint: "R$ 6.840,00 em aberto", bar: "bg-primary", text: "text-foreground" },
  ];
  const kpis = [
    { label: "Atendimentos", value: "38", delta: "+6", up: true },
    { label: "Horas em campo", value: "142h 30m", delta: "+18h", up: true },
    { label: "Deslocamento", value: "1.284 km", delta: "−96 km", up: null },
    { label: "Faturamento", value: "R$ 48.920", delta: "+12%", up: true },
  ];
  const bars = [52, 61, 48, 70, 66, 82];
  const months = ["Jun", "Jul", "Ago", "Set", "Out", "Nov"];

  return (
    <figure className="mx-auto mt-14 max-w-5xl sm:mt-16">
      <div className="overflow-hidden rounded-lg border border-border bg-background shadow-[0_24px_64px_-24px_rgba(0,0,0,0.6)]">
        <div className="flex">
          {/* Menu lateral resumido */}
          <div className="hidden w-44 shrink-0 border-r border-border bg-sidebar p-3 md:block" aria-hidden="true">
            <div className="mb-4 flex items-center gap-2 px-1">
              <div className="h-5 w-5 rounded bg-primary/80" />
              <span className="text-xs font-semibold text-foreground">T-Maint</span>
            </div>
            {["Painel", "Ordens de serviço", "Orçamentos", "Requisições", "Clientes e máquinas", "Técnicos", "Financeiro"].map(
              (l, i) => (
                <div
                  key={l}
                  className={
                    "mb-0.5 rounded px-2 py-1.5 text-[11px] " +
                    (i === 0 ? "bg-sidebar-accent font-medium text-foreground" : "text-sidebar-foreground")
                  }
                >
                  {l}
                </div>
              ),
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-4 p-4 text-left sm:p-5">
            <div className="flex items-end justify-between border-b border-border pb-3">
              <div>
                <div className="text-base font-semibold text-foreground">Painel</div>
                <div className="text-[11px] text-muted-foreground">Novembro de 2026</div>
              </div>
              <div className="rounded bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground">+ Nova OS</div>
            </div>

            <div>
              <div className="mb-2 text-[11px] font-medium text-foreground">Precisa de ação</div>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                {actions.map((a) => (
                  <div key={a.label} className="relative rounded-md border border-border bg-card py-2.5 pl-3.5 pr-2.5">
                    <span className={"absolute inset-y-0 left-0 w-1 rounded-l-md " + a.bar} />
                    <div className="flex items-baseline gap-1.5">
                      <span className={" text-lg font-semibold " + a.text}>{a.n}</span>
                      <span className="truncate text-[11px] font-medium text-foreground">{a.label}</span>
                    </div>
                    <div className="truncate text-[10px] text-muted-foreground">{a.hint}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {kpis.map((k) => (
                <div key={k.label} className="rounded-md border border-border bg-card p-2.5">
                  <div className="text-[10px] text-muted-foreground">{k.label}</div>
                  <div className="mt-0.5 truncate text-base font-semibold text-foreground">{k.value}</div>
                  <div
                    className={
                      "text-[10px] " +
                      (k.up === null ? "text-muted-foreground" : k.up ? "text-success" : "text-destructive")
                    }
                  >
                    {k.delta} <span className="text-muted-foreground">vs. mês anterior</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden rounded-md border border-border bg-card p-3 sm:block">
              <div className="mb-2 text-[11px] font-medium text-foreground">Horas técnicas por mês</div>
              <div className="flex h-24 items-end gap-3" aria-hidden="true">
                {bars.map((h, i) => (
                  <div key={months[i]} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                    <div
                      style={{ height: `${h}%` }}
                      className={"w-full max-w-8 rounded-t-sm " + (i === bars.length - 1 ? "bg-primary" : "bg-muted-foreground/35")}
                    />
                    <span className="text-[10px] text-muted-foreground">{months[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-muted-foreground">
        Painel do T-Maint com dados de exemplo.
      </figcaption>
    </figure>
  );
}
