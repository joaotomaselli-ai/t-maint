import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ServiceReport, ServiceSession } from "@/lib/api";
import { reportTotalsWithSessions, fmtHours } from "@/lib/api";
import {
  Cog,
  Wrench,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Phone,
  FileText,
  ShieldCheck,
  Building2,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import logoTmaint from "@/assets/logo-tmaint-icon.png";

export const Route = createFileRoute("/m/$machineId")({
  component: MachineTimelinePage,
});

export function MachineTimelinePage() {
  const params = Route.useParams();
  const machineName = decodeURIComponent(params.machineId || "");

  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ServiceReport[]>([]);
  const [sessions, setSessions] = useState<ServiceSession[]>([]);
  const [clientName, setClientName] = useState<string>("");

  useEffect(() => {
    async function loadMachineData() {
      if (!machineName) return;
      setLoading(true);
      try {
        // Query activities for this machine (case-insensitive match)
        const { data: acts, error: actErr } = await (supabase as any)
          .from("activities")
          .select("*")
          .ilike("machine", `%${machineName}%`)
          .order("date", { ascending: false });

        if (actErr) throw actErr;

        if (acts && acts.length > 0) {
          const actIds = acts.map((a: any) => a.id);
          const { data: sessData } = await (supabase as any)
            .from("service_sessions")
            .select("*")
            .in("activity_id", actIds);

          // Get client name if available
          if (acts[0].client_id) {
            const { data: clientData } = await (supabase as any)
              .from("clients")
              .select("name")
              .eq("id", acts[0].client_id)
              .single();
            if (clientData) setClientName(clientData.name);
          }

          setReports(
            acts.map((r: any) => ({
              id: r.id,
              orderNumber: r.order_number,
              clientId: r.client_id,
              date: r.date,
              machine: r.machine,
              requester: r.requester,
              type: r.type,
              description: r.description,
              summary: r.summary,
              travelOutStart: r.travel_out_start,
              travelOutEnd: r.travel_out_end,
              serviceStart: r.service_start,
              serviceEnd: r.service_end,
              travelBackStart: r.travel_back_start,
              travelBackEnd: r.travel_back_end,
              km: r.km || 0,
              observation: r.observation,
              technician: r.technician,
              overtimeWeekdayHours: r.overtime_weekday_hours || 0,
              overtimeWeekendHours: r.overtime_weekend_hours || 0,
              futureReplacements: r.future_replacements,
              discountHours: r.discount_hours || 0,
              lunchHours: r.lunch_hours || 0,
              deductLunchFromClient: r.deduct_lunch_from_client || false,
              downtimeHours: r.downtime_hours || 0,
              clientSignature: r.client_signature,
              technicianSignature: r.technician_signature,
              isPackage: r.is_package || false,
              packageValue: r.package_value,
              packageContractFile: r.package_contract_file,
              createdAt: r.created_at,
            }))
          );

          if (sessData) {
            setSessions(
              sessData.map((s: any) => ({
                id: s.id,
                activityId: s.activity_id,
                date: s.date,
                technicianId: s.technician_id,
                serviceStart: s.service_start,
                serviceEnd: s.service_end,
                travelOutStart: s.travel_out_start,
                travelOutEnd: s.travel_out_end,
                travelBackStart: s.travel_back_start,
                travelBackEnd: s.travel_back_end,
                km: s.km || 0,
                lunchHours: s.lunch_hours || 0,
                deductLunchFromClient: s.deduct_lunch_from_client || false,
                downtimeHours: s.downtime_hours || 0,
                overtimeWeekdayHours: s.overtime_weekday_hours || 0,
                overtimeWeekendHours: s.overtime_weekend_hours || 0,
                observation: s.observation,
                createdAt: s.created_at,
              }))
            );
          }
        }
      } catch (e) {
        console.error("Error loading machine timeline:", e);
      } finally {
        setLoading(false);
      }
    }

    loadMachineData();
  }, [machineName]);

  const totalDowntime = reports.reduce((acc, r) => acc + (r.downtimeHours || 0), 0);
  const corretivas = reports.filter((r) => r.type === "corretiva").length;
  const preventivas = reports.filter((r) => r.type === "preventiva").length;
  const lastMaintenance = reports.length > 0 ? reports[0].date : null;

  const whatsappEmergencyUrl = `https://wa.me/5547988485668?text=${encodeURIComponent(
    `🚨 SOLICITAÇÃO DE SUPORTE CNC\n\nMáquina: ${machineName}\nCliente: ${clientName || "Indústria"}\n\nPreciso de suporte técnico emergencial para este equipamento.`
  )}`;

  return (
    <div className="min-h-screen bg-[#090D14] text-slate-100 font-sans pb-16">
      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-slate-950/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoTmaint} alt="T-MAINT" className="h-8 w-8 object-contain" />
            <div>
              <span className="text-sm font-extrabold text-white">T-MAINT INDUSTRIAL</span>
              <span className="text-[10px] font-mono text-cyan-400 block">Linha do Tempo do Equipamento</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 text-[10px] font-mono font-bold uppercase">
            Machine Tag Ativa
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        {/* Machine Identity Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                <Cog className="h-4 w-4" /> Equipamento Cadastrado
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {machineName || "Equipamento Industrial"}
              </h1>
              {clientName && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Building2 className="h-3.5 w-3.5 text-slate-500" />
                  <span>{clientName}</span>
                </div>
              )}
            </div>

            {/* Quick Emergency CTA */}
            <a
              href={whatsappEmergencyUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0"
            >
              <ShimmerButton
                variant="teal"
                shimmerDuration="2s"
                glow={true}
                className="w-full sm:w-auto text-xs uppercase tracking-wider py-3 px-5 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                <Phone className="h-4 w-4 mr-1.5" /> Chamar Suporte Técnico
              </ShimmerButton>
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Total Intervenções</span>
              <strong className="text-lg font-bold text-white">{reports.length}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Preventivas</span>
              <strong className="text-lg font-bold text-emerald-400">{preventivas}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Corretivas</span>
              <strong className="text-lg font-bold text-amber-400">{corretivas}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Horas de Parada</span>
              <strong className="text-lg font-bold text-cyan-400">{totalDowntime}h</strong>
            </div>
          </div>
        </div>

        {/* Timeline of Interventions */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              Histórico Cronológico de Atendimentos
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {reports.length} laudo(s) registrado(s)
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 font-mono text-xs">
              Carregando histórico do equipamento...
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center font-mono text-xs text-slate-400">
              <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-2" />
              Nenhum laudo registrado para esta máquina até o momento.
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => {
                const isPreventiva = report.type === "preventiva";
                return (
                  <div
                    key={report.id}
                    className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={
                            "px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase " +
                            (isPreventiva
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/30")
                          }
                        >
                          {report.type}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          O.S. #{report.orderNumber || report.id.slice(0, 8)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>{report.date}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {report.summary || "Atendimento Técnico Realizado"}
                    </h3>
                    <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                      {report.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                      <div>
                        Técnico: <strong className="text-white">{report.technician || "João B. Tomaselli"}</strong>
                      </div>
                      {report.clientSignature && (
                        <div className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Laudo Assinado pelo Cliente
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
