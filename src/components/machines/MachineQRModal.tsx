import { useAccess } from "@/hooks/use-access";
import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, QrCode, ExternalLink, ShieldCheck, Cog } from "lucide-react";

interface MachineQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineName: string;
  clientName?: string;
  tagNumber?: string;
}

export function MachineQRModal({
  isOpen,
  onClose,
  machineName,
  clientName = "Cliente",
  tagNumber,
}: MachineQRModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { planType, isMaster } = useAccess();
  const isBasic = !isMaster && planType === "basic";

  // Encode machine parameter cleanly
  const encodedId = encodeURIComponent(machineName.trim());
  const origin = typeof window !== "undefined" ? window.location.origin : "https://t-maint.com.br";
  const machineUrl = `${origin}/m/${encodedId}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-slate-950 border border-slate-800 text-white p-6 shadow-2xl">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
            <QrCode className="h-5 w-5 text-cyan-400" />
            Etiqueta Machine QR Tag
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Adesivo para identificação no painel elétrico da máquina.
          </DialogDescription>
        </DialogHeader>

        {isBasic && (
          <div className="p-3 mb-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-mono">Recurso Pro Industrial & Elite Enterprise</strong>
              As etiquetas Machine QR Tag e o Portal B2B de consulta rápida fazem parte dos planos Pro e Enterprise.
            </div>
          </div>
        )}

        {/* Printable Physical Tag Preview */}
        <div className="my-4">
          <div
            ref={printRef}
            className="p-6 rounded-2xl bg-white text-slate-950 border-2 border-slate-300 shadow-inner flex flex-col items-center text-center font-mono"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-700 mb-1">
              <Cog className="h-4 w-4 text-cyan-600" /> T-MAINT INDUSTRIAL OS
            </div>
            <div className="text-sm font-extrabold uppercase text-slate-950 leading-tight">
              {machineName}
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              {clientName} {tagNumber ? `• TAG: ${tagNumber}` : ""}
            </div>

            {/* High-Contrast QR Code */}
            <div className="my-4 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
              <QRCodeSVG
                value={machineUrl}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="text-[10px] text-slate-600 uppercase tracking-tight max-w-[220px]">
              Aponte a câmera do celular para consultar histórico ou solicitar atendimento
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200 text-[9px] text-slate-400 flex items-center justify-between w-full">
              <span>t-maint.com.br</span>
              <span className="flex items-center gap-1 font-semibold text-cyan-700">
                <ShieldCheck className="h-3 w-3" /> VERIFICADO
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <a
            href={machineUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Testar Link
          </a>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-mono"
            >
              Fechar
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" /> Imprimir Etiqueta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
