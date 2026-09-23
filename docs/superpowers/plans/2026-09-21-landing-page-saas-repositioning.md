# Landing Page SaaS Repositioning & CNC Service Route Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposicionar a Landing Page principal (`/landing` e `/`) como uma vitrine 100% focada no Software T-MAINT (SaaS CMMS), implementando a nova copy de alta conversão, e criar uma página dedicada para Serviços CNC em Campo (`/servicos-cnc`).

**Architecture:** A aplicação TanStack Router manterá as rotas `/` e `/landing` com componentes modulares em `src/components/landing/*` dedicados ao SaaS (Hero, BeforeAfter, SoftwareShowcase, Authority, Pricing, FAQ e Footer), enquanto uma nova rota `src/routes/servicos-cnc.tsx` atenderá exclusivamente clientes de manutenção física e industrial. Toda a estilização manterá rigorosamente o design system industrial Dark Slate 950 com acentos Cyber Teal e Laser Cyan.

**Tech Stack:** React 18, TanStack Router, Tailwind CSS, Lucide React, Vite, Vitest, TypeScript.

**Spec:** `docs/superpowers/specs/2026-09-21-landing-page-saas-repositioning-design.md`

## Global Constraints
- Preservar 100% das classes visuais, efeitos de feixe laser (`BorderBeam`), botões com brilho (`ShimmerButton`) e tipografia Geist/Mono.
- Todos os botões de CTA e planos devem direcionar para o WhatsApp oficial (`https://wa.me/5547988485668`) com mensagens comerciais pré-configuradas.
- Todas as alterações devem ser validadas por testes unitários (`vitest`), checagem de tipos (`tsc --noEmit`) e linter (`eslint`).
- A entrega final deve ser submetida exclusivamente via branch de feature e Pull Request no GitHub para aprovação do usuário antes do deploy em produção.

---

### Task 1: Componentes Principais da Landing Page SaaS (Hero, Navbar, BeforeAfter, Showcase)

**Files:**
- Modify: `src/components/landing/LandingNavbar.tsx`
- Modify: `src/components/landing/HeroSection.tsx`
- Modify: `src/components/landing/BeforeAfterSection.tsx`
- Modify: `src/components/landing/SoftwareShowcaseSection.tsx`
- Test: `src/components/landing/__tests__/LandingComponents.test.tsx`

**Interfaces:**
- Consumes: `useAuth` from `@/hooks/use-auth`, `BorderBeam`, `ShimmerButton`.
- Produces: Componentes de apresentação modular exportados para `LandingPage.tsx`.

- [ ] **Step 1: Atualizar testes para as novas mensagens e copy do SaaS**
  Atualizar `src/components/landing/__tests__/LandingComponents.test.tsx` validando títulos da nova copy: *"O Software de Gestão de Manutenção Criado para o Chão de Fábrica"*, comparativo Pranchetas vs Digital e link para `/servicos-cnc`.

- [ ] **Step 2: Executar teste para verificar falha esperada**
  Run: `npx vitest run src/components/landing/__tests__/LandingComponents.test.tsx`
  Expected: FAIL com diferenças textuais.

- [ ] **Step 3: Implementar nova copy no LandingNavbar, HeroSection, BeforeAfterSection e SoftwareShowcaseSection**
  - No `LandingNavbar.tsx`: Adicionar item de navegação *"Atendimento CNC em Campo →"* com link para `/servicos-cnc`.
  - No `HeroSection.tsx`: Inserir a headline do PDF: *"O Software de Gestão de Manutenção Criado para o Chão de Fábrica e Serviços Técnicos"*, badge de autoridade WEG e CTAs para o WhatsApp.
  - No `BeforeAfterSection.tsx`: Inserir os 4 comparativos reais (Pranchetas rasuradas vs OS Digital, Horas/KM não auditáveis vs Apontamento rastreável, Fotos perdidas no WhatsApp vs Histórico consolidado, Fechamento lento vs Margem protegida).
  - No `SoftwareShowcaseSection.tsx`: Atualizar os 5 módulos (Cockpit SLA, Apontamento de Campo Horas/KM, Machine QR Tag, Estoque com baixa automática, Portal B2B do cliente).

- [ ] **Step 4: Executar testes para verificar aprovação**
  Run: `npx vitest run src/components/landing/__tests__/LandingComponents.test.tsx`
  Expected: PASS.

---

### Task 2: Seções de Autoridade, Precificação, FAQ e Rodapé

**Files:**
- Modify: `src/components/landing/AuthoritySection.tsx`
- Modify: `src/components/landing/PricingAndContactSection.tsx`
- Modify: `src/components/landing/LandingFooter.tsx`
- Modify: `src/components/landing/LandingPage.tsx`

