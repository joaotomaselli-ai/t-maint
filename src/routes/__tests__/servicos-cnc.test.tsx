import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FieldServicesPage } from '@/components/services/FieldServicesPage';

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  createFileRoute: () => () => () => null,
}));

describe('FieldServicesPage Component (/servicos-cnc)', () => {
  it('renders title, badge and CNC field services description', () => {
    render(<FieldServicesPage />);
    expect(screen.getByText(/Atendimento Técnico Especializado em Campo/i)).toBeTruthy();
    expect(screen.getByText(/Diagnóstico Elétrico, Parametrização e Manutenção de Máquinas CNC\./i)).toBeTruthy();
  });

  it('renders all core service pillars (Elétrico, Parametrização, Mecânica, Laboratório)', () => {
    render(<FieldServicesPage />);
    expect(screen.getByText(/Diagnóstico Elétrico em Campo/i)).toBeTruthy();
    expect(screen.getByText(/Parametrização & Retrofit CNC/i)).toBeTruthy();
    expect(screen.getByText(/Mecânica com Rede Homologada/i)).toBeTruthy();
    expect(screen.getByText(/Reparo Eletrônico em Bancada/i)).toBeTruthy();
  });

  it('renders major CNC brands in the domain matrix', () => {
    render(<FieldServicesPage />);
    expect(screen.getByText(/Okuma/i)).toBeTruthy();
    expect(screen.getByText(/Fanuc/i)).toBeTruthy();
    expect(screen.getByText(/Siemens/i)).toBeTruthy();
    expect(screen.getByText(/Heidenhain/i)).toBeTruthy();
    expect(screen.getByText(/Mitsubishi/i)).toBeTruthy();
    expect(screen.getAllByText(/Romi/i).length).toBeGreaterThan(0);
  });

  it('renders partner network homologation section and criteria', () => {
    render(<FieldServicesPage />);
    expect(screen.getByText(/É prestador de serviços ou oficina de manutenção CNC\?/i)).toBeTruthy();
    expect(screen.getByText(/Quero ser Parceiro Homologado/i)).toBeTruthy();
    expect(screen.getByText(/Critérios de Homologação/i)).toBeTruthy();
  });

  it('renders callout to SaaS software with navigation link', () => {
    render(<FieldServicesPage />);
    expect(screen.getByText(/Procurando o software de gestão de manutenção da sua própria equipe\?/i)).toBeTruthy();
    expect(screen.getByText(/Ver Planos e Recursos do Software SaaS →/i)).toBeTruthy();
  });
});
