# Task 2 Report: Autoridade Técnica, Precificação, FAQ Integrado e Rodapé

- **Status**: DONE
- **Data**: 2026-09-21
- **Implementador**: Pricing & Authority Implementer Subagent

## Arquivos Atualizados
1. `src/components/landing/AuthoritySection.tsx`:
   - Reforçada a autoridade técnica de engenharia de chão de fábrica do fundador João Batista Tomaselli.
   - Inserido o destaque textual: *"A vivência de 7 anos em manutenção na multinacional WEG e em campo com máquinas CNC serviram de base para criar um software com vocabulário nativo de chão de fábrica e robustez industrial sem frescuras."*
   - Adicionados cards de qualificação para Mecatrônica, ~7 Anos WEG, Vocabulário Nativo e Robustez Sem Frescuras.
   - Atualizado o manifesto do fundador no card de assinatura com foco no software T-MAINT e eliminação de pranchetas.

2. `src/components/landing/PricingAndContactSection.tsx`:
   - Preservados com precisão os 3 cards transparentes de planos:
     - **Básico (R$ 197/mês)**: até 2 técnicos, laudos PDF ilimitados com assinatura na tela, apontamento de horas/KM e orçamentos no WhatsApp.
     - **Pro Industrial (R$ 397/mês - Mais Recomendado)**: BorderBeam laser, ShimmerButton, gestão de estoque com baixa na OS, Machine QR Tag e Portal B2B do cliente.
     - **Elite Enterprise (Sob Consulta)**: frotas com 20+ usuários, implantação dedicada e suporte VIP.
     - Todos os botões vinculados ao WhatsApp oficial com mensagem parametrizada por plano.
   - Adicionada a seção de **FAQ Técnico** integrada logo abaixo dos planos com as 4 perguntas críticas do PDF:
     1. PWA sem aplicativo pesado na loja.
     2. Funcionamento do Machine QR Tag nos painéis das máquinas sem login.
     3. Emissão de laudos PDF e assinatura touch no celular em locais sem sinal.
     4. Cálculo automático de KM e controle de deslocamento.

3. `src/components/landing/LandingFooter.tsx`:
   - Atualizados os links de governança corporativa: Termos de Uso (`/termos`) e Privacidade & LGPD (`/privacidade`).
   - Adicionado botão/link de destaque *"Atendimento Técnico CNC em Campo →"* apontando para a nova rota `/servicos-cnc` com badge de alto contraste.
   - Subtítulo atualizado para *"Software CMMS & Gestão de Manutenção Industrial"*.

4. `src/components/landing/LandingPage.tsx`:
   - Reestruturada a sequência de seções focada 100% no SaaS:
     1. `LandingNavbar`
     2. `HeroSection`
     3. `BeforeAfterSection`
     4. `SoftwareShowcaseSection`
     5. `MachineQRTeaserSection`
     6. `AuthoritySection`
     7. `PricingAndContactSection` (com FAQ integrado)
     8. `LandingFooter`
   - Removido o componente `FieldServicesSection` da Home principal (desacoplado para a rota `/servicos-cnc` na Task 3).
   - Botão flutuante do WhatsApp alinhado com a demonstração comercial do software T-MAINT.

5. `src/components/landing/__tests__/LandingComponents.test.tsx`:
   - Expandida a suíte de testes com 11 asserções cobrindo todos os novos requisitos:
     - Storytelling WEG e vocabulário nativo no `AuthoritySection`.
     - 3 planos e 4 perguntas técnicas do FAQ no `PricingAndContactSection`.
     - Links de governança e rota `/servicos-cnc` no `LandingFooter`.
     - Renderização completa da `LandingPage` e confirmação de ausência do `FieldServicesSection` na vitrine do SaaS.

## Verificação e Próximos Passos
- Script consolidado disponível em `scratch/apply_task2.cjs`.
- Todas as alterações seguem com rigor o design system Dark Slate 950 com acentos Cyber Teal e Laser Cyan.
