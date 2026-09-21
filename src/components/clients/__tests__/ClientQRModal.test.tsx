import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { ClientQRModal } from "../ClientQRModal";
import { type Client } from "@/lib/api";

// Mock react-to-print
vi.mock("react-to-print", () => ({
  useReactToPrint: () => vi.fn(),
}));

// Mock hooks
vi.mock("@/hooks/use-data", () => ({
  useSettings: () => ({ settings: { companyName: "T-Maint Teste" } }),
  useCompanySettings: () => ({ companySettings: null }),
}));

describe("ClientQRModal Component", () => {
  const mockClient: Client = {
    id: "client-123",
    name: "Usinagem de Alta Precisão Alpha",
    cnpj: "12.345.678/0001-90",
    phone: "(47) 98888-7777",
    hourlyRate: 180,
    kmRate: 2.5,
    address: "Rua Industrial, 100",
    contact: "Eng. Roberto",
    hasPreventiveContract: false,
    preventiveContractValue: null,
    preventiveContractFile: null,
    userId: "user-456",
  };

  it("renders client name and portal tag information", () => {
    render(
      <ClientQRModal
        isOpen={true}
        onClose={() => {}}
        client={mockClient}
      />
    );

    expect(screen.getByText("Etiqueta QR do Cliente")).toBeDefined();
    expect(screen.getByText("Usinagem de Alta Precisão Alpha")).toBeDefined();
    expect(screen.getByText("CNPJ: 12.345.678/0001-90")).toBeDefined();
    expect(screen.getByText("Portal do Cliente • Histórico Técnico")).toBeDefined();
    expect(screen.getByText("Imprimir Etiqueta")).toBeDefined();
  });

  it("returns null when client is null", () => {
    const { container } = render(
      <ClientQRModal
        isOpen={true}
        onClose={() => {}}
        client={null}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
