import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CommercialQuoteStatus = "draft" | "sent" | "negotiating" | "approved" | "rejected" | "expired";

export type CommercialQuoteItem = {
  id: string;
  type: "service" | "product";
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
};

export type CommercialQuote = {
  id: string;
  companyId: string;
  quoteNumber: string;
  clientId: string;
  clientName?: string;
  clientCnpj?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  machine: string;
  technicianId?: string | null;
  technicianName?: string;
  status: CommercialQuoteStatus;
  date: string;
  validUntil: string;
  items: CommercialQuoteItem[];
  servicesTotal: number;
  productsTotal: number;
  travelKm: number;
  travelRate: number;
  travelTotal: number;
  discountAmount: number;
  totalAmount: number;
  paymentTerms: string;
  executionDeadline: string;
  warrantyTerms: string;
  notes?: string;
  convertedActivityId?: string | null;
  convertedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

async function getCallerCompany(userId: string) {
  const { data: role } = await supabaseAdmin
    .from("user_roles")
    .select("company_id, role")
    .eq("user_id", userId)
    .maybeSingle();
  if (!role?.company_id) throw new Error("Empresa não vinculada ao usuário.");
  return { companyId: role.company_id, role: role.role };
}

// ----------------------------------------------------------------------
// LIST QUOTES
// ----------------------------------------------------------------------
export const listCommercialQuotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { companyId } = await getCallerCompany(userId);

    // Query quotes for this company
    const { data: quotes, error } = await supabaseAdmin
      .from("commercial_quotes")
      .select(`
        *,
        client:clients(id, name, cnpj, phone, address, contact)
      `)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      // If table doesn't exist yet or other DB error, return empty list gracefully
      console.warn("Error querying commercial_quotes:", error.message);
      return [] as CommercialQuote[];
    }

    return (quotes || []).map((q: any) => ({
      id: q.id,
      companyId: q.company_id,
      quoteNumber: q.quote_number,
      clientId: q.client_id,
      clientName: q.client?.name || "Cliente",
      clientCnpj: q.client?.cnpj || "",
      clientPhone: q.client?.phone || "",
      clientEmail: q.client?.contact || "",
      clientAddress: q.client?.address || "",
      machine: q.machine || "",
      technicianId: q.technician_id,
      technicianName: q.technician_name || "",
      status: q.status || "draft",
      date: q.date || new Date().toISOString().slice(0, 10),
      validUntil: q.valid_until || new Date().toISOString().slice(0, 10),
      items: (q.items || []) as CommercialQuoteItem[],
      servicesTotal: Number(q.services_total || 0),
      productsTotal: Number(q.products_total || 0),
      travelKm: Number(q.travel_km || 0),
      travelRate: Number(q.travel_rate || 0),
      travelTotal: Number(q.travel_total || 0),
      discountAmount: Number(q.discount_amount || 0),
      totalAmount: Number(q.total_amount || 0),
      paymentTerms: q.payment_terms || "À vista / Pix",
      executionDeadline: q.execution_deadline || "A combinar",
      warrantyTerms: q.warranty_terms || "90 dias para peças e serviços",
      notes: q.notes || "",
      convertedActivityId: q.converted_activity_id,
      convertedAt: q.converted_at,
      createdAt: q.created_at,
      updatedAt: q.updated_at,
    })) as CommercialQuote[];
  });

