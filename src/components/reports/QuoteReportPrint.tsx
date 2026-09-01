import React, { forwardRef } from 'react';
import { format } from "date-fns";
import type { Settings } from "@/lib/api";
import type { CommercialQuote } from "@/lib/quotes.functions";
import { fmtCurrency } from "@/lib/api";

type QuoteReportPrintProps = {
  quote: CommercialQuote;
  settings: Settings;
};

export const QuoteReportPrint = forwardRef<HTMLDivElement, QuoteReportPrintProps>(({
  quote,
  settings,
}, ref) => {
  const serviceItems = (quote.items || []).filter(it => it.type === "service");
  const productItems = (quote.items || []).filter(it => it.type === "product");

  const formattedDate = quote.date ? format(new Date(quote.date + "T00:00:00"), "dd/MM/yyyy") : "—";
  const formattedValidUntil = quote.validUntil ? format(new Date(quote.validUntil + "T00:00:00"), "dd/MM/yyyy") : "—";

  return (
    <div
      ref={ref}
      className="bg-white text-slate-800 p-8 font-sans w-full max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between"
      style={{ fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif" }}
    >
      <div>
        {/* HEADER */}
        <header className="flex justify-between items-start border-b-[3px] border-[#003B73] pb-6 mb-6">
          <div className="flex items-center gap-5">
            {settings.logoUrl && (
              <img src={settings.logoUrl} alt="Logo" className="max-h-16 max-w-[160px] object-contain" />
            )}
            <div>
              <h1 className="text-2xl font-black text-[#002b5e] m-0 tracking-tight">
                {settings.companyName || "Proposta Comercial"}
              </h1>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {[
                  settings.cnpj && `CNPJ: ${settings.cnpj}`,
                  settings.phone && `Tel: ${settings.phone}`,
                  settings.email && `E-mail: ${settings.email}`,
                  settings.address
                ].filter(Boolean).join(" • ")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-[#003B73] text-white px-4 py-1.5 rounded font-bold text-base inline-block mb-1 tracking-wide">
              {quote.quoteNumber || "ORÇAMENTO"}
            </div>
            <p className="text-xs text-slate-500">Emissão: <b>{formattedDate}</b></p>
            <p className="text-xs text-amber-700 font-semibold mt-0.5">Válido até: <b>{formattedValidUntil}</b></p>
          </div>
        </header>

        {/* METADATA CARDS */}
        <section className="grid grid-cols-2 gap-4 mb-6">
          {/* CLIENT DATA */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold mb-1">Dados do Cliente</p>
            <p className="font-bold text-slate-800 text-sm">{quote.clientName || "Cliente"}</p>
            {quote.clientCnpj && <p className="text-xs text-slate-600 mt-0.5">CNPJ/CPF: {quote.clientCnpj}</p>}
            {quote.clientPhone && <p className="text-xs text-slate-600">Telefone: {quote.clientPhone}</p>}
            {quote.clientEmail && <p className="text-xs text-slate-600">Contato: {quote.clientEmail}</p>}
            {quote.clientAddress && <p className="text-xs text-slate-600">Endereço: {quote.clientAddress}</p>}
          </div>

          {/* SERVICE & MACHINE DATA */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold mb-1">Informações do Atendimento</p>
            <div className="space-y-1 text-xs">
              <p className="text-slate-700">
                <span className="font-semibold text-slate-900">Equipamento / Máquina:</span> {quote.machine || "A definir"}
              </p>
              <p className="text-slate-700">
                <span className="font-semibold text-slate-900">Técnico / Elaborador:</span> {quote.technicianName || settings.technicianName || "T-Maint"}
              </p>
              <p className="text-slate-700">
                <span className="font-semibold text-slate-900">Prazo de Execução:</span> {quote.executionDeadline || "A combinar"}
              </p>
              <p className="text-slate-700">
                <span className="font-semibold text-slate-900">Condições de Pagamento:</span> {quote.paymentTerms || "À vista / Pix"}
              </p>
            </div>
          </div>
        </section>

        {/* SERVICES TABLE */}
        {serviceItems.length > 0 && (
          <section className="mb-6">
            <div className="bg-[#003B73] text-white px-3 py-1.5 rounded-t font-semibold text-xs uppercase tracking-wider flex justify-between items-center">
              <span>1. Serviços & Mão de Obra Especializada</span>
              <span>Subtotal: {fmtCurrency(quote.servicesTotal)}</span>
            </div>
            <table className="w-full text-left text-xs border border-t-0 border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="p-2 w-10 text-center">Item</th>
                  <th className="p-2">Descrição do Serviço</th>
                  <th className="p-2 w-20 text-center">Qtd / Horas</th>
                  <th className="p-2 w-24 text-right">Valor Unit.</th>
                  <th className="p-2 w-24 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {serviceItems.map((it, idx) => (
                  <tr key={it.id || idx} className="hover:bg-slate-50">
                    <td className="p-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-2">
                      <div className="font-semibold text-slate-800">{it.name}</div>
                      {it.description && <div className="text-[11px] text-slate-500">{it.description}</div>}
                    </td>
                    <td className="p-2 text-center text-slate-700">{it.quantity} {it.unit || "h"}</td>
                    <td className="p-2 text-right text-slate-700">{fmtCurrency(it.unitPrice)}</td>
                    <td className="p-2 text-right font-bold text-slate-900">{fmtCurrency(it.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* PRODUCTS / PARTS TABLE */}
        {productItems.length > 0 && (
          <section className="mb-6">
            <div className="bg-[#003B73] text-white px-3 py-1.5 rounded-t font-semibold text-xs uppercase tracking-wider flex justify-between items-center">
              <span>2. Peças & Materiais Aplicados</span>
              <span>Subtotal: {fmtCurrency(quote.productsTotal)}</span>
            </div>
            <table className="w-full text-left text-xs border border-t-0 border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="p-2 w-10 text-center">Item</th>
                  <th className="p-2">Descrição da Peça / Componente</th>
                  <th className="p-2 w-20 text-center">Qtd</th>
                  <th className="p-2 w-24 text-right">Valor Unit.</th>
                  <th className="p-2 w-24 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productItems.map((it, idx) => (
                  <tr key={it.id || idx} className="hover:bg-slate-50">
                    <td className="p-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-2">
                      <div className="font-semibold text-slate-800">{it.name}</div>
                      {it.description && <div className="text-[11px] text-slate-500">{it.description}</div>}
                    </td>
                    <td className="p-2 text-center text-slate-700">{it.quantity} {it.unit || "Un"}</td>
                    <td className="p-2 text-right text-slate-700">{fmtCurrency(it.unitPrice)}</td>
                    <td className="p-2 text-right font-bold text-slate-900">{fmtCurrency(it.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* TRAVEL / KM (IF ANY) */}
        {quote.travelKm > 0 && (
          <section className="mb-6">
            <div className="bg-slate-700 text-white px-3 py-1.5 rounded-t font-semibold text-xs uppercase tracking-wider flex justify-between items-center">
              <span>3. Deslocamento Técnico</span>
              <span>{fmtCurrency(quote.travelTotal)}</span>
            </div>
            <div className="p-3 border border-t-0 border-slate-200 text-xs flex justify-between items-center text-slate-700">
              <span>Quilometragem prevista: <b>{quote.travelKm} km</b> x {fmtCurrency(quote.travelRate)}/km</span>
              <span className="font-bold text-slate-900">{fmtCurrency(quote.travelTotal)}</span>
            </div>
          </section>
        )}

        {/* FINANCIAL SUMMARY TOTALS */}
        <section className="flex justify-end mb-6">
          <div className="w-72 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Serviços:</span>
              <span className="font-semibold">{fmtCurrency(quote.servicesTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Peças:</span>
              <span className="font-semibold">{fmtCurrency(quote.productsTotal)}</span>
            </div>
            {quote.travelTotal > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Deslocamento:</span>
                <span className="font-semibold">{fmtCurrency(quote.travelTotal)}</span>
              </div>
            )}
            {quote.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Desconto Especial:</span>
                <span>- {fmtCurrency(quote.discountAmount)}</span>
              </div>
            )}
            <div className="border-t border-slate-300 pt-2 flex justify-between items-baseline">
              <span className="text-sm font-black text-[#003B73]">VALOR TOTAL:</span>
              <span className="text-lg font-black text-[#003B73]">{fmtCurrency(quote.totalAmount)}</span>
            </div>
          </div>
        </section>

        {/* COMMERCIAL TERMS & WARRANTY */}
        <section className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 mb-6 text-xs space-y-2">
          <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Condições Gerais & Termos de Garantia</p>
          <div className="grid sm:grid-cols-2 gap-3 text-slate-700">
            <div>
              <p>• <b>Forma de Pagamento:</b> {quote.paymentTerms || "À vista / Pix"}</p>
              <p>• <b>Prazo de Execução:</b> {quote.executionDeadline || "A combinar"}</p>
            </div>
            <div>
              <p>• <b>Garantia Técnica:</b> {quote.warrantyTerms || "90 dias para peças e serviços executados"}</p>
              <p>• <b>Validade da Proposta:</b> {formattedValidUntil}</p>
            </div>
          </div>
          {quote.notes && (
            <div className="border-t border-slate-200 pt-2 text-slate-600">
              <p className="font-semibold text-slate-800 mb-0.5">Observações Adicionais:</p>
              <p className="whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}
        </section>
      </div>

      {/* SIGNATURE SECTION */}
      <footer className="border-t border-slate-200 pt-6 mt-6">
        <p className="text-center text-xs text-slate-500 mb-8">
          Declaro estar de acordo com os valores, prazos e condições comerciais descritos nesta proposta.
        </p>
        <div className="grid grid-cols-2 gap-12 text-center text-xs">
          <div>
            <div className="border-b border-slate-400 w-3/4 mx-auto mb-1"></div>
            <p className="font-bold text-slate-800">{settings.companyName || "Prestador de Serviços"}</p>
            <p className="text-slate-500 text-[10px]">Responsável Técnico</p>
          </div>
          <div>
            <div className="border-b border-slate-400 w-3/4 mx-auto mb-1"></div>
            <p className="font-bold text-slate-800">{quote.clientName || "Cliente"}</p>
            <p className="text-slate-500 text-[10px]">Aprovado por (Assinatura / Carimbo)</p>
          </div>
        </div>
      </footer>
    </div>
  );
});

QuoteReportPrint.displayName = "QuoteReportPrint";
