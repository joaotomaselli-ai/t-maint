import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { HeroSection } from '../HeroSection';
import { BeforeAfterSection } from '../BeforeAfterSection';
import { AuthoritySection } from '../AuthoritySection';
import { FieldServicesSection } from '../FieldServicesSection';
import { MachineQRTeaserSection } from '../MachineQRTeaserSection';
import { PricingAndContactSection } from '../PricingAndContactSection';
import { LandingFooter } from '../LandingFooter';

describe('Landing Page Components', () => {
  it('renders HeroSection with title and WEG expertise badge', () => {
    render(<HeroSection whatsappUrlService="https://wa.me/test" />);
    expect(screen.getByText(/EXPERTISE WEG/i)).toBeTruthy();
    expect(screen.getByText(/Manutenção Especializada CNC/i)).toBeTruthy();
    expect(screen.getByText(/Sistema Operacional de Gestão/i)).toBeTruthy();
  });

  it('renders AuthoritySection with founder mechatronics background', () => {
    render(<AuthoritySection />);
    const founderMatches = screen.getAllByText(/João Batista Tomaselli/i);
    expect(founderMatches.length).toBeGreaterThan(0);
    expect(screen.getByText(/Formação em Mecatrônica/i)).toBeTruthy();
    expect(screen.getByText(/~7 Anos Multinacional WEG/i)).toBeTruthy();
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

  it('renders PricingAndContactSection with SaaS plans', () => {
    render(
      <PricingAndContactSection
        whatsappUrlSoftware="https://wa.me/soft"
        whatsappUrlService="https://wa.me/serv"
      />
    );
    expect(screen.getByText(/Pro Industrial/i)).toBeTruthy();
    expect(screen.getByText(/R\$ 397/i)).toBeTruthy();
  });

  it('renders LandingFooter with legal terms links', () => {
    render(<LandingFooter whatsappUrlService="https://wa.me/serv" />);
    expect(screen.getByText(/Termos de Uso/i)).toBeTruthy();
    expect(screen.getByText(/Privacidade & LGPD/i)).toBeTruthy();
  });
});