// ----------------------------------------------------------------------
// SAVE (CREATE OR UPDATE) QUOTE
// ----------------------------------------------------------------------
export const saveCommercialQuote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      id: z.string().uuid().optional(),
      clientId: z.string().uuid(),
      machine: z.string().default(""),
      technicianId: z.string().uuid().nullable().optional(),
      technicianName: z.string().default(""),
      status: z.enum(["draft", "sent", "negotiating", "approved", "rejected", "expired"]).default("draft"),
      date: z.string().min(10),
      validUntil: z.string().min(10),
      items: z.array(
        z.object({
          id: z.string(),
          type: z.enum(["service", "product"]),
          name: z.string().min(1),
          description: z.string().optional(),
          quantity: z.number().min(0),
          unit: z.string().default("Un"),
          unitPrice: z.number().min(0),
          total: z.number().min(0),
        })
      ),
      servicesTotal: z.number().min(0),
      productsTotal: z.number().min(0),
      travelKm: z.number().min(0).default(0),
      travelRate: z.number().min(0).default(0),
      travelTotal: z.number().min(0).default(0),
      discountAmount: z.number().min(0).default(0),
      totalAmount: z.number().min(0),
      paymentTerms: z.string().default("À vista / Pix"),
      executionDeadline: z.string().default("A combinar"),
      warrantyTerms: z.string().default("90 dias para peças e serviços"),
      notes: z.string().optional(),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { companyId } = await getCallerCompany(userId);

    const year = new Date().getFullYear();

    if (data.id) {
      // UPDATE EXISTING
      const { data: updated, error } = await supabaseAdmin
        .from("commercial_quotes")
        .update({
          client_id: data.clientId,
          machine: data.machine,
          technician_id: data.technicianId || null,
          technician_name: data.technicianName,
          status: data.status,
          date: data.date,
          valid_until: data.validUntil,
          items: data.items,
          services_total: data.servicesTotal,
          products_total: data.productsTotal,
          travel_km: data.travelKm,
          travel_rate: data.travelRate,
          travel_total: data.travelTotal,
          discount_amount: data.discountAmount,
          total_amount: data.totalAmount,
          payment_terms: data.paymentTerms,
          execution_deadline: data.executionDeadline,
          warranty_terms: data.warrantyTerms,
          notes: data.notes || "",
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id)
        .eq("company_id", companyId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return updated;
    } else {
      // CREATE NEW: Generate sequential number ORC-YEAR-XXX
      const { count } = await supabaseAdmin
        .from("commercial_quotes")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId);

      const nextNum = (count ?? 0) + 1;
      const quoteNumber = `ORC-${year}-${String(nextNum).padStart(3, "0")}`;

      const { data: created, error } = await supabaseAdmin
        .from("commercial_quotes")
        .insert({
          company_id: companyId,
          quote_number: quoteNumber,
          client_id: data.clientId,
          machine: data.machine,
          technician_id: data.technicianId || null,
          technician_name: data.technicianName,
          status: data.status,
          date: data.date,
          valid_until: data.validUntil,
          items: data.items,
          services_total: data.servicesTotal,
          products_total: data.productsTotal,
          travel_km: data.travelKm,
          travel_rate: data.travelRate,
          travel_total: data.travelTotal,
          discount_amount: data.discountAmount,
          total_amount: data.totalAmount,
          payment_terms: data.paymentTerms,
          execution_deadline: data.executionDeadline,
          warranty_terms: data.warrantyTerms,
          notes: data.notes || "",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return created;
    }
  });

// ----------------------------------------------------------------------
// UPDATE STATUS
// ----------------------------------------------------------------------
export const updateCommercialQuoteStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      quoteId: z.string().uuid(),
      status: z.enum(["draft", "sent", "negotiating", "approved", "rejected", "expired"]),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { companyId } = await getCallerCompany(userId);

    const { error } = await supabaseAdmin
      .from("commercial_quotes")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.quoteId)
      .eq("company_id", companyId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ----------------------------------------------------------------------
// DELETE QUOTE
// ----------------------------------------------------------------------
export const deleteCommercialQuote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ quoteId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { companyId } = await getCallerCompany(userId);

    const { error } = await supabaseAdmin
      .from("commercial_quotes")
      .delete()
      .eq("id", data.quoteId)
      .eq("company_id", companyId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ----------------------------------------------------------------------
// DUPLICATE QUOTE
// ----------------------------------------------------------------------
export const duplicateCommercialQuote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ quoteId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { companyId } = await getCallerCompany(userId);

    const { data: original, error: fetchErr } = await supabaseAdmin
      .from("commercial_quotes")
      .select("*")
      .eq("id", data.quoteId)
      .eq("company_id", companyId)
      .single();

    if (fetchErr || !original) throw new Error("Orçamento original não encontrado.");

    const year = new Date().getFullYear();
    const { count } = await supabaseAdmin
      .from("commercial_quotes")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId);

    const nextNum = (count ?? 0) + 1;
    const quoteNumber = `ORC-${year}-${String(nextNum).padStart(3, "0")}`;

    const { data: created, error } = await supabaseAdmin
      .from("commercial_quotes")
      .insert({
        company_id: companyId,
        quote_number: quoteNumber,
        client_id: original.client_id,
        machine: original.machine,
        technician_id: original.technician_id,
        technician_name: original.technician_name,
        status: "draft",
        date: new Date().toISOString().slice(0, 10),
        valid_until: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
        items: original.items,
        services_total: original.services_total,
        products_total: original.products_total,
        travel_km: original.travel_km,
        travel_rate: original.travel_rate,
        travel_total: original.travel_total,
        discount_amount: original.discount_amount,
        total_amount: original.total_amount,
        payment_terms: original.payment_terms,
        execution_deadline: original.execution_deadline,
        warranty_terms: original.warranty_terms,
        notes: original.notes,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return created;
  });

// ----------------------------------------------------------------------
// CONVERT QUOTE TO O.S. (1-CLICK)
// ----------------------------------------------------------------------
export const convertCommercialQuoteToOS = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ quoteId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { companyId } = await getCallerCompany(userId);

    const { data: quote, error: qErr } = await supabaseAdmin
      .from("commercial_quotes")
      .select(`
        *,
        client:clients(name)
      `)
      .eq("id", data.quoteId)
      .eq("company_id", companyId)
      .single();

    if (qErr || !quote) throw new Error("Orçamento não encontrado.");

    // Generate OS number
    const { count } = await supabaseAdmin
      .from("service_reports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    const nextOSNum = String((count ?? 0) + 1).padStart(4, "0");

    // Build description from items
    const itemsList = (quote.items || [])
      .map((it: any) => `- ${it.name} (${it.quantity} ${it.unit || "Un"})`)
      .join("\n");

    const description = [
      `Orçamento de Origem: ${quote.quote_number}`,
      quote.notes ? `Observações: ${quote.notes}` : null,
      itemsList ? `Itens e Serviços Contratados:\n${itemsList}` : null,
    ].filter(Boolean).join("\n\n");

    // Create Service Report (Activity)
    const { data: report, error: repErr } = await supabaseAdmin
      .from("service_reports")
      .insert({
        user_id: userId,
        client_id: quote.client_id,
        order_number: nextOSNum,
        date: new Date().toISOString().slice(0, 10),
        machine: quote.machine || "Equipamento",
        requester: quote.client?.name || "Cliente",
        type: "corretiva",
        description: description || "Serviço aprovado via orçamento.",
        summary: `Serviço aprovado conforme Orçamento ${quote.quote_number}`,
        technician: quote.technician_name || "",
        km: Number(quote.travel_km || 0),
        is_package: true,
        package_value: Number(quote.total_amount || 0),
      })
      .select()
      .single();

    if (repErr) throw new Error("Erro ao criar Ordem de Serviço: " + repErr.message);

    // Update quote status to approved and record converted activity ID
    await supabaseAdmin
      .from("commercial_quotes")
      .update({
        status: "approved",
        converted_activity_id: report.id,
        converted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", quote.id);

    return {
      ok: true,
      activityId: report.id,
      orderNumber: report.order_number,
    };
  });
