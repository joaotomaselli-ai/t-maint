# Especificação de Design: Redesign Industrial Completo do Sistema T-MAINT

**Data:** 2026-09-12  
**Status:** Aprovado  
**Objetivo:** Elevar a identidade visual e experiência de usuário de todo o ecossistema interno (Tela de Login, Layout Principal, Sidebar, Dashboards e Módulos Operacionais) para o padrão moderno Industrial Cockpit já validado na Landing Page.

---

## 1. Visão Geral & Objetivos
O T-MAINT atende dois pilares centrais:
1. **Atendimento Técnico Especializado em Campo (CNC)**: Diagnóstico elétrico, mecânico e manutenção de tornos e centros de usinagem com parceiros homologados.
2. **SaaS de Gestão Inteligente de Manutenção**: Ordens de serviço digitais, apontamento georreferenciado de horas/KM, orçamentos automáticos via WhatsApp, estoque com QR Code e portal do cliente.

O objetivo deste projeto é eliminar o visual antigo e trazer a estética de **Telemetria / Industrial Cockpit** (#0B0F17, #131A26, #1F293D, #00F5D4 Cyber Teal) para dentro de todas as telas logadas e de acesso.

---

## 2. Design System & Tema
### 2.1 Paleta de Cores
- **Background Principal:** `#0B0F17` (Navy Grafite Profundo)
- **Cards e Superfícies:** `#131A26` (Card Industrial)
- **Bordas e Divisores:** `#1F293D`
- **Acentos e Ações:** `#00F5D4` (Cyber Teal) e `#38BDF8` (Ciano)
- **Status Operacionais:**
  - Sucesso / Concluído: `#10B981` (Verde Esmeralda)
  - Alerta / Em Execução: `#F59E0B` (Âmbar)
  - Urgente / Falha: `#EF4444` (Vermelho Industrial)

### 2.2 Seletor de Tema (Dark / Light)
- Suporte a modo escuro (padrão) e modo claro de alto contraste (para visualização sob sol forte no chão de fábrica).
- Persistência da preferência em `localStorage`.

---

## 3. Tela de Login (Split Screen "Cockpit & Credenciais")
- **Layout Split Screen:**
  - **Coluna Esquerda (Showcase de Telemetria & Status)**:
    - Fundo com micro-grade dinâmica `NoiseGridBackground`.
    - Logo T-Maint com badge `INDUSTRIAL`.
    - Card de telemetria com contorno laser `BorderBeam` exibindo uptime e dados de atendimento.
  - **Coluna Direita (Acesso & Autenticação)**:
    - Card focado com campos estilizados e botão `ShimmerButton` variante `teal` com alto contraste.
    - Link rápido para suporte direto via WhatsApp.

---

## 4. Sidebar & Navegação Estruturada
- **Sidebar Retrátil**:
  - Destaque ativo em Cyber Teal (`#00F5D4`) com efeito glow suave.
  - Badges com contagem ao vivo de ordens pendentes.
  - Alternador Dark/Light e logout rápido no rodapé.
- **Header Superior Interno**:
  - Breadcrumb dinâmico de navegação.
  - Botão de ação rápida (*+ Nova O.S.*).
  - Indicador de status de conexão e perfil.

---

## 5. Dashboard Principal (Cockpit Executivo & Analytics)
- **Barra Superior de Telemetria (KPIs)**:
  - Total de Horas Técnicas no mês (com barra de progresso).
  - Faturamento / Receita de serviços.
  - KM Rodados pela equipe.
  - O.S. Pendentes vs. Finalizadas.
- **Seção de Visualizações Gráficas**:
  - Gráfico de linha/área com evolução de Horas & Ordens nos últimos meses.
  - Distribuição de atendimentos por cliente e tipo de máquina CNC.
- **Painel Operacional Duplo**:
  - Fila ativa de Ordens de Serviço com botões para PDF e WhatsApp.
  - Widget de Agenda de Preventivas e status dos técnicos em campo.

---

## 6. Padronização dos Módulos Internos
- **Atividades & O.S.** (`src/routes/atividades.tsx`): Tabelas com badges luminosos, busca rápida e ações diretas.
- **Orçamentos** (`src/routes/orcamentos.tsx`): Visual moderno com envio em 1 clique para o WhatsApp.
- **Estoque** (`src/routes/estoque.index.tsx`): Visualização de itens com suporte a QR Code.
- **Clientes** (`src/routes/clientes.tsx`): Perfil e histórico completo de máquinas.

---

## 7. Critérios de Aceite & Validação
1. Todos os componentes devem compilar com 0 erros de TypeScript (`npm run build`).
2. Total responsividade em telas mobile, tablets e monitores desktop.
3. Alto contraste em todos os botões e textos para perfeita legibilidade.
