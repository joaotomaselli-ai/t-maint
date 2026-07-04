export const ALL_FEATURES = [
  { key: "clientes", label: "Clientes", path: "/clientes" },
  { key: "tecnicos", label: "Técnicos", path: "/tecnicos" },
  { key: "atividades", label: "Ordem de Serviço", path: "/atividades" },
  { key: "relatorios", label: "Relatórios", path: "/relatorios" },
  { key: "financeiro", label: "Financeiro", path: "/financeiro" },
  { key: "requisicoes", label: "Requisições", path: "/requisicoes" },
  { key: "estoque", label: "Estoque", path: "/estoque" },
] as const;

export type FeatureKey = (typeof ALL_FEATURES)[number]["key"];

export function isFeatureAllowed(
  key: FeatureKey,
  allowedFeatures: string[] | null | undefined,
  isMaster: boolean,
  isAdmin: boolean,
) {
  if (isMaster || isAdmin) return true;
  if (allowedFeatures === null || allowedFeatures === undefined) return true;
  return allowedFeatures.includes(key);
}
