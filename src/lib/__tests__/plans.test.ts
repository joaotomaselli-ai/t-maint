import { describe, it, expect } from "vitest";
import {
  PLAN_CONFIGS,
  calculateSuggestedFee,
  isFeatureAllowedForPlan,
  isFeatureAllowed,
} from "@/lib/features";

describe("Plan Matrix and Business Rules", () => {
  it("should have valid configs for all official plans", () => {
    expect(PLAN_CONFIGS.basic).toBeDefined();
    expect(PLAN_CONFIGS.pro).toBeDefined();
    expect(PLAN_CONFIGS.elite_pro).toBeDefined();

    expect(PLAN_CONFIGS.basic.basePrice).toBe(197);
    expect(PLAN_CONFIGS.basic.includedTechnicians).toBe(2);
    expect(PLAN_CONFIGS.basic.extraTechnicianPrice).toBe(69.5);
    expect(PLAN_CONFIGS.basic.maxTechniciansCap).toBe(10);

    expect(PLAN_CONFIGS.pro.basePrice).toBe(397);
    expect(PLAN_CONFIGS.pro.includedTechnicians).toBe(2);
    expect(PLAN_CONFIGS.pro.extraTechnicianPrice).toBe(89.5);
    expect(PLAN_CONFIGS.pro.maxTechniciansCap).toBe(20);
  });

  it("should calculate correct suggested monthly fees based on technician count", () => {
    // Basic: 2 techs -> 197
    expect(calculateSuggestedFee("basic", 2)).toBe(197);
    // Basic: 3 techs -> 197 + 69.50 = 266.50
    expect(calculateSuggestedFee("basic", 3)).toBe(266.5);
    // Basic: 4 techs -> 197 + 2 * 69.50 = 336.00
    expect(calculateSuggestedFee("basic", 4)).toBe(336);

    // Pro: 2 techs -> 397
    expect(calculateSuggestedFee("pro", 2)).toBe(397);
    // Pro: 3 techs -> 397 + 89.50 = 486.50
    expect(calculateSuggestedFee("pro", 3)).toBe(486.5);
    // Pro: 5 techs -> 397 + 3 * 89.50 = 665.50
    expect(calculateSuggestedFee("pro", 5)).toBe(665.5);
  });

  it("should restrict estoque and requisicoes on basic plan", () => {
    expect(isFeatureAllowedForPlan("basic", "atividades")).toBe(true);
    expect(isFeatureAllowedForPlan("basic", "financeiro")).toBe(true);
    expect(isFeatureAllowedForPlan("basic", "orcamentos")).toBe(true);
    expect(isFeatureAllowedForPlan("basic", "clientes")).toBe(true);
    expect(isFeatureAllowedForPlan("basic", "tecnicos")).toBe(true);
    expect(isFeatureAllowedForPlan("basic", "relatorios")).toBe(true);

    expect(isFeatureAllowedForPlan("basic", "estoque")).toBe(false);
    expect(isFeatureAllowedForPlan("basic", "requisicoes")).toBe(false);
    expect(isFeatureAllowedForPlan("basic", "machine_qr")).toBe(false);
  });

  it("should permit all features on pro and elite plans", () => {
    expect(isFeatureAllowedForPlan("pro", "estoque")).toBe(true);
    expect(isFeatureAllowedForPlan("pro", "requisicoes")).toBe(true);
    expect(isFeatureAllowedForPlan("pro", "machine_qr")).toBe(true);
    expect(isFeatureAllowedForPlan("pro", "portal_cliente")).toBe(true);

    expect(isFeatureAllowedForPlan("elite_pro", "estoque")).toBe(true);
    expect(isFeatureAllowedForPlan("elite_pro", "requisicoes")).toBe(true);
  });

  it("should evaluate isFeatureAllowed respecting master override and plan rules", () => {
    // Master has access to everything
    expect(isFeatureAllowed("estoque", null, true, false, "basic")).toBe(true);

    // Admin on Basic plan cannot access Estoque
    expect(isFeatureAllowed("estoque", null, false, true, "basic")).toBe(false);

    // Admin on Pro plan can access Estoque
    expect(isFeatureAllowed("estoque", null, false, true, "pro")).toBe(true);
  });
});
