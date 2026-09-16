export const ALL_FEATURES = [
  { key: "clientes", label: "Clientes & Equipamentos", path: "/clientes" },
  { key: "tecnicos", label: "Técnicos de Campo", path: "/tecnicos" },
  { key: "atividades", label: "Ordens de Serviço & Laudos", path: "/atividades" },
  { key: "relatorios", label: "Relatórios & Exportações", path: "/relatorios" },
  { key: "financeiro", label: "Financeiro & KM", path: "/financeiro" },
  { key: "orcamentos", label: "Orçamentos Comerciais", path: "/orcamentos" },
  { key: "requisicoes", label: "Requisições de Peças", path: "/requisicoes" },
  { key: "estoque", label: "Estoque & QR Code", path: "/estoque" },
  { key: "machine_qr", label: "Etiquetas Machine QR Tag", path: "/clientes" },
  { key: "portal_cliente", label: "Portal B2B do Cliente", path: "/clientes" },
] as const;

export type FeatureKey = (typeof ALL_FEATURES)[number]["key"];

export type PlanType = "basic" | "pro" | "elite" | "elite_pro" | "master";

export interface PlanConfig {
  id: PlanType;
  name: string;
  badgeLabel: string;
  basePrice: number;
  includedTechnicians: number;
  extraTechnicianPrice: number;
  maxTechniciansCap: number;
  features: FeatureKey[];
  description: string;
}

export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  basic: {
    id: "basic",
    name: "Básico",
    badgeLabel: "Essencial",
    basePrice: 197,
    includedTechnicians: 2,
    extraTechnicianPrice: 69.5,
    maxTechniciansCap: 10,
    features: ["clientes", "tecnicos", "atividades", "relatorios", "financeiro", "orcamentos"],
    description: "Para técnicos autônomos e pequenas assistências (até 2 técnicos inclusos, máx. 10 com adicionais).",
  },
  pro: {
    id: "pro",
    name: "Pro Industrial",
    badgeLabel: "Mais Recomendado",
    basePrice: 397,
    includedTechnicians: 2,
    extraTechnicianPrice: 89.5,
    maxTechniciansCap: 20,
    features: [
      "clientes",
      "tecnicos",
      "atividades",
      "relatorios",
      "financeiro",
      "orcamentos",
      "estoque",
      "requisicoes",
      "machine_qr",
      "portal_cliente",
    ],
    description: "Para oficinas e assistências com estoque, QR Tag e portal B2B (até 2 técnicos inclusos, máx. 20 com adicionais).",
  },
  elite: {
    id: "elite",
    name: "Elite Enterprise",
    badgeLabel: "Corporativo",
    basePrice: 997,
    includedTechnicians: 20,
    extraTechnicianPrice: 0,
    maxTechniciansCap: 9999,
    features: [
      "clientes",
      "tecnicos",
      "atividades",
      "relatorios",
      "financeiro",
      "orcamentos",
      "estoque",
      "requisicoes",
      "machine_qr",
      "portal_cliente",
    ],
    description: "Para indústrias, frotas pesadas e grandes operações (a partir de 20 técnicos / sob medida).",
  },
  elite_pro: {
    id: "elite_pro",
    name: "Elite Enterprise",
    badgeLabel: "Corporativo",
    basePrice: 997,
    includedTechnicians: 20,
    extraTechnicianPrice: 0,
    maxTechniciansCap: 9999,
    features: [
      "clientes",
      "tecnicos",
      "atividades",
      "relatorios",
      "financeiro",
      "orcamentos",
      "estoque",
      "requisicoes",
      "machine_qr",
      "portal_cliente",
    ],
    description: "Para indústrias, frotas pesadas e grandes operações (a partir de 20 técnicos / sob medida).",
  },
  master: {
    id: "master",
    name: "Master Sistema",
    badgeLabel: "Sistema",
    basePrice: 0,
    includedTechnicians: 9999,
    extraTechnicianPrice: 0,
    maxTechniciansCap: 9999,
    features: [
      "clientes",
      "tecnicos",
      "atividades",
      "relatorios",
      "financeiro",
      "orcamentos",
      "estoque",
      "requisicoes",
      "machine_qr",
      "portal_cliente",
    ],
    description: "Acesso de administração global da plataforma.",
  },
};

export function calculateSuggestedFee(planType: PlanType, totalTechnicians: number): number {
  const plan = PLAN_CONFIGS[planType] || PLAN_CONFIGS.basic;
  if (planType === "master") return 0;
  if (planType === "elite" || planType === "elite_pro") return plan.basePrice;
  const extraTechs = Math.max(0, totalTechnicians - plan.includedTechnicians);
  return plan.basePrice + extraTechs * plan.extraTechnicianPrice;
}

export function isFeatureAllowedForPlan(planType: string | undefined | null, featureKey: FeatureKey): boolean {
  const normPlan = ((planType as PlanType) || "basic") in PLAN_CONFIGS ? (planType as PlanType) : "basic";
  const plan = PLAN_CONFIGS[normPlan] || PLAN_CONFIGS.basic;
  return plan.features.includes(featureKey);
}

export function isFeatureAllowed(
  key: FeatureKey,
  allowedFeatures: string[] | null | undefined,
  isMaster: boolean,
  isAdmin: boolean,
  planType?: string | null,
) {
  if (isMaster) return true;
  if (planType && !isFeatureAllowedForPlan(planType, key)) return false;
  if (isAdmin) return true;
  if (allowedFeatures === null || allowedFeatures === undefined) return true;
  return allowedFeatures.includes(key);
}
