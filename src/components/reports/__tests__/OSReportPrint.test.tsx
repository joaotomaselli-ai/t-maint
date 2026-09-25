import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { OSReportPrint } from '../OSReportPrint';
import type { ServiceReport, Client, Settings } from '@/lib/api';

describe('OSReportPrint Component', () => {
  const mockReport: ServiceReport = {
    id: 'os-123',
    orderNumber: '001',
    clientId: 'cli-1',
    date: '2026-09-24',
    machine: 'Torno CNC Romi Centur 30D',
    requester: 'Carlos Silva',
    type: 'corretiva',
    description: 'Inspeção do equipamento para retirada dos fusos X e Y',
    summary: 'Realizada inspeção de sensores e limpeza do painel',
    travelOutStart: '08:00',
    travelOutEnd: '08:30',
    serviceStart: '08:30',
    serviceEnd: '12:00',
    travelBackStart: '12:00',
    travelBackEnd: '12:30',
    km: 25,
    technician: 'João Batista Tomaselli',
    technicianSignature: 'data:image/png;base64,mockTech',
    clientSignature: 'data:image/png;base64,mockClient',
    overtimeWeekdayHours: 0,
    overtimeWeekendHours: 0,
    discountHours: 0,
    createdAt: '2026-09-24T10:00:00Z',
  };

  const mockClient: Client = {
    id: 'cli-1',
    name: 'Usinagem Precision Ltda',
    hourlyRate: 150,
    kmRate: 2,
    hasPreventiveContract: false,
  };

  const mockSettings: Settings = {
    companyName: 'T-Maint Manutenção Industrial',
    technicianName: 'João Batista Tomaselli',
  };

  it('renders corrective OS report with photos (Antes, Depois, Requisições)', () => {
    const photos = [
      { kind: 'mechanical_before', url: 'https://example.com/before1.jpg' },
      { kind: 'mechanical_after', url: 'https://example.com/after1.jpg' },
      { kind: 'future_replacements', url: 'https://example.com/part.jpg' },
    ];

    render(
      <OSReportPrint
        report={mockReport}
        client={mockClient}
        settings={mockSettings}
        photos={photos}
      />
    );

    expect(screen.getByText(/Galeria de Evidências/i)).toBeTruthy();
    expect(screen.getByText(/Antes do Serviço/i)).toBeTruthy();
    expect(screen.getByText(/Depois do Serviço/i)).toBeTruthy();
    expect(screen.getByText(/Evidências de Peças \/ Requisições Futuras/i)).toBeTruthy();
  });

  it('renders signatures properly', () => {
    render(
      <OSReportPrint
        report={mockReport}
        client={mockClient}
        settings={mockSettings}
        photos={[]}
      />
    );

    expect(screen.getByAltText(/Assinatura do Técnico/i)).toBeTruthy();
    expect(screen.getByAltText(/Assinatura do Cliente/i)).toBeTruthy();
  });
});
