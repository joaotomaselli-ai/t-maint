# Especificação Técnica & Design: Reposicionamento da Landing Page T-MAINT (SaaS CMMS & Serviços CNC)

- **Data**: 2026-09-21
- **Status**: Aprovado
- **Autor**: Antigravity / João Tomaselli
- **Escopo**: Reposicionamento da Landing Page para SaaS 100% focado em Gestão de Manutenção (CMMS) e criação de página desacoplada de Serviços CNC em Campo (`/servicos-cnc`).

---

## 1. Visão Geral & Problema de Negócio

### 1.1 Contexto e Diagnóstico
Atualmente, o domínio principal `t-maint.com.br` apresentava uma mensagem mista entre dois modelos de negócio distintos:
1. **Prestação de Serviços Técnicos Locais de Manutenção em Campo para Máquinas CNC** (atendimento regional).
2. **Plataforma SaaS de Gestão de Manutenção e Ordens de Serviço (CMMS)** (produto escalável nacionalmente).

Essa divisão de mensagens causava atrito na conversão de novos clientes SaaS (dúvidas se o T-Maint era uma assistência concorrente ou um software) e prejudicava o ranqueamento orgânico no Google (SEO), dificultando a classificação algorítmica para buscas por sistemas CMMS.

### 1.2 Solução Estratégica
1. **Página Principal (`/landing` e `/`)**: Focada 100% no **Software T-MAINT Industrial (SaaS CMMS)**, com copy cirúrgica para prestadores de serviços, assistências e indústrias, transformando a vivência técnica do fundador em **autoridade do produto**.
2. **Página Especializada de Serviços (`/servicos-cnc`)**: Rota dedicada para atendimento técnico presencial de máquinas CNC, diagnóstico elétrico e retrofitting com rede de parceiros homologados.
3. **Preservação Visual Rigorosa**: Manutenção de 100% da identidade visual de engenharia (*Dark Slate 950, Laser Cyan #06b6d4, Cyber Teal #00f5d4, Industrial Amber #f59e0b, BorderBeam, ShimmerButtons e tipografia Geist/Mono*).

---

## 2. Arquitetura de Informação & Rotas

```
t-maint.com.br
├── / (Home / Landing Principal SaaS CMMS)
├── /landing (Landing Page Completa do Software)
├── /servicos-cnc (Nova Rota: Serviços Especializados em Campo CNC)
├── /m/$machineId (Prontuário Público da Máquina via QR Tag)
├── /login (Acesso ao Cockpit com reconhecimento de parâmetros ?client=)
└── /cockpit, /clientes, /atividades... (Painéis Operacionais Internos)
```

---

## 3. Especificação das Seções da Landing Page SaaS (`/landing`)

### 3.1 Hero Section
- **Headline**: "O Software de Gestão de Manutenção Criado para o Chão de Fábrica e Serviços Técnicos"
- **Subtítulo**: "Elimine o papel rasurado, os apontamentos perdidos no WhatsApp e a conferência manual de horas. O T-Maint centraliza ordens de serviço digitais, laudos com assinatura na tela, controle exato de KM e histórico completo do equipamento via QR Code."
- **Badges de Autoridade**:
  - "SOFTWARE CMMS & GESTÃO DE CAMPO INDUSTRIAL"
  - "Concebido por especialistas com vivência em manutenção industrial WEG"
  - "Dados 100% isolados e seguros em nuvem (LGPD & RLS)"
  - "Opera diretamente pelo navegador no celular ou tablet, sem travar o técnico"
- **CTAs**:
  - Primário: "Iniciar Demonstração Gratuita" (direciona para o WhatsApp com mensagem comercial estruturada).
  - Secundário: "Ver Demonstração Prática" (scroll suave para a seção de módulos).
- **Elemento Visual**: Simulador interativo do Cockpit Operacional com feixe laser (*BorderBeam*).

### 3.2 O Problema Real (Antes vs. Depois / Agitação da Dor)
- **Título**: "O problema da manutenção não é a falta de esforço. É a falta de visibilidade."
- **4 Perguntas Críticas**:
  1. O que está aberto agora e qual é a prioridade real?
  2. Quem é o técnico responsável por cada máquina?
  3. O que foi efetivamente executado no cliente?
  4. Quanto deve ser faturado ou pago sem erros de cálculo?
- **Tabela Comparativa Interativa**:
  - *Pranchetas e Papéis Rasurados* ➔ *O.S. 100% Digital com Assinatura na Tela*
  - *Horas e KM Não Auditáveis* ➔ *Apontamento Rastreável com Cronômetro e KM Automático*
  - *Fotos Perdidas no WhatsApp* ➔ *Histórico Consolidado no Prontuário do Equipamento*
  - *Fechamento Financeiro Lento* ➔ *Margem Protegida (Deslocamento, Peças e Horas Apuradas no Encerramento)*

### 3.3 Recursos e Módulos do Sistema
1. **Cockpit de Ordens de Serviço & Fila Inteligente**: Gestão unificada por cores de criticidade (Urgente, Alta, Normal, Baixa) com proteção de SLA.
2. **Apontamento de Campo (Horas, KM e Deslocamento)**: Registro rápido de horas normais, extras e quilometragem para reembolso e faturamento.
3. **Machine QR Tag & QR Tag do Cliente**: Prontuário físico no painel da máquina sem necessidade de instalar aplicativos.
4. **Controle de Insumos com Baixa Automática de Estoque**: Abate automático no almoxarifado e apuração do custo de materiais.
5. **Portal B2B do Cliente & Prontidão para Auditorias ISO**: Área exclusiva para o cliente consultar histórico e emitir laudos técnicos.

### 3.4 Proposta de Valor Executiva & Segurança Enterprise
- **Pilares de Negócio**: Velocidade Operacional, Margem Financeira Blindada e Confiança Institucional.
- **Segurança**: Row Level Security (RLS) por empresa, Criptografia TLS 1.3 / AES-256 e Controle de Níveis de Acesso (RBAC).

### 3.5 Autoridade do Fundador (Engenharia de Chão de Fábrica)
- Storytelling técnico: A experiência de 7 anos na multinacional WEG e vivência em campo com máquinas CNC serviram de base para criar um software com vocabulário nativo e robustez industrial.

### 3.6 Planos & Precificação Transparente
- **Básico (R$ 197/mês)**: Inclui até 2 técnicos, emissão ilimitada de OS e laudos em PDF, apontamento em campo e orçamentos no WhatsApp.
- **Pro Industrial (R$ 397/mês - Mais Recomendado)**: Todos os recursos do Básico + Gestão de Estoque com baixa na OS, Etiquetas Machine QR Tag, Portal B2B do Cliente e conformidade ISO.
- **Elite Enterprise (Sob Consulta)**: Para frotas com 20+ usuários, implantação dedicada, suporte VIP e integrações operacionais.
- Todos os botões vinculados ao WhatsApp com mensagens parametrizadas por plano.

### 3.7 FAQ Técnico (Otimizado para Schema FAQPage)
- Perguntas frequentes sobre PWA sem app pesado, leitura de QR Code em painéis, laudos em PDF sem internet e cálculo automático de KM.

### 3.8 Rodapé & Navegação
- Link de navegação no header: *"Atendimento CNC em Campo →"* apontando para `/servicos-cnc`.
- Rodapé institucional com links de governança (Termos, Privacidade e Serviços CNC).

---

## 4. Especificação da Página Dedicada de Serviços CNC (`/servicos-cnc`)

- **Objetivo**: Captar e direcionar demandas industriais de manutenção presencial para máquinas CNC e convencionais.
- **Estrutura**:
  1. **Header Especializado**: Título *"Engenharia e Manutenção Especializada em Máquinas CNC em Campo"*.
  2. **Especialidades Técnicas**: Diagnóstico elétrico/eletrônico, corretiva de emergência, plano de preventiva e retrofitting.
  3. **Matriz de Comandos**: Fanuc, Siemens, Okuma, Romi, Yaskawa, Mitsubishi, Fagor.
  4. **Rede de Parceiros Homologados**: Destaque para parcerias com mecânicos especializados (fusos, barramentos, guias) e laboratório de bancada para reparo de servoacionamentos e placas eletrônicas.
  5. **CTA de Emergência**: Botão WhatsApp para atendimento urgente de máquina parada (*"Acionar Chamado de Emergência CNC"*).

---

## 5. Otimização de SEO & Meta Tags

- **Title**: `T-Maint | Software de Gestão de Manutenção e Ordens de Serviço (CMMS)`
- **Description**: `Software de gestão de manutenção e ordem de serviço digital. Controle horas técnicas, cálculo de KM, estoque e histórico por QR Code. Teste o T-Maint.`
- **Schema.org**: Inclusão de JSON-LD com tipo `SoftwareApplication` (SaaS, BusinessApplication) e `FAQPage`.

---

## 6. Plano de Verificação & Critérios de Aceite

1. **Testes Unitários**: Atualizar suítes de testes em `LandingComponents.test.tsx` para refletir a nova copy e módulos.
2. **Integridade de Tipagem**: `npx tsc --noEmit` com 0 erros.
3. **Linter & Padrões de Código**: `npm run lint` com 0 erros.
4. **Compilação de Produção**: `npm run build` executado com sucesso.
5. **Governança Git**: Submissão exclusiva via Pull Request no GitHub para revisão e aprovação do usuário.