**Interfaces:**
- Consumes: Dados de planos (`src/lib/plans.ts`), links WhatsApp, componentes UI.
- Produces: Página de pouso completa e coesa (`LandingPage.tsx`).

- [ ] **Step 1: Atualizar AuthoritySection.tsx**
  Reforçar o storytelling do fundador: a vivência de 7 anos na multinacional WEG e em campo com máquinas CNC como base de engenharia para criar um software sem frescuras e à prova de falhas.

- [ ] **Step 2: Atualizar PricingAndContactSection.tsx com FAQ Integrado**
  - Manter os 3 cards transparentes de planos: Básico (R$ 197), Pro Industrial (R$ 397) e Elite Enterprise (Sob Consulta).
  - Inserir a seção de FAQ com as 4 perguntas técnicas do PDF (Sem app pesado / PWA, Leitura de QR Tag, Laudo em PDF offline, Cálculo de KM).

- [ ] **Step 3: Atualizar LandingFooter.tsx e LandingPage.tsx**
  - No rodapé: incluir links para Políticas de Privacidade, Termos de Uso e link de destaque para a nova página de Serviços CNC em Campo.
  - No `LandingPage.tsx`: remover `FieldServicesSection` da montagem da Home principal (pois será movida para rota própria).

- [ ] **Step 4: Executar testes de integração**
  Run: `npx vitest run`
  Expected: PASS.

---

### Task 3: Criação da Nova Rota Dedicada de Serviços CNC (`/servicos-cnc`)

**Files:**
- Create: `src/routes/servicos-cnc.tsx`
- Create: `src/components/services/FieldServicesPage.tsx`
- Create: `src/routes/__tests__/servicos-cnc.test.tsx`

**Interfaces:**
- Consumes: `LandingNavbar`, `LandingFooter`, componentes industriais.
- Produces: Rota pública de alta conversão para serviços presenciais de campo.

- [ ] **Step 1: Criar teste para a nova rota de serviços CNC**
  Criar `src/routes/__tests__/servicos-cnc.test.tsx` verificando renderização de título, matriz de fabricantes e botão de emergência no WhatsApp.

- [ ] **Step 2: Implementar FieldServicesPage.tsx e rota servicos-cnc.tsx**
  - Criar componente de apresentação rico em `src/components/services/FieldServicesPage.tsx` com diagnóstico elétrico, preventiva, corretiva, retrofitting, matriz de comandos (Fanuc, Siemens, Romi, Okuma, etc.), ecossistema de parceiros homologados e botão de chamado de emergência.
  - Criar rota `src/routes/servicos-cnc.tsx` conectada ao TanStack Router.

- [ ] **Step 3: Executar testes unitários da rota de serviços**
  Run: `npx vitest run src/routes/__tests__/servicos-cnc.test.tsx`
  Expected: PASS.

---

### Task 4: Metatags, Validação Completa de Tipos, Linter e Build

**Files:**
- Modify: `public/sitemap.xml`
- Modify: `src/routes/landing.tsx`
- Modify: `src/routes/servicos-cnc.tsx`

- [ ] **Step 1: Atualizar Sitemap e Metatags**
  - Adicionar `/servicos-cnc` no `public/sitemap.xml`.
  - Garantir tags de título, descrição e OpenGraph corretas em todas as rotas públicas.

- [ ] **Step 2: Executar TypeScript Typecheck**
  Run: `npx tsc --noEmit`
  Expected: 0 erros.

- [ ] **Step 3: Executar ESLint Linter**
  Run: `npm run lint`
  Expected: 0 erros.

- [ ] **Step 4: Executar Suíte Completa do Vitest**
  Run: `npx vitest run`
  Expected: Todos os testes passando (100% de sucesso).

- [ ] **Step 5: Validar Build de Produção**
  Run: `npm run build`
  Expected: Build concluído com sucesso.

---

### Task 5: Governança Git & Abertura de Pull Request no GitHub

**Files:**
- Git repository & GitHub API

- [ ] **Step 1: Criar Issue no GitHub**
  - Criar issue com classificação `[Melhoria] Reposicionamento da Landing Page para SaaS CMMS e Desacoplamento da Rota de Serviços CNC`.

- [ ] **Step 2: Criar branch de feature**
  - Criar e mudar para a branch `feat/saas-repositioning-and-cnc-service-route`.

- [ ] **Step 3: Commitar e realizar push**
  - Commitar todas as alterações com mensagem descritiva vinculada à issue.
  - Realizar o push para `origin feat/saas-repositioning-and-cnc-service-route`.

- [ ] **Step 4: Abrir Pull Request formal no GitHub**
  - Criar Pull Request com descrição completa para revisão e aprovação pelo usuário.
