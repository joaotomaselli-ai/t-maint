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

// Fallback storage helpers using company_settings or profiles
async function getFallbackQuotes(companyId: string): Promise<CommercialQuote[]> {
  try {
    const { data: comp } = await supabaseAdmin
      .from("companies")
      .select("allowed_features")
      .eq("id", companyId)
      .maybeSingle();

    const allowed = (comp?.allowed_features as any) || {};
    return (allowed._commercial_quotes as CommercialQuote[]) || [];
  } catch (err) {
    console.warn("Fallback read error:", err);
    return [];
  }
}

async function saveFallbackQuotes(companyId: string, quotes: CommercialQuote[]) {
  const { data: comp } = await supabaseAdmin
    .from("companies")
    .select("allowed_features")
    .eq("id", companyId)
    .maybeSingle();

  const allowed = (comp?.allowed_features as any) || {};
  allowed._commercial_quotes = quotes;

  await supabaseAdmin
    .from("companies")
    .update({ allowed_features: allowed })
    .eq("id", companyId);
}

// ----------------------------------------------------------------------
// LIST QUOTES
// ----------------------------------------------------------------------
export const listCommercialQuotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { companyId } = await getCallerCompany(userId);

    // Try primary table first
    try {
      const { data: quotes, error } = await supabaseAdmin
        .from("commercial_quotes")
        .select(`
          *,
          client:clients(id, name, cnpj, phone, address, contact)
        `)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (!error && quotes) {
        return quotes.map((q: any) => ({
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
      }
    } catch (err: any) {
      console.warn("Primary commercial_quotes table query failed, using fallback:", err?.message);
    }

    // Fallback: Read from company metadata
    const fallbackList = await getFallbackQuotes(companyId);
    
    // Enrich with client names
    const { data: clients } = await supabaseAdmin
      .from("clients")
      .select("id, name, cnpj, phone, address, contact")
      .eq("user_id", userId);

    const clientMap = new Map((clients || []).map(c => [c.id, c]));

    return fallbackList.map(q => {
      const cl = clientMap.get(q.clientId);
      return {
        ...q,
        clientName: q.clientName || cl?.name || "Cliente",
        clientCnpj: q.clientCnpj || cl?.cnpj || "",
        clientPhone: q.clientPhone || cl?.phone || "",
        clientEmail: q.clientEmail || cl?.contact || "",
        clientAddress: q.clientAddress || cl?.address || "",
      };
    });
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

    // Fetch client details
    const { data: client } = await supabaseAdmin
      .from("clients")
      .select("id, name, cnpj, phone, address, contact")
      .eq("id", data.clientId)
      .maybeSingle();

    // Try primary table first
    let primarySuccess = false;
    let result: any = null;

    try {
      if (data.id) {
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

        if (!error && updated) {
          primarySuccess = true;
          result = updated;
        }
      } else {
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

        if (!error && created) {
          primarySuccess = true;
          result = created;
        }
      }
    } catch (err: any) {
      console.warn("Primary save failed, saving to fallback:", err?.message);
    }

    if (primarySuccess) {
      return result;
    }

    // Fallback: Save to company metadata storage
    const list = await getFallbackQuotes(companyId);
    if (data.id) {
      const idx = list.findIndex(q => q.id === data.id);
      if (idx >= 0) {
        const existing = list[idx];
        const updated: CommercialQuote = {
          ...existing,
          clientId: data.clientId,
          clientName: client?.name || existing.clientName,
          clientCnpj: client?.cnpj || existing.clientCnpj,
          clientPhone: client?.phone || existing.clientPhone,
          clientEmail: client?.contact || existing.clientEmail,
          clientAddress: client?.address || existing.clientAddress,
          machine: data.machine,
          technicianId: data.technicianId,
          technicianName: data.technicianName,
          status: data.status,
          date: data.date,
          validUntil: data.validUntil,
          items: data.items,
          servicesTotal: data.servicesTotal,
          productsTotal: data.productsTotal,
          travelKm: data.travelKm,
          travelRate: data.travelRate,
          travelTotal: data.travelTotal,
          discountAmount: data.discountAmount,
          totalAmount: data.totalAmount,
          paymentTerms: data.paymentTerms,
          executionDeadline: data.executionDeadline,
          warrantyTerms: data.warrantyTerms,
          notes: data.notes || "",
          updatedAt: new Date().toISOString(),
        };
        list[idx] = updated;
        await saveFallbackQuotes(companyId, list);
        return updated;
      }
    }

    const nextNum = list.length + 1;
    const quoteNumber = `ORC-${year}-${String(nextNum).padStart(3, "0")}`;
    const newQuote: CommercialQuote = {
      id: crypto.randomUUID(),
      companyId,
      quoteNumber,
      clientId: data.clientId,
      clientName: client?.name || "Cliente",
      clientCnpj: client?.cnpj || "",
      clientPhone: client?.phone || "",
      clientEmail: client?.contact || "",
      clientAddress: client?.address || "",
      machine: data.machine,
      technicianId: data.technicianId,
      technicianName: data.technicianName,
      status: data.status,
      date: data.date,
      validUntil: data.validUntil,
      items: data.items,
      servicesTotal: data.servicesTotal,
      productsTotal: data.productsTotal,
      travelKm: data.travelKm,
      travelRate: data.travelRate,
      travelTotal: data.travelTotal,
      discountAmount: data.discountAmount,
      totalAmount: data.totalAmount,
      paymentTerms: data.paymentTerms,
      executionDeadline: data.executionDeadline,
      warrantyTerms: data.warrantyTerms,
      notes: data.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newQuote);
    await saveFallbackQuotes(companyId, list);
    return newQuote;
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

    try {
      const { error } = await supabaseAdmin
        .from("commercial_quotes")
        .update({ status: data.status, updated_at: new Date().toISOString() })
        .eq("id", data.quoteId)
        .eq("company_id", companyId);

      if (!error) return { ok: true };
    } catch {}

    // Fallback
    const list = await getFallbackQuotes(companyId);
    const item = list.find(q => q.id === data.quoteId);
    if (item) {
      item.status = data.status;
      item.updatedAt = new Date().toISOString();
      await saveFallbackQuotes(companyId, list);
    }
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

    try {
      const { error } = await supabaseAdmin
        .from("commercial_quotes")
        .delete()
        .eq("id", data.quoteId)
        .eq("company_id", companyId);

      if (!error) return { ok: true };
    } catch {}

    // Fallback
    let list = await getFallbackQuotes(companyId);
    list = list.filter(q => q.id !== data.quoteId);
    await saveFallbackQuotes(companyId, list);
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
    const year = new Date().getFullYear();

    // Try finding in DB or fallback
    let original: any = null;
    try {
      const { data: dbItem } = await supabaseAdmin
        .from("commercial_quotes")
        .select("*")
        .eq("id", data.quoteId)
        .eq("company_id", companyId)
        .maybeSingle();
      if (dbItem) original = dbItem;
    } catch {}

    if (!original) {
      const list = await getFallbackQuotes(companyId);
      original = list.find(q => q.id === data.quoteId);
    }

    if (!original) throw new Error("Orçamento original não encontrado.");

    // Create duplicate
    const list = await getFallbackQuotes(companyId);
    const nextNum = list.length + 1;
    const quoteNumber = `ORC-${year}-${String(nextNum).padStart(3, "0")}`;

    const newQuote: CommercialQuote = {
      id: crypto.randomUUID(),
      companyId,
      quoteNumber,
      clientId: original.client_id || original.clientId,
      clientName: original.clientName || original.client?.name || "Cliente",
      machine: original.machine || "",
      technicianId: original.technician_id || original.technicianId || null,
      technicianName: original.technician_name || original.technicianName || "",
      status: "draft",
      date: new Date().toISOString().slice(0, 10),
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      items: original.items || [],
      servicesTotal: Number(original.services_total || original.servicesTotal || 0),
      productsTotal: Number(original.products_total || original.productsTotal || 0),
      travelKm: Number(original.travel_km || original.travelKm || 0),
      travelRate: Number(original.travel_rate || original.travelRate || 0),
      travelTotal: Number(original.travel_total || original.travelTotal || 0),
      discountAmount: Number(original.discount_amount || original.discountAmount || 0),
      totalAmount: Number(original.total_amount || original.totalAmount || 0),
      paymentTerms: original.payment_terms || original.paymentTerms || "À vista / Pix",
      executionDeadline: original.execution_deadline || original.executionDeadline || "A combinar",
      warrantyTerms: original.warranty_terms || original.warrantyTerms || "90 dias para peças e serviços",
      notes: original.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await supabaseAdmin.from("commercial_quotes").insert({
        company_id: companyId,
        quote_number: quoteNumber,
        client_id: newQuote.clientId,
        machine: newQuote.machine,
        technician_id: newQuote.technicianId,
        technician_name: newQuote.technicianName,
        status: "draft",
        date: newQuote.date,
        valid_until: newQuote.validUntil,
        items: newQuote.items,
        services_total: newQuote.servicesTotal,
        products_total: newQuote.productsTotal,
        travel_km: newQuote.travelKm,
        travel_rate: newQuote.travelRate,
        travel_total: newQuote.travelTotal,
        discount_amount: newQuote.discountAmount,
        total_amount: newQuote.totalAmount,
        payment_terms: newQuote.paymentTerms,
        execution_deadline: newQuote.executionDeadline,
        warranty_terms: newQuote.warrantyTerms,
        notes: newQuote.notes,
      });
    } catch {}

    list.unshift(newQuote);
    await saveFallbackQuotes(companyId, list);
    return newQuote;
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

    let quote: any = null;
    try {
      const { data: dbItem } = await supabaseAdmin
        .from("commercial_quotes")
        .select(`*, client:clients(name)`)
        .eq("id", data.quoteId)
        .eq("company_id", companyId)
        .maybeSingle();
      if (dbItem) quote = dbItem;
    } catch {}

    if (!quote) {
      const list = await getFallbackQuotes(companyId);
      quote = list.find(q => q.id === data.quoteId);
    }

    if (!quote) throw new Error("Orçamento não encontrado.");

    // Generate OS number
    const { count } = await supabaseAdmin
      .from("service_reports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    const nextOSNum = String((count ?? 0) + 1).padStart(4, "0");

    const itemsList = (quote.items || [])
      .map((it: any) => `- ${it.name} (${it.quantity} ${it.unit || "Un"})`)
      .join("\n");

    const quoteNumber = quote.quote_number || quote.quoteNumber;
    const description = [
      `Orçamento de Origem: ${quoteNumber}`,
      quote.notes ? `Observações: ${quote.notes}` : null,
      itemsList ? `Itens e Serviços Contratados:\n${itemsList}` : null,
    ].filter(Boolean).join("\n\n");

    const clientId = quote.client_id || quote.clientId;
    const clientName = quote.client?.name || quote.clientName || "Cliente";

    const { data: report, error: repErr } = await supabaseAdmin
      .from("service_reports")
      .insert({
        user_id: userId,
        client_id: clientId,
        order_number: nextOSNum,
        date: new Date().toISOString().slice(0, 10),
        machine: quote.machine || "Equipamento",
        requester: clientName,
        type: "corretiva",
        description: description || "Serviço aprovado via orçamento.",
        summary: `Serviço aprovado conforme Orçamento ${quoteNumber}`,
        technician: quote.technician_name || quote.technicianName || "",
        km: Number(quote.travel_km || quote.travelKm || 0),
        is_package: true,
        package_value: Number(quote.total_amount || quote.totalAmount || 0),
      })
      .select()
      .single();

    if (repErr) throw new Error("Erro ao criar Ordem de Serviço: " + repErr.message);

    // Mark as approved in DB and Fallback
    try {
      await supabaseAdmin
        .from("commercial_quotes")
        .update({
          status: "approved",
          converted_activity_id: report.id,
          converted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", quote.id);
    } catch {}

    const list = await getFallbackQuotes(companyId);
    const fbItem = list.find(q => q.id === data.quoteId);
    if (fbItem) {
      fbItem.status = "approved";
      fbItem.convertedActivityId = report.id;
      fbItem.convertedAt = new Date().toISOString();
      fbItem.updatedAt = new Date().toISOString();
      await saveFallbackQuotes(companyId, list);
    }

    return {
      ok: true,
      activityId: report.id,
      orderNumber: report.order_number,
    };
  });
