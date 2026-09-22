import { Wrench, Zap, Cog, Cpu, Phone, ShieldCheck, CheckCircle2, ArrowLeft, Users, ChevronRight, Activity } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export function FieldServicesPage() {
  const WHATSAPP_NUMBER = "5547996362244";
  const whatsappUrlEmergency = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Olá João! Gostaria de solicitar um diagnóstico / atendimento técnico emergencial em máquina CNC em campo."
  )}`;
  const whatsappUrlPartners = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Olá João! Sou prestador de serviços / oficina de manutenção CNC e gostaria de me cadastrar na rede de parceiros homologados T-MAINT."
  )}`;

  const cncBrands = [
    { name: "Okuma", desc: "Comandos OSP / Motores & Drives" },
    { name: "Fanuc", desc: "Séries 0i / 31i / Motores Alpha" },
    { name: "Siemens", desc: "Sinumerik 808D / 828D / 840D" },
    { name: "Yaskawa", desc: "Servodrives Sigma V / VII" },
    { name: "Fagor", desc: "Comandos 8055 / 8065" },
    { name: "Mitsubishi", desc: "Meldas / M70 / M80" },
    { name: "Heidenhain", desc: "TNC 320 / 620 / 640 & Encoders" },
    { name: "Romi", desc: "Tornos CNC e Centros Mach 9 / D" },
  ];

  const servicePillars = [
    {
      icon: Zap,
      iconColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      title: "Diagnóstico Elétrico em Campo",
      desc: "Intervenção direta na fábrica para diagnóstico de alarmes críticos, falhas de barramento DC, servomotores, drivers, fontes, encoders, réguas ópticas e I/O de segurança.",
      badge: "Atendimento Presencial",
      badgeColor: "text-cyan-400 border-cyan-500/30",
    },
    {
      icon: ShieldCheck,
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      title: "Parametrização & Retrofit CNC",
      desc: "Sintonia de malhas de posição e velocidade, parametrização de eixos, adequação de ladder PLC e modernização de comandos e acionamentos obsoletos.",
      badge: "Alta Precisão",
      badgeColor: "text-emerald-400 border-emerald-500/30",
    },
    {
      icon: Cog,
      iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      title: "Mecânica com Rede Homologada",
      desc: "Parceria com especialistas de campo para revisão de fusos de esferas, alinhamento de geometria, guias lineares, caixas de engrenagens e torre porta-ferramentas.",
      badge: "Rede Homologada",
      badgeColor: "text-amber-400 border-amber-500/30",
    },
    {
      icon: Cpu,
      iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      title: "Reparo Eletrônico em Bancada",
      desc: "Intermediação técnica com laboratório eletrônico de alta precisão para recuperação de servodrives, placas de comando, fontes chaveadas e I/O sob teste com carga real.",
      badge: "Bancada de Teste",
      badgeColor: "text-purple-400 border-purple-500/30",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/90 border-b border-slate-800/80 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors">
              <Wrench className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-white">
                T-MAINT
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                CNC Field
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-900 border border-slate-800"
            >
              <ArrowLeft className="h-4 w-4 text-cyan-400" /> Conhecer Software SaaS
            </Link>

            <a
              href={whatsappUrlEmergency}
              target="_blank"
              rel="noreferrer"
            >
              <ShimmerButton
                variant="amber"
                shimmerDuration="2s"
                className="text-xs font-semibold uppercase tracking-wider py-2 px-3.5"
              >
                <Phone className="h-3.5 w-3.5 mr-1.5" /> Plantão Técnico
              </ShimmerButton>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono mb-6">
              <Activity className="h-3.5 w-3.5 animate-pulse" /> Atendimento Técnico Especializado em Campo
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Diagnóstico Elétrico, Parametrização e Manutenção de Máquinas CNC.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed">
              Atuação presencial de engenharia para identificar a causa-raiz de paradas críticas em tornos e centros de usinagem CNC. Suporte elétrico especializado integrado a uma rede de parceiros homologados para serviços mecânicos pesados e bancada eletrônica.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={whatsappUrlEmergency}
                target="_blank"
                rel="noreferrer"
              >
                <ShimmerButton
                  variant="amber"
                  shimmerDuration="2s"
                  className="text-xs sm:text-sm uppercase tracking-wider py-3.5 px-6 font-bold"
                >
                  <Phone className="h-4 w-4 mr-2" /> Chamar Especialista no WhatsApp
                </ShimmerButton>
              </a>

              <Link
                to="/"
<<<<<<< HEAD
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/50 hover:bg-slate-900 text-xs sm:text-sm font-mono text-cyan-300 transition-all"
=======
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/50 hover:bg-slate-900 text-xs sm:text-sm font-medium text-cyan-300 transition-all"
>>>>>>> main
              >
                Conhecer Software T-MAINT <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 border-b border-slate-800/80 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono uppercase font-bold tracking-widest text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded bg-cyan-950/40">
              Escopo de Atuação
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Soluções Completas para Redução Imediata de Máquina Parada
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicePillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className={`p-3 rounded-xl border w-fit mb-4 ${pillar.iconColor}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{pillar.title}</h3>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed">{pillar.desc}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded border bg-slate-950 ${pillar.badgeColor}`}>
                      {pillar.badge}
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CNC Brands & Controllers Matrix */}
      <section className="py-20 border-b border-slate-800/80 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-2xl bg-slate-900/60 border border-slate-800 relative overflow-hidden">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-mono uppercase font-bold tracking-widest text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded bg-cyan-950/40">
                Domínio Tecnológico
              </span>
              <h3 className="mt-4 text-2xl font-extrabold text-white tracking-tight">
                Principais Comandos e Fabricantes Atendidos
              </h3>
              <p className="mt-2 text-xs font-mono text-slate-400">
                Diagnóstico estruturado baseado nos manuais de alarmes, diagramas elétricos e rotinas internas de cada fabricante.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {cncBrands.map((b, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center hover:border-cyan-500/40 transition-colors"
                >
                  <div className="text-sm font-bold text-white">{b.name}</div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">{b.desc}</div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <a
                href={whatsappUrlEmergency}
                target="_blank"
                rel="noreferrer"
                className="inline-block"
              >
                <ShimmerButton
                  variant="teal"
                  shimmerDuration="2.5s"
                  className="text-xs uppercase tracking-wider py-3.5 px-8 font-bold"
                >
                  <Phone className="h-4 w-4 mr-2" /> Consultar Atendimento para Sua Máquina
                </ShimmerButton>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Network & Ecosystem Section */}
      <section className="py-20 border-b border-slate-800/80 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-4">
                <Users className="h-3.5 w-3.5" /> Rede de Especialistas
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                É prestador de serviços ou oficina de manutenção CNC?
              </h2>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                Estamos homologando técnicos mecânicos, especialistas em geometria e laboratórios eletrônicos para compor a rede integrada do T-MAINT. Receba demandas industriais qualificadas na sua região com total suporte e laudos técnicos padronizados.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <a
                  href={whatsappUrlPartners}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ShimmerButton
                    variant="cyan"
                    shimmerDuration="2.5s"
                    className="text-xs uppercase tracking-wider py-3 px-5 font-bold"
                  >
                    Quero ser Parceiro Homologado
                  </ShimmerButton>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-3 text-slate-300">
              <div className="text-cyan-400 font-bold text-sm border-b border-slate-800 pb-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Critérios de Homologação
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Experiência comprovada em chão de fábrica e máquinas CNC.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Compromisso com emissão de laudo técnico detalhado e rastreabilidade.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Ética profissional e pontualidade no atendimento ao cliente final.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Link Back to Software Section */}
      <section className="py-16 bg-gradient-to-b from-slate-950 to-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Procurando o software de gestão de manutenção da sua própria equipe?
          </h3>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl mx-auto">
            Conheça o sistema T-MAINT: Gestão de O.S., leitura de Machine QR Tag, apontamento de horas/KM e controle de estoque com planos a partir de R$ 197/mês.
          </p>
          <div className="mt-6">
            <Link to="/">
              <ShimmerButton
                variant="cyan"
                shimmerDuration="2.5s"
                className="text-xs uppercase tracking-wider py-3 px-6 font-bold"
              >
                Ver Planos e Recursos do Software SaaS →
              </ShimmerButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800/80 bg-slate-950 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} T-MAINT • Atendimento Técnico & Diagnóstico CNC em Campo
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/" className="hover:text-cyan-400 transition-colors">Software SaaS</Link>
            <Link to="/privacidade" className="hover:text-cyan-400 transition-colors">Privacidade (LGPD)</Link>
            <Link to="/termos" className="hover:text-cyan-400 transition-colors">Termos de Uso</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
