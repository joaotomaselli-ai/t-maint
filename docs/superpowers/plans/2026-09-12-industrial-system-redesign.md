# Redesign Industrial Completo do Sistema T-MAINT Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar todo o sistema interno (Tela de Login, Layout, Sidebar, Dashboards e Módulos) para o padrão Industrial Cockpit (#0B0F17, #131A26, #1F293D, #00F5D4 Cyber Teal), adicionando alternância Dark/Light e gráficos analíticos.

**Architecture:** Estabelecer tokens CSS unificados de alto contraste no tema industrial; implementar a tela de login Split Screen com telemetria; modernizar o Root Layout e Sidebar retrátil com indicadores luminosos; e reconstruir o Dashboard principal como um Cockpit Executivo completo com KPIs e gráficos.

**Tech Stack:** React 19, Tailwind CSS v4, TanStack Router & Start, Lucide Icons, Supabase Auth.

**Spec:** `docs/superpowers/specs/2026-09-12-industrial-system-redesign-design.md`

## Global Constraints
- Fundo padrão da aplicação: `#0B0F17` (Dark Industrial) com suporte a tema claro.
- Acentos: `#00F5D4` (Cyber Teal) e `#38BDF8` (Ciano).
- Superfícies: `#131A26` com bordas `#1F293D`.
- Todas as alterações devem compilar com 0 erros de TypeScript (`npm run build`).
- Todos os botões e textos devem manter 100% de contraste e legibilidade.

---

### Task 1: Tema & Suporte Dark/Light com Persistência

**Files:**
- Create: `src/hooks/use-theme.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Criar hook de tema `src/hooks/use-theme.ts`**
- [ ] **Step 2: Ajustar tokens em `src/styles.css` com variáveis CSS industriais**
- [ ] **Step 3: Testar e verificar compilação**

---

### Task 2: Nova Tela de Login (Split Screen Cockpit & Credenciais)

**Files:**
- Modify: `src/routes/login.tsx`

- [ ] **Step 1: Estruturar layout Split Screen (Showcase de Telemetria à esquerda + Card de acesso à direita)**
- [ ] **Step 2: Integrar `NoiseGridBackground`, `BorderBeam` e badge `INDUSTRIAL` na coluna de showcase**
- [ ] **Step 3: Implementar formulário de credenciais com `ShimmerButton` variante `teal`**
- [ ] **Step 4: Adicionar link direto de suporte técnico no WhatsApp**
- [ ] **Step 5: Testar fluxo de autenticação e feedback visual de login**

---

### Task 3: Sidebar Retrátil & App Shell Industrial

**Files:**
- Modify: `src/routes/__root.tsx` ou componentes de Sidebar/Navbar interna

- [ ] **Step 1: Aplicar paleta `#0B0F17` / `#131A26` e bordas `#1F293D` no container principal**
- [ ] **Step 2: Implementar estilo retrátil com ícones luminosos e badges dinâmicos de O.S. pendentes**
- [ ] **Step 3: Adicionar botão de alternância Dark/Light e logout rápido no rodapé da Sidebar**
- [ ] **Step 4: Garantir navegação responsiva perfeita em dispositivos móveis**

---

### Task 4: Dashboard Principal (Cockpit Executivo & Analytics)

**Files:**
- Modify: `src/routes/index.tsx`
- Create / Modify: Componentes de gráficos analíticos em `src/components/`

- [ ] **Step 1: Reestruturar a Barra de Telemetria (KPIs: Horas Técnicas, Faturamento, KM e O.S. Pendentes)**
- [ ] **Step 2: Integrar barra de Ações Rápidas (*+ Nova O.S.*, *+ Novo Orçamento*, *QR Code*)**
- [ ] **Step 3: Adicionar visualizações gráficas (evolução mensal de horas e distribuição de manutenções)**
- [ ] **Step 4: Aprimorar a Fila de Ordens de Serviço com botões diretos de PDF e WhatsApp**
- [ ] **Step 5: Testar filtros e alternância de modos de visualização**

---

### Task 5: Validação Final e Build de Produção

**Files:**
- Teste global: `npm run build`

- [ ] **Step 1: Executar `cmd.exe /c "npm run build"` e validar 0 erros**
- [ ] **Step 2: Testar visualmente todas as rotas (Login, Dashboard, Atividades, Orçamentos)**
- [ ] **Step 3: Apresentar o resultado final ao usuário**
