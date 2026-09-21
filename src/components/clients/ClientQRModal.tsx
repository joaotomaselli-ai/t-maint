import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useReactToPrint } from "react-to-print";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, QrCode, ExternalLink, ShieldCheck, Building2 } from "lucide-react";
import { useCompanySettings, useSettings } from "@/hooks/use-data";
import { type Client } from "@/lib/api";

interface ClientQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export function ClientQRModal({ isOpen, onClose, client }: ClientQRModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();
  const { companySettings } = useCompanySettings();

  const companyName = companySettings?.companyName || settings?.companyName || "T-MAINT INDUSTRIAL";

  const origin = typeof window !== "undefined" ? window.location.origin : "https://t-maint.com.br";
  const encodedClient = client ? encodeURIComponent(client.name.trim()) : "";
  const clientLoginUrl = client ? `${origin}/login?client=${encodedClient}&clientId=${client.id}` : origin;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: client ? `QR-Tag-Cliente-${client.name.replace(/[^a-zA-Z0-9]/g, "_")}` : "QR-Tag-Cliente",
    pageStyle: `
      @page { size: auto; margin: 10mm; }
      @media print { 
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } 
      }
    `,
  });

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-slate-950 border border-slate-800 text-white p-6 shadow-2xl">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
            <QrCode className="h-5 w-5 text-cyan-400" />
            Etiqueta QR do Cliente
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Adesivo para identificação no parque fabril e acesso direto ao Portal do Cliente.
          </DialogDescription>
        </DialogHeader>

        {/* Printable Physical Tag Preview */}
        <div className="my-4">
          <div
            ref={printRef}
            className="p-6 rounded-2xl bg-white text-slate-950 border-2 border-slate-300 shadow-inner flex flex-col items-center text-center font-mono"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-700 mb-1">
              <Building2 className="h-4 w-4 text-cyan-600" /> {companyName.toUpperCase()}
            </div>
            
            <div className="text-base font-extrabold uppercase text-slate-950 leading-tight">
              {client.name}
            </div>
            
            {client.cnpj && (
              <div className="text-[11px] text-slate-600 mt-0.5">
                CNPJ: {client.cnpj}
              </div>
            )}

            {/* High-Contrast High-Res QR Code */}
            <div className="my-4 p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <QRCodeSVG
                value={clientLoginUrl}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-tight max-w-[240px]">
              Portal do Cliente • Histórico Técnico
            </div>
            
            <div className="text-[10px] text-slate-600 mt-1 max-w-[230px] leading-tight">
              Aponte a câmera do celular para consultar ordens de serviço, laudos e máquinas.
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200 text-[9px] text-slate-400 flex items-center justify-between w-full">
              <span>t-maint.com.br</span>
              <span className="flex items-center gap-1 font-semibold text-cyan-700">
                <ShieldCheck className="h-3.5 w-3.5" /> ACESSO SEGURO
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <a
            href={clientLoginUrl}
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
              onClick={() => handlePrint()}
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
