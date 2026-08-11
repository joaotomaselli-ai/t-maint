import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useClientRequirements, getSubmissionStatus, type ClientRequirement } from "@/hooks/use-client-requirements";
import { useTechnicians } from "@/hooks/use-data";
import { useTechnicianDocs, getDocStatus } from "@/hooks/use-technician-docs";
import { FileText, Shield, AlertTriangle, CheckCircle2, XCircle, Users, Mail, Calendar, Plus, Trash2, Building2, Check, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Client } from "@/lib/api";

const STANDARD_DOC_OPTIONS = [
  { id: "aso", label: "🩺 ASO (Atestado de Saúde Ocupacional)" },
  { id: "NR-10", label: "⚡ NR-10 (Segurança em Instalações Elétricas)" },
  { id: "NR-35", label: "🧗 NR-35 (Trabalho em Altura)" },
  { id: "NR-33", label: "🕳️ NR-33 (Espaço Confinado)" },
  { id: "NR-12", label: "⚙️ NR-12 (Segurança em Máquinas)" },
  { id: "NR-18", label: "🏗️ NR-18 (Construção e Montagem)" },
  { id: "epi", label: "🛡️ Ficha de EPI Assinada" },
  { id: "os_sst", label: "📜 OS de Segurança (OS-01 / SST)" },
];

