# Especificação de Design: Marca T-Maint, Brand Kit & Landing Page High-End

**Data**: 14 de Setembro de 2026  
**Status**: Especificação Validada pelo Usuário  
**Autor**: Antigravity (Skill: Ron Draper & Brainstorming)  

---

## 1. Visão Geral & Posicionamento Estratégico

### 1.1 O "Kernel" da Marca (DNA Autêntico)
A **T-Maint** combina **mais de uma década de experiência prática no setor metalmecânico e padrão de rigor técnico da WEG** em manutenção eletroeletrônica de máquinas CNC com uma **plataforma SaaS moderna** desenvolvida para eliminar o caos operacional de equipes de assistência técnica e indústrias.

### 1.2 Os Dois Pilares Comerciais ("Dual-Engine")
1. **Serviços Técnicos Especializados de Campo**:
   - Diagnósticos elétricos e eletrônicos avançados em tornos, fresadoras e centros de usinagem CNC.
   - Atendimento rápido a falhas críticas, alarmes de acionamento, sincronismo de eixos e circuitos de potência.
   - Manutenção preventiva programada e retrofitting elétrico.
   - **Ecossistema de Parceiros Homologados**: Soluções completas integrando mecânicos de usinagem e reparos de bancada em placas/servodrives.
2. **Plataforma Digital T-Maint OS (SaaS)**:
   - Sistema operacional de campo para técnicos e indústrias: laudos fotográficos com assinatura na tela, histórico de intervenções por QR Code, cálculo automático de horas/deslocamento e Cockpit de telemetria.

---

## 2. Brand Identity System (Design Tokens)

### 2.1 Paleta de Cores (Direção High-End Minimalist Tech)
- **Background Principal**: `Slate 950` (`#030712`) / `Dark Matrix` (`#090d16`).
- **Cards & Superfícies**: `Slate 900/80` (`#0f172a`) com efeito `backdrop-blur-md` e bordas ultrafinas `Slate 800/80`.
- **Cores de Ação e Destaque**:
  - **Ciano Laser / CNC Pulse** (`#06b6d4` / `#0891b2`): Cor primária de precisão e tecnologia digital.
  - **Âmbar Industrial / Forja** (`#f59e0b` / `#d97706`): Cor secundária para alertas elétricos, estados de atenção e botões de ação tátil.
  - **Verde Operacional** (`#10b981`): Máquina operando, OS concluída, SLA aprovado.
- **Tipografia**:
  - Títulos e interface: `Geist Sans` / `Inter` (geométrica e limpa).
  - Telemetria, números de OS, moedas e horas: `Geist Mono` / `JetBrains Mono` (alta precisão).

---

## 3. Arquitetura da Landing Page de Alta Conversão

### 3.1 Seção 1: Header & Hero Section
- **Badge Superior**: `[ EXPERIÊNCIA FORJADA NO CHÃO DE FÁBRICA • PADRÃO WEG CNC ]`
- **Headline**: *Manutenção Eletroeletrônica CNC & Gestão Inteligente de Ativos Industriais.*
- **Subheadline**: *Diagnóstico elétrico avançado em campo para conter falhas críticas e o software definitivo para transformar relatórios de papel em laudos digitais instantâneos.*
- **CTAs Primários**:
  - `[Agendar Diagnóstico em Campo]` (WhatsApp / Contato direto).
  - `[Experimentar o Software]` (Acesso à plataforma).
- **Preview Visual Hero**: Mockup flutuante de alta resolução do **Cockpit T-Maint** em tela escura com brilho sutil ciano.

### 3.2 Seção 2: O Custo do Caos vs. O Poder do T-Maint (Antes x Depois)
- Tabela interativa ou cards comparativos lado a lado:
  - **Sem o T-Maint**: Bloquinhos de papel manchados de graxa, relatórios atrasados, horas de viagem contestadas pelo cliente, máquina quebra de novo e ninguém sabe o que foi feito no mês passado.
  - **Com o T-Maint**: Laudo técnico gerado com fotos e assinatura na tela antes do técnico sair da fábrica, PDF emitido com 1 clique, histórico completo por QR Code colado no painel da máquina.

### 3.3 Seção 3: O Software por Dentro (Showcase Gerador de Desejo)
- Demonstração visual dos módulos que encantam os clientes:
  1. **Cockpit Operacional**: Gráficos de horas, MTTR e faturamento.
  2. **Emissão de Laudo Instantâneo**: Exibição do relatório profissional gerado com logo da empresa contratante.
  3. **Portal do Cliente B2B**: O cliente da assistência acessa sua própria área para ver laudos sem precisar ligar.
  4. **Controle Financeiro & Orçamentos**: Conversão de orçamento aprovado em Ordem de Serviço com 1 clique.

### 3.4 Seção 4: Serviços Técnicos em Campo & Ecossistema Especializado
- Cards detalhados das competências de campo de João Batista Tomaselli:
  - *Diagnóstico Eletroeletrônico CNC*: Falhas de acionamento, queima de componentes periféricos, sensores, encoders e fontes.
  - *Retrofitting & Modernização*: Parametrização de drives e readequação de painéis elétricos.
  - *Ecossistema de Parceiros*: Parceria com especialistas para conserto de placas eletrônicas e mecânica pesada de usinagem.

### 3.5 Seção 5: Autoridade & Prova de Confiabilidade
- Destaque para a trajetória técnica:
  - Formação em Mecatrônica.
  - Quase 7 anos no parque fabril de CNCs da multinacional WEG.
  - Atuação direta na redução de MTTR e aumento de disponibilidade de máquinas operatrizes.

### 3.6 Seção 6: Planos e Conversão Final (Pricing & Contato)
- Tabela transparente de planos do SaaS (Básico, Pro, Elite, Elite Pro).
- Formulário/botão direto para solicitação de atendimento técnico em Jaraguá do Sul e região.

---

## 4. Plano de Componentização e Reutilização (Sem Overengineering)

- Utilizar a base existente de componentes Radix/Tailwind (`src/components/ui/*`).
- Reutilizar `BorderBeam`, `Skeleton`, `Badge`, `Card`, `Button` e tokens CSS existentes.
- Criar componentes dedicados da Landing Page em `src/components/landing/*` mantendo a separação entre a área pública e o dashboard autenticado.
