import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { LandingNavbar } from '../LandingNavbar';
import { HeroSection } from '../HeroSection';
import { BeforeAfterSection } from '../BeforeAfterSection';
import { SoftwareShowcaseSection } from '../SoftwareShowcaseSection';
import { AuthoritySection } from '../AuthoritySection';
import { FieldServicesSection } from '../FieldServicesSection';
import { MachineQRTeaserSection } from '../MachineQRTeaserSection';
import { PricingAndContactSection } from '../PricingAndContactSection';
import { LandingFooter } from '../LandingFooter';
import { LandingPage } from '../LandingPage';

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

describe('Landing Page Components (SaaS Repositioning)', () => {
  it('renders LandingNavbar with link to /servicos-cnc', () => {
    render(<LandingNavbar />);
    expect(screen.getByText(/T-MAINT/i)).toBeTruthy();
    const cncLinks = screen.getAllByRole('link', { name: /Atendimento CNC em Campo/i });
    expect(cncLinks.length).toBeGreaterThan(0);
    expect(cncLinks[0].getAttribute('href')).toBe('/servicos-cnc');
  });

  it('renders HeroSection with new SaaS headline, authority badges and CTAs', () => {
    render(<HeroSection whatsappUrlSoftware="https://wa.me/test-soft" />);
    expect(
      screen.getByText(/O Software de Gestão de Manutenção Criado para o/i)
    ).toBeTruthy();
    expect(
      screen.getByText(/Chão de Fábrica e Serviços Técnicos/i)
    ).toBeTruthy();
    expect(
      screen.getByText(/Elimine o papel rasurado, os apontamentos perdidos no WhatsApp e a conferência manual de horas/i)
    ).toBeTruthy();
    expect(screen.getByText(/EXPERTISE WEG/i)).toBeTruthy();
    expect(screen.getByText(/SOFTWARE CMMS & GESTÃO DE CAMPO INDUSTRIAL/i)).toBeTruthy();
    
    // Check CTAs
    expect(screen.getByText(/Iniciar Demonstração Gratuita/i)).toBeTruthy();
    expect(screen.getByText(/Ver Demonstração Prática/i)).toBeTruthy();
  });

  it('renders BeforeAfterSection with 4 critical questions and pain matrix', () => {
    render(<BeforeAfterSection />);
    expect(
      screen.getByText(/O problema da manutenção não é a falta de esforço\./i)
    ).toBeTruthy();
    expect(
      screen.getByText(/É a falta de visibilidade\./i)
    ).toBeTruthy();
    expect(screen.getByText(/O que está aberto agora e qual é a prioridade real\?/i)).toBeTruthy();
    expect(screen.getByText(/Quem é o técnico responsável por cada máquina\?/i)).toBeTruthy();
    expect(screen.getByText(/Quanto deve ser faturado ou pago sem erros de cálculo\?/i)).toBeTruthy();

    // Check comparative items
    expect(screen.getByText(/Pranchetas & Papéis Rasurados/i)).toBeTruthy();
    expect(screen.getByText(/O.S. 100% Digital & Assinatura na Tela/i)).toBeTruthy();
    expect(screen.getByText(/Horas e KM Não Auditáveis/i)).toBeTruthy();
    expect(screen.getByText(/Apontamento Rastreável com Cronômetro e KM/i)).toBeTruthy();
    expect(screen.getByText(/Fotos Perdidas no WhatsApp/i)).toBeTruthy();
    expect(screen.getByText(/Histórico Consolidado no Prontuário/i)).toBeTruthy();
    expect(screen.getByText(/Fechamento Financeiro Lento/i)).toBeTruthy();
    expect(screen.getByText(/Margem Protegida & Fechamento Ágil/i)).toBeTruthy();
  });

  it('renders SoftwareShowcaseSection with 5 modules', () => {
    render(<SoftwareShowcaseSection />);
    expect(screen.getByText(/Software Industrial Criado para a Rotina de Manutenção/i)).toBeTruthy();
    expect(screen.getByText(/Cockpit & Ordens de Serviço/i)).toBeTruthy();
    expect(screen.getByText(/Apontamento de Campo/i)).toBeTruthy();
    expect(screen.getByText(/Machine QR Tag/i)).toBeTruthy();
    expect(screen.getByText(/Controle de Estoque/i)).toBeTruthy();
    expect(screen.getByText(/Portal B2B do Cliente/i)).toBeTruthy();

    // Interactive switch to Estoque
    const estoqueTab = screen.getByRole('button', { name: /Controle de Estoque/i });
    fireEvent.click(estoqueTab);
    expect(screen.getByText(/Controle de Insumos com Baixa Automática de Estoque/i)).toBeTruthy();
  });

  it('renders AuthoritySection with founder mechatronics and WEG 7 years background', () => {
    render(<AuthoritySection />);
    const founderMatches = screen.getAllByText(/João Batista Tomaselli/i);
    expect(founderMatches.length).toBeGreaterThan(0);
    expect(screen.getByText(/Formação em Mecatrônica/i)).toBeTruthy();
    expect(screen.getAllByText(/Vocabulário Nativo/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Robustez Sem Frescuras/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Fundador & Especialista em Manutenção de Máquinas de Usinagem/i)).toBeTruthy();
  });

  it('renders FieldServicesSection with CNC brands and diagnostics', () => {
    render(<FieldServicesSection whatsappUrlService="https://wa.me/test" />);
    const diagMatches = screen.getAllByText(/Diagnóstico Elétrico em Campo/i);
    expect(diagMatches.length).toBeGreaterThan(0);
    expect(screen.getByText(/Mecânica com Rede Homologada/i)).toBeTruthy();
    expect(screen.getByText(/Okuma/i)).toBeTruthy();
    expect(screen.getByText(/Siemens/i)).toBeTruthy();
  });

  it('renders MachineQRTeaserSection with QR Tag explanation', () => {
    render(<MachineQRTeaserSection />);
    expect(screen.getByText(/Machine QR Tag/i)).toBeTruthy();
    expect(screen.getByText(/Acesso Instantâneo Sem Instalação de App/i)).toBeTruthy();
  });

  it('renders PricingAndContactSection with SaaS plans and integrated Technical FAQ', () => {
    render(
      <PricingAndContactSection
        whatsappUrlSoftware="https://wa.me/soft"
        whatsappUrlService="https://wa.me/serv"
      />
    );
    const proMatches = screen.getAllByText(/Pro Industrial/i);
    expect(proMatches.length).toBeGreaterThan(0);
    expect(screen.getByText(/Contratar Essencial/i)).toBeTruthy();
    expect(screen.getByText(/Assinar Plano Pro/i)).toBeTruthy();
    expect(screen.getByText(/Falar com Especialista/i)).toBeTruthy();
    expect(screen.getByText(/Elite Enterprise/i)).toBeTruthy();
    expect(screen.getByText(/Sob Consulta/i)).toBeTruthy();

    // Check 4 technical FAQ questions
    expect(screen.getByText(/Preciso instalar algum aplicativo pesado na Play Store ou App Store\?/i)).toBeTruthy();
    expect(screen.getByText(/Como funciona a leitura de QR Code nos painéis das máquinas \(Machine QR Tag\)\?/i)).toBeTruthy();
    expect(screen.getByText(/Os laudos técnicos em PDF podem ser gerados e assinados na tela em locais sem sinal de internet\?/i)).toBeTruthy();
    expect(screen.getByText(/Como é calculado o deslocamento e a quilometragem \(KM\) dos técnicos em campo\?/i)).toBeTruthy();

    // Toggle FAQ item 1
    const faqBtn = screen.getByText(/Preciso instalar algum aplicativo pesado na Play Store ou App Store\?/i);
    fireEvent.click(faqBtn);
    expect(screen.getByText(/O T-MAINT opera como uma aplicação web progressiva \(PWA\) de alta performance/i)).toBeTruthy();
  });

  it('renders LandingFooter with legal terms and CNC Field Service highlight link', () => {
    render(<LandingFooter whatsappUrlService="https://wa.me/serv" />);
    expect(screen.getByText(/Termos de Uso/i)).toBeTruthy();
    expect(screen.getByText(/Privacidade & LGPD/i)).toBeTruthy();
    
    const cncLink = screen.getByRole('link', { name: /Atendimento Técnico CNC em Campo/i });
    expect(cncLink).toBeTruthy();
    expect(cncLink.getAttribute('href')).toBe('/servicos-cnc');
  });

  it('renders LandingPage in full 100% SaaS sequence without FieldServicesSection', () => {
    render(<LandingPage />);
    // Verify SaaS sections are present
    expect(screen.getByText(/O Software de Gestão de Manutenção Criado para o/i)).toBeTruthy();
    expect(screen.getByText(/Cockpit & Ordens de Serviço/i)).toBeTruthy();
    const proIndustrialElements = screen.getAllByText(/Pro Industrial/i);
    expect(proIndustrialElements.length).toBeGreaterThan(0);
    
    // Verify FieldServicesSection is NOT present on the SaaS Home
    expect(screen.queryByText(/Diagnóstico Elétrico em Campo/i)).toBeNull();
    expect(screen.queryByText(/Mecânica com Rede Homologada/i)).toBeNull();
  });
});
