import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTechnicianDocs, getDocStatus, type TechDocument, type TechDocType, type TechEPIItem, type EPICategory, type EPIStatus } from "@/hooks/use-technician-docs";
import { FileText, ShieldAlert, Plus, Pencil, Trash2, ExternalLink, Calendar, Upload, Award, CheckCircle2, AlertTriangle, XCircle, HardHat, Shield } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Technician } from "@/lib/api";

export function TechnicianComplianceModal({
  technician,
  open,
  onOpenChange,
}: {
  technician: Technician;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { techDocs, techEPIs, addDocument, updateDocument, deleteDocument, addEPI, updateEPI, deleteEPI } = useTechnicianDocs(technician.id);
  const [activeTab, setActiveTab] = useState<"docs" | "epis">("docs");

  // Document Form State
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState<TechDocType>("nr");
  const [nrCategory, setNrCategory] = useState("NR-35");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [caNumber, setCaNumber] = useState("");
  const [docNotes, setDocNotes] = useState("");
  const [fileDataUrl, setFileDataUrl] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | undefined>(undefined);

  // EPI Form State
  const [isAddingEPI, setIsAddingEPI] = useState(false);
  const [editingEpiId, setEditingEpiId] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState<EPICategory>("epi");
  const [epiCaNumber, setEpiCaNumber] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split("T")[0]);
  const [replacementDate, setReplacementDate] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [size, setSize] = useState("");
  const [status, setStatus] = useState<EPIStatus>("entregue");
  const [epiNotes, setEpiNotes] = useState("");
  const [receiptFileUrl, setReceiptFileUrl] = useState<string | undefined>(undefined);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void, setName?: (name: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 8MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setUrl(evt.target.result as string);
        if (setName) setName(file.name);
        toast.success(`Arquivo "${file.name}" carregado.`);
      }
    };
    reader.readAsDataURL(file);
  };

  const startEditDoc = (doc: TechDocument) => {
    setEditingDocId(doc.id);
    setDocName(doc.docName);
    setDocType(doc.docType);
    setNrCategory(doc.nrCategory || "NR-35");
    setIssueDate(doc.issueDate || "");
    setExpiryDate(doc.expiryDate || "");
    setCaNumber(doc.caNumber || "");
    setDocNotes(doc.notes || "");
    setFileDataUrl(doc.fileUrl);
    setFileName(doc.fileName);
    setIsAddingDoc(true);
  };

  const handleSaveDoc = async () => {
    if (!docName.trim()) {
      toast.error("Informe o nome do documento");
      return;
    }
    try {
      if (editingDocId) {
        await updateDocument.mutateAsync({
          id: editingDocId,
          technicianId: technician.id,
          docName: docName.trim(),
          docType,
          nrCategory: docType === "nr" ? nrCategory : undefined,
          issueDate: issueDate || undefined,
          expiryDate: expiryDate || undefined,
          caNumber: caNumber.trim() || undefined,
          notes: docNotes.trim() || undefined,
          fileUrl: fileDataUrl,
          fileName: fileName,
        });
      } else {
        await addDocument.mutateAsync({
          technicianId: technician.id,
          docName: docName.trim(),
          docType,
          nrCategory: docType === "nr" ? nrCategory : undefined,
          issueDate: issueDate || undefined,
          expiryDate: expiryDate || undefined,
          caNumber: caNumber.trim() || undefined,
          notes: docNotes.trim() || undefined,
          fileUrl: fileDataUrl,
          fileName: fileName,
        });
      }
      setIsAddingDoc(false);
      resetDocForm();
    } catch (e) {}
  };

  const resetDocForm = () => {
    setEditingDocId(null);
    setDocName("");
    setDocType("nr");
    setNrCategory("NR-35");
    setIssueDate("");
    setExpiryDate("");
    setCaNumber("");
    setDocNotes("");
    setFileDataUrl(undefined);
    setFileName(undefined);
  };

  const startEditEPI = (item: TechEPIItem) => {
    setEditingEpiId(item.id);
    setItemName(item.itemName);
    setCategory(item.category);
    setEpiCaNumber(item.caNumber || "");
    setDeliveryDate(item.deliveryDate);
    setReplacementDate(item.replacementDate || "");
    setQuantity(String(item.quantity ?? 1));
    setSize(item.size || "");
    setStatus(item.status);
    setEpiNotes(item.notes || "");
    setReceiptFileUrl(item.receiptFileUrl);
    setIsAddingEPI(true);
  };

  const handleSaveEPI = async () => {
    if (!itemName.trim()) {
      toast.error("Informe o nome do item / EPI / uniforme");
      return;
    }
    try {
      if (editingEpiId) {
        await updateEPI.mutateAsync({
          id: editingEpiId,
          technicianId: technician.id,
          itemName: itemName.trim(),
          category,
          caNumber: epiCaNumber.trim() || undefined,
          deliveryDate: deliveryDate || new Date().toISOString().split("T")[0],
          replacementDate: replacementDate || undefined,
          quantity: Number(quantity) || 1,
          size: size.trim() || undefined,
          status,
          notes: epiNotes.trim() || undefined,
          receiptFileUrl,
        });
      } else {
        await addEPI.mutateAsync({
          technicianId: technician.id,
          itemName: itemName.trim(),
          category,
          caNumber: epiCaNumber.trim() || undefined,
          deliveryDate: deliveryDate || new Date().toISOString().split("T")[0],
          replacementDate: replacementDate || undefined,
          quantity: Number(quantity) || 1,
          size: size.trim() || undefined,
          status,
          notes: epiNotes.trim() || undefined,
          receiptFileUrl,
        });
      }
      setIsAddingEPI(false);
      resetEPIForm();
    } catch (e) {}
  };

  const resetEPIForm = () => {
    setEditingEpiId(null);
    setItemName("");
    setCategory("epi");
    setEpiCaNumber("");
    setDeliveryDate(new Date().toISOString().split("T")[0]);
    setReplacementDate("");
    setQuantity("1");
    setSize("");
    setStatus("entregue");
    setEpiNotes("");
    setReceiptFileUrl(undefined);
  };

  // Status summaries & Irregularity checking
  const expiredDocs = techDocs.filter(d => getDocStatus(d.expiryDate).status === "vencido");
  const expiringDocs = techDocs.filter(d => getDocStatus(d.expiryDate).status === "vencendo");
  const hasNoDocs = techDocs.length === 0;
  const hasNoEPIs = techEPIs.length === 0;
  const isIrregular = hasNoDocs || hasNoEPIs || expiredDocs.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <HardHat className="h-5 w-5 text-amber-500" />
                Conformidade Industrial — {technician.name}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Gestão de ASO, NRs, Matriz de Competências e Ficha de Entrega de EPIs / Uniformes.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Status Alert Banner */}
        {hasNoDocs && hasNoEPIs ? (
          <div className="p-3.5 rounded-lg bg-red-500/15 border border-red-300 dark:border-red-900 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2.5">
            <XCircle className="h-5 w-5 shrink-0 text-red-600" />
            <div>
              <b className="text-sm block">⚠️ Cadastro Irregular — Pendência Total:</b>
              Este técnico não possui <b>nenhum documento/NR</b> e <b>nenhum registro de EPI/Uniforme</b>. Cadastre os documentos para liberar atendimentos industriais.
            </div>
          </div>
        ) : hasNoDocs ? (
          <div className="p-3.5 rounded-lg bg-red-500/15 border border-red-300 dark:border-red-900 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2.5">
            <XCircle className="h-5 w-5 shrink-0 text-red-600" />
            <div>
              <b className="text-sm block">⚠️ Cadastro Irregular — Sem Documentos:</b>
              Este técnico não possui <b>nenhum ASO ou Norma Regulamentadora (NR)</b> cadastrada.
            </div>
          </div>
        ) : hasNoEPIs ? (
          <div className="p-3.5 rounded-lg bg-red-500/15 border border-red-300 dark:border-red-900 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2.5">
            <XCircle className="h-5 w-5 shrink-0 text-red-600" />
            <div>
              <b className="text-sm block">⚠️ Cadastro Irregular — Sem Ficha de EPIs:</b>
              Nenhum registro de entrega de <b>Equipamentos de Proteção Individual (EPI) ou Uniforme</b> cadastrado para este técnico.
            </div>
          </div>
        ) : expiredDocs.length > 0 ? (
          <div className="p-3.5 rounded-lg bg-red-500/15 border border-red-300 dark:border-red-900 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2.5">
            <XCircle className="h-5 w-5 shrink-0 text-red-600" />
            <div>
              <b className="text-sm block">🔴 Cadastro Irregular — Documento Vencido:</b>
              Este técnico possui <b>{expiredDocs.length} documento(s) com validade VENCIDA</b>! Providencie a reciclagem/renovação imediatamente.
            </div>
          </div>
        ) : expiringDocs.length > 0 ? (
          <div className="p-3.5 rounded-lg bg-amber-500/15 border border-amber-300 dark:border-amber-900 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <b className="text-sm block">⚠️ Atenção: Documento(s) a Vencer:</b>
              Possui {expiringDocs.length} documento(s) vencendo nos próximos 30 dias. Providencie o agendamento de reciclagem.
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-300 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Técnico em conformidade industrial. Documentos, NRs e Ficha de EPIs devidamente cadastrados!</span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full mt-2">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="docs" className="gap-2 text-xs font-semibold">
              <FileText className="h-4 w-4" /> Documentos & NRs ({techDocs.length})
            </TabsTrigger>
            <TabsTrigger value="epis" className="gap-2 text-xs font-semibold">
              <Shield className="h-4 w-4" /> Ficha de EPIs & Uniformes ({techEPIs.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: DOCUMENTOS & NRS */}
          <TabsContent value="docs" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-tight">ASO, Normas Regulamentadoras & Matriz</h3>
              {!isAddingDoc && (
                <Button size="sm" onClick={() => { resetDocForm(); setIsAddingDoc(true); }} className="gap-1.5 text-xs">
                  <Plus className="h-4 w-4" /> Adicionar Documento / NR
                </Button>
              )}
            </div>

            {/* Add/Edit Document Form */}
            {isAddingDoc && (
              <Card className="border-amber-300 dark:border-amber-800 bg-amber-500/5">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-600" />
                      {editingDocId ? "Editar Documento ou Certificado" : "Novo Documento ou Certificado"}
                    </h4>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setIsAddingDoc(false); resetDocForm(); }}>
                      Cancelar
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <Label className="text-xs font-medium">Tipo de Documento *</Label>
                      <Select value={docType} onValueChange={(v) => { setDocType(v as TechDocType); if (v === "aso") setDocName("ASO — Atestado Saúde Ocupacional"); }}>
                        <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aso">🩺 ASO (Atestado Saúde Ocupacional)</SelectItem>
                          <SelectItem value="nr">⚡ NR (Norma Regulamentadora)</SelectItem>
                          <SelectItem value="matriz">🎓 Matriz de Competência / Qualificação</SelectItem>
                          <SelectItem value="contrato">📜 Contrato de Prestação</SelectItem>
                          <SelectItem value="outro">📁 Outro Documento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {docType === "nr" && (
                      <div>
                        <Label className="text-xs font-medium">Norma Regulamentadora (NR) *</Label>
                        <Select value={nrCategory} onValueChange={(v) => { setNrCategory(v); setDocName(`Treinamento Certificado ${v}`); }}>
                          <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NR-10">NR-10 (Segurança em Instalações Elétricas)</SelectItem>
                            <SelectItem value="NR-35">NR-35 (Trabalho em Altura)</SelectItem>
                            <SelectItem value="NR-33">NR-33 (Espaço Confinado)</SelectItem>
                            <SelectItem value="NR-12">NR-12 (Segurança em Máquinas)</SelectItem>
                            <SelectItem value="NR-18">NR-18 (Construção e Montagem)</SelectItem>
                            <SelectItem value="NR-06">NR-06 (Equipamentos de Proteção)</SelectItem>
                            <SelectItem value="Outra NR">Outra Norma Regulamentadora</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className={docType === "nr" ? "" : "sm:col-span-2"}>
                      <Label className="text-xs font-medium">Nome / Título do Documento *</Label>
                      <Input
                        value={docName}
                        onChange={e => setDocName(e.target.value)}
                        placeholder="Ex: Treinamento NR-35 Trabalho em Altura (40h)"
                        className="h-8 text-xs bg-background"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-medium">Data de Emissão / Treinamento</Label>
                      <Input
                        type="date"
                        value={issueDate}
                        onChange={e => setIssueDate(e.target.value)}
                        className="h-8 text-xs bg-background"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-medium">Data de Validade / Reciclagem</Label>
                      <Input
                        type="date"
                        value={expiryDate}
                        onChange={e => setExpiryDate(e.target.value)}
                        className="h-8 text-xs bg-background"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-medium">Nº de Registro / C.A. / Órgão (Opcional)</Label>
                      <Input
                        value={caNumber}
                        onChange={e => setCaNumber(e.target.value)}
                        placeholder="Ex: Registro CREA / CNH / Certificado #1234"
                        className="h-8 text-xs bg-background"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-medium">Anexar Documento PDF / Foto</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept=".pdf,image/*,.doc,.docx"
                          onChange={e => handleFileUpload(e, setFileDataUrl, setFileName)}
                          className="h-8 text-xs bg-background file:mr-2 file:py-0 file:px-2 file:rounded file:border-0 file:text-xs file:bg-muted"
                        />
                      </div>
                      {fileName && <p className="text-[11px] text-emerald-600 font-medium mt-1">📎 {fileName}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <Label className="text-xs font-medium">Observações / Detalhes</Label>
                      <Textarea
                        value={docNotes}
                        onChange={e => setDocNotes(e.target.value)}
                        placeholder="Informações adicionais, carga horária, instituição de ensino..."
                        className="text-xs bg-background h-16 min-h-[60px]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" onClick={() => { setIsAddingDoc(false); resetDocForm(); }} className="h-8 text-xs">
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSaveDoc} disabled={addDocument.isPending || updateDocument.isPending} className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white">
                      {addDocument.isPending || updateDocument.isPending ? "Salvando..." : (editingDocId ? "Atualizar Documento" : "Salvar Documento")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* List of Documents */}
            {techDocs.length === 0 ? (
              <Card className="p-8 text-center border-red-300 dark:border-red-900 bg-red-500/5">
                <AlertTriangle className="h-10 w-10 mx-auto mb-2 text-red-500" />
                <p className="font-bold text-red-700 dark:text-red-400">Nenhum documento ou NR cadastrado!</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  Este técnico está classificado como <b>IRREGULAR</b>. Cadastre o ASO e os certificados de Normas Regulamentadoras (NRs) necessários para liberar alocação em campo.
                </p>
                <Button size="sm" onClick={() => { resetDocForm(); setIsAddingDoc(true); }} className="mt-4 gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white">
                  <Plus className="h-4 w-4" /> Cadastrar Primeiro Documento / NR
                </Button>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {techDocs.map(doc => {
                  const val = getDocStatus(doc.expiryDate);
                  const statusBadge = {
                    valido: <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300 dark:text-emerald-400 font-semibold">🟢 Válido ({val.daysLeft} dias)</Badge>,
                    vencendo: <Badge className="bg-amber-500/15 text-amber-700 border-amber-300 dark:text-amber-400 font-semibold">⚠️ Vencendo em {val.daysLeft} dias</Badge>,
                    vencido: <Badge className="bg-red-500/15 text-red-700 border-red-300 dark:text-red-400 font-bold">🔴 Vencido há {Math.abs(val.daysLeft || 0)} dias</Badge>,
                    sem_validade: <Badge variant="outline" className="text-muted-foreground">Sem validade</Badge>,
                  }[val.status];

                  return (
                    <div
                      key={doc.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-foreground text-sm">{doc.docName}</span>
                          {doc.nrCategory && <Badge variant="secondary" className="text-[10px]">{doc.nrCategory}</Badge>}
                          {statusBadge}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {doc.issueDate && <span>Emissão: {format(new Date(doc.issueDate + "T00:00:00"), "dd/MM/yyyy")}</span>}
                          {doc.expiryDate && <span className="font-semibold text-foreground">Validade: {format(new Date(doc.expiryDate + "T00:00:00"), "dd/MM/yyyy")}</span>}
                          {doc.caNumber && <span>Reg/CA: <b>{doc.caNumber}</b></span>}
                        </div>

                        {doc.notes && <p className="text-xs text-muted-foreground/90 italic pt-0.5">{doc.notes}</p>}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {doc.fileUrl && (
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download={doc.fileName || "documento.pdf"}>
                            <Button variant="outline" size="sm" className="h-8 text-xs gap-1 text-primary">
                              <ExternalLink className="h-3.5 w-3.5" /> Baixar Anexo
                            </Button>
                          </a>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => startEditDoc(doc)}
                          title="Editar informações do documento"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteDocument.mutate(doc.id)}
                          title="Remover documento"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: EPIs & UNIFORMES */}
          <TabsContent value="epis" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-tight">Ficha de Entrega de Equipamentos & Uniformes</h3>
              {!isAddingEPI && (
                <Button size="sm" onClick={() => { resetEPIForm(); setIsAddingEPI(true); }} className="gap-1.5 text-xs">
                  <Plus className="h-4 w-4" /> Registrar Entrega de EPI / Uniforme
                </Button>
              )}
            </div>

            {/* Add/Edit EPI Form */}
            {isAddingEPI && (
              <Card className="border-blue-300 dark:border-blue-800 bg-blue-500/5">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      {editingEpiId ? "Editar Registro de Entrega de EPI" : "Registro de Entrega de EPI / Uniforme"}
                    </h4>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setIsAddingEPI(false); resetEPIForm(); }}>
                      Cancelar
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <Label className="text-xs font-medium">Categoria *</Label>
                      <Select value={category} onValueChange={(v) => setCategory(v as EPICategory)}>
                        <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="epi">🛈 EPI (Equipamento de Proteção Individual)</SelectItem>
                          <SelectItem value="uniforme">👕 Uniforme (Camisa, Calça, Jaqueta)</SelectItem>
                          <SelectItem value="ferramental">🧰 Ferramental / Kit de Campo</SelectItem>
                          <SelectItem value="outro">📦 Outro Equipamento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs font-medium">Nome do Item / Equipamento *</Label>
                      <Input
                        value={itemName}
                        onChange={e => setItemName(e.target.value)}
                        placeholder="Ex: Bota de Segurança bico de aço, Capacete, Óculos"
                        className="h-8 text-xs bg-background"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-medium">Número do C.A. (Certificado de Aprovação)</Label>
                      <Input
                        value={epiCaNumber}
                        onChange={e => setEpiCaNumber(e.target.value)}
                        placeholder="Ex: CA 12345 (Obrigatório em auditorias industriais)"
                        className="h-8 text-xs bg-background"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-medium">Data de Entrega *</Label>
                      <Input
                        type="date"
                        value={deliveryDate}
                        onChange={e => setDeliveryDate(e.target.value)}
                        className="h-8 text-xs bg-background"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-medium">Data da Próxima Troca / Validade</Label>
                      <Input
                        type="date"
                        value={replacementDate}
                        onChange={e => setReplacementDate(e.target.value)}
                        className="h-8 text-xs bg-background"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs font-medium">Quantidade</Label>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={e => setQuantity(e.target.value)}
                          className="h-8 text-xs bg-background"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Tamanho</Label>
                        <Input
                          value={size}
                          onChange={e => setSize(e.target.value)}
                          placeholder="Ex: M, G, 42, G3"
                          className="h-8 text-xs bg-background"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-medium">Status da Entrega</Label>
                      <Select value={status} onValueChange={(v) => setStatus(v as EPIStatus)}>
                        <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entregue">✅ Entregue e Ativo</SelectItem>
                          <SelectItem value="troca_pendente">⚠️ Troca / Renovação Pendente</SelectItem>
                          <SelectItem value="devolvido">↩️ Devolvido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs font-medium">Anexar Ficha de Entrega Assinada (PDF/Foto)</Label>
                      <Input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={e => handleFileUpload(e, setReceiptFileUrl)}
                        className="h-8 text-xs bg-background file:mr-2 file:py-0 file:px-2 file:rounded file:border-0 file:text-xs file:bg-muted"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label className="text-xs font-medium">Observações</Label>
                      <Textarea
                        value={epiNotes}
                        onChange={e => setEpiNotes(e.target.value)}
                        placeholder="Observações do estado de entrega ou devolução..."
                        className="text-xs bg-background h-16 min-h-[60px]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" onClick={() => { setIsAddingEPI(false); resetEPIForm(); }} className="h-8 text-xs">
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSaveEPI} disabled={addEPI.isPending || updateEPI.isPending} className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                      {addEPI.isPending || updateEPI.isPending ? "Salvando..." : (editingEpiId ? "Atualizar Registro de EPI" : "Salvar Registro de EPI")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* List of EPIs */}
            {techEPIs.length === 0 ? (
              <Card className="p-8 text-center border-red-300 dark:border-red-900 bg-red-500/5">
                <ShieldAlert className="h-10 w-10 mx-auto mb-2 text-red-500" />
                <p className="font-bold text-red-700 dark:text-red-400">Nenhum EPI ou Uniforme registrado!</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  A Ficha de Entrega de EPIs é obrigatória para comprovação de entrega de equipamentos. Registre a entrega para regularizar o cadastro.
                </p>
                <Button size="sm" onClick={() => { resetEPIForm(); setIsAddingEPI(true); }} className="mt-4 gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4" /> Registrar Primeira Entrega de EPI
                </Button>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {techEPIs.map(item => {
                  const statusLabel = {
                    entregue: <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300 dark:text-emerald-400">✅ Entregue e Ativo</Badge>,
                    troca_pendente: <Badge className="bg-amber-500/15 text-amber-700 border-amber-300 dark:text-amber-400">⚠️ Troca Pendente</Badge>,
                    devolvido: <Badge variant="outline" className="text-muted-foreground">↩️ Devolvido</Badge>,
                  }[item.status];

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-foreground text-sm">{item.itemName}</span>
                          <Badge variant="secondary" className="text-[10px] capitalize">{item.category}</Badge>
                          {statusLabel}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>Entregue em: <b>{format(new Date(item.deliveryDate + "T00:00:00"), "dd/MM/yyyy")}</b></span>
                          {item.caNumber && <span>C.A.: <b className="text-foreground">{item.caNumber}</b></span>}
                          {item.quantity && <span>Qtd: <b>{item.quantity}</b></span>}
                          {item.size && <span>Tam: <b>{item.size}</b></span>}
                          {item.replacementDate && (
                            <span className="text-amber-700 dark:text-amber-400 font-semibold">
                              Troca prevista: {format(new Date(item.replacementDate + "T00:00:00"), "dd/MM/yyyy")}
                            </span>
                          )}
                        </div>

                        {item.notes && <p className="text-xs text-muted-foreground/90 italic pt-0.5">{item.notes}</p>}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {item.receiptFileUrl && (
                          <a href={item.receiptFileUrl} target="_blank" rel="noopener noreferrer" download="ficha_epi.pdf">
                            <Button variant="outline" size="sm" className="h-8 text-xs gap-1 text-primary">
                              <ExternalLink className="h-3.5 w-3.5" /> Ficha Assinada
                            </Button>
                          </a>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => startEditEPI(item)}
                          title="Editar informações do EPI"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteEPI.mutate(item.id)}
                          title="Remover registro de EPI"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