export function ClientComplianceModal({
  client,
  open,
  onOpenChange,
}: {
  client: Client;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { clientReq, saveRequirement, isLoading } = useClientRequirements(client.id);
  const { technicians } = useTechnicians();
  const { allDocs, allEPIs } = useTechnicianDocs();

  const [activeTab, setActiveTab] = useState<"rules" | "aptitude">("rules");
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [customDocInput, setCustomDocInput] = useState("");
  const [customDocs, setCustomDocs] = useState<string[]>([]);
  const [nextSubmissionDate, setNextSubmissionDate] = useState("");
  const [renewalFrequencyDays, setRenewalFrequencyDays] = useState("365");
  const [ssmaEmail, setSsmaEmail] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (clientReq) {
      setSelectedDocs(clientReq.requiredDocs || []);
      setCustomDocs(clientReq.customDocs || []);
      setNextSubmissionDate(clientReq.nextSubmissionDate || "");
      setRenewalFrequencyDays(String(clientReq.renewalFrequencyDays || 365));
      setSsmaEmail(clientReq.ssmaEmail || "");
      setNotes(clientReq.notes || "");
    } else {
      setSelectedDocs(["aso", "epi"]);
      setCustomDocs([]);
      setNextSubmissionDate("");
      setRenewalFrequencyDays("365");
      setSsmaEmail("");
      setNotes("");
    }
  }, [clientReq, open]);

  const toggleDoc = (id: string) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const addCustomDoc = () => {
    if (!customDocInput.trim()) return;
    if (customDocs.includes(customDocInput.trim())) return;
    setCustomDocs([...customDocs, customDocInput.trim()]);
    setCustomDocInput("");
  };

  const removeCustomDoc = (doc: string) => {
    setCustomDocs(customDocs.filter(d => d !== doc));
  };

  const handleSave = async () => {
    try {
      await saveRequirement.mutateAsync({
        id: clientReq?.id,
        clientId: client.id,
        requiredDocs: selectedDocs,
        customDocs,
        nextSubmissionDate: nextSubmissionDate || undefined,
        renewalFrequencyDays: Number(renewalFrequencyDays) || 365,
        ssmaEmail: ssmaEmail.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } catch (e) {}
  };

  const submissionVal = getSubmissionStatus(clientReq?.nextSubmissionDate);

  // Aptitude evaluation per technician
  const techAptitudeList = technicians.map(tech => {
    const techDocList = allDocs.filter(d => d.technicianId === tech.id);
    const techEpiList = allEPIs.filter(e => e.technicianId === tech.id);

    const requiredDocsList = clientReq?.requiredDocs || [];
    const missingItems: string[] = [];

    // Check ASO
    if (requiredDocsList.includes("aso")) {
      const aso = techDocList.find(d => d.docType === "aso");
      if (!aso) {
        missingItems.push("ASO ausente");
      } else if (getDocStatus(aso.expiryDate).status === "vencido") {
        missingItems.push("ASO Vencido");
      }
    }

    // Check NRs
    const nrRequired = requiredDocsList.filter(d => d.startsWith("NR-"));
    for (const nr of nrRequired) {
      const foundNr = techDocList.find(d => d.docType === "nr" && d.nrCategory === nr);
      if (!foundNr) {
        missingItems.push(`Pendente ${nr}`);
      } else if (getDocStatus(foundNr.expiryDate).status === "vencido") {
        missingItems.push(`${nr} Vencida`);
      }
    }

    // Check EPI
    if (requiredDocsList.includes("epi")) {
      if (techEpiList.length === 0) {
        missingItems.push("Ficha EPI ausente");
      }
    }

    const isApto = missingItems.length === 0;

    return {
      tech,
      isApto,
      missingItems,
      docCount: techDocList.length,
      epiCount: techEpiList.length,
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Exigências & Integração de Equipe — {client.name}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Controle de documentação exigida por este cliente e acompanhamento de prazo para reenvio dos lotes.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Resubmission Alert Banner */}
        {submissionVal.status === "vencido" ? (
          <div className="p-3.5 rounded-lg bg-red-500/15 border border-red-300 dark:border-red-900 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2.5">
            <XCircle className="h-5 w-5 shrink-0 text-red-600" />
            <div>
              <b className="text-sm block">🔴 PRAZO DE REENVIO VENCIDO:</b>
              A documentação da equipe para o cliente <b>{client.name}</b> precisava ter sido reenviada em <b>{format(new Date(clientReq!.nextSubmissionDate! + "T00:00:00"), "dd/MM/yyyy")}</b> (vencido há {Math.abs(submissionVal.daysLeft!)} dias). Providencie o reenvio urgente dos lotes para liberar o acesso da portaria!
            </div>
          </div>
        ) : submissionVal.status === "vencendo" ? (
          <div className="p-3.5 rounded-lg bg-amber-500/15 border border-amber-300 dark:border-amber-900 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <b className="text-sm block">⚠️ ALERTA DE REENVIO PRÓXIMO:</b>
              A renovação do lote de documentos da equipe vence em <b>{submissionVal.daysLeft} dia(s)</b> ({format(new Date(clientReq!.nextSubmissionDate! + "T00:00:00"), "dd/MM/yyyy")}). Prepare o envio de ASOs/NRs para o cliente.
            </div>
          </div>
        ) : submissionVal.status === "em_dia" ? (
          <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-300 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Documentação para este cliente em dia. Próximo lote de reenvio agendado para <b>{format(new Date(clientReq!.nextSubmissionDate! + "T00:00:00"), "dd/MM/yyyy")}</b> (em {submissionVal.daysLeft} dias).</span>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-muted border text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span>Configure a data da próxima entrega/reenvio da documentação da equipe para receber alertas de prazo.</span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full mt-2">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="rules" className="gap-2 text-xs font-semibold">
              <FileText className="h-4 w-4" /> Exigências & Prazos
            </TabsTrigger>
            <TabsTrigger value="aptitude" className="gap-2 text-xs font-semibold">
              <Users className="h-4 w-4" /> Aptidão da Equipe de Técnicos
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: EXIGÊNCIAS & PRAZOS */}
          <TabsContent value="rules" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-4 space-y-4 text-xs">
                <div>
                  <h3 className="font-bold text-sm text-foreground mb-1">1. Documentos Obrigatórios Solicitados por este Cliente</h3>
                  <p className="text-muted-foreground text-xs mb-3">Marque quais ASOs e NRs este cliente exige para liberar a entrada dos técnicos em suas instalações.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-muted/40 p-3 rounded-md border">
                    {STANDARD_DOC_OPTIONS.map(opt => (
                      <div key={opt.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`doc-${opt.id}`}
                          checked={selectedDocs.includes(opt.id)}
                          onCheckedChange={() => toggleDoc(opt.id)}
                        />
                        <Label htmlFor={`doc-${opt.id}`} className="text-xs font-medium cursor-pointer">
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Documents */}
                <div className="pt-2 border-t">
                  <Label className="text-xs font-bold block mb-1">Documentos Customizados / Específicos do Cliente</Label>
                  <div className="flex gap-2">
                    <Input
                      value={customDocInput}
                      onChange={e => setCustomDocInput(e.target.value)}
                      placeholder="Ex: Certificado de Brigada, Ficha Registro, PGR"
                      className="h-8 text-xs bg-background"
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomDoc(); } }}
                    />
                    <Button type="button" size="sm" onClick={addCustomDoc} className="h-8 text-xs gap-1">
                      <Plus className="h-3.5 w-3.5" /> Adicionar
                    </Button>
                  </div>
                  {customDocs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {customDocs.map(cDoc => (
                        <Badge key={cDoc} variant="secondary" className="text-xs gap-1 py-0.5">
                          {cDoc}
                          <button onClick={() => removeCustomDoc(cDoc)} className="hover:text-destructive ml-1">×</button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resubmission & Deadlines */}
                <div className="pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-bold">Data do Próximo Reenvio de Documentação *</Label>
                    <Input
                      type="date"
                      value={nextSubmissionDate}
                      onChange={e => setNextSubmissionDate(e.target.value)}
                      className="h-8 text-xs bg-background mt-1"
                    />
                    <p className="text-[11px] text-muted-foreground mt-0.5">Data limite em que o cliente exige a entrega atualizada dos ASOs/NRs.</p>
                  </div>

                  <div>
                    <Label className="text-xs font-bold">E-mail do Setor SSMA / Integração do Cliente</Label>
                    <Input
                      type="email"
                      value={ssmaEmail}
                      onChange={e => setSsmaEmail(e.target.value)}
                      placeholder="seguranca@cliente.com"
                      className="h-8 text-xs bg-background mt-1"
                    />
                    <p className="text-[11px] text-muted-foreground mt-0.5">Contato do responsável pela liberação da portaria.</p>
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs font-bold">Observações de Envio e Regras de Acesso</Label>
                    <Textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Ex: Enviar pacote em PDF único com 5 dias de antecedência para a portaria industrial..."
                      className="text-xs bg-background h-16 min-h-[60px] mt-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t">
                  <Button size="sm" onClick={handleSave} disabled={saveRequirement.isPending} className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                    {saveRequirement.isPending ? "Salvando..." : "Salvar Exigências do Cliente"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: APTIDÃO DA EQUIPE */}
          <TabsContent value="aptitude" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold tracking-tight">Validação de Aptidão dos Técnicos para este Cliente</h3>
                <p className="text-xs text-muted-foreground">O sistema cruza as exigências deste cliente com o cadastro de ASO/NRs de cada técnico.</p>
              </div>
            </div>

            {techAptitudeList.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="font-semibold text-foreground">Nenhum técnico cadastrado</p>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {techAptitudeList.map(({ tech, isApto, missingItems }) => (
                  <div
                    key={tech.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border ${
                      isApto ? "bg-emerald-500/5 border-emerald-300 dark:border-emerald-900" : "bg-red-500/5 border-red-300 dark:border-red-900"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{tech.name}</span>
                        {isApto ? (
                          <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300 dark:text-emerald-400 font-bold gap-1">
                            <Check className="h-3 w-3" /> Apto para este Cliente
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/15 text-red-700 border-red-300 dark:text-red-400 font-bold gap-1">
                            <XCircle className="h-3 w-3" /> Inapto para este Cliente
                          </Badge>
                        )}
                      </div>

                      {!isApto && (
                        <div className="flex flex-wrap items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
                          <span>Pendências:</span>
                          {missingItems.map(item => (
                            <span key={item} className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 border border-red-200 dark:border-red-900 text-[11px]">
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground shrink-0 self-end sm:self-center">
                      {isApto ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Pronto para alocação em OS</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 font-medium">Cadastre os documentos no perfil do técnico</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
