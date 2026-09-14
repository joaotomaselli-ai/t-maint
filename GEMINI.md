# 📘 T-MAINT — Contexto do Projeto & Diretrizes de Desenvolvimento

Este documento estabelece o **padrão obrigatório de governança, ciclo de desenvolvimento e design engineering** para o repositório **T-Maint**. 

> **Atenção para Agentes e Desenvolvedores:** Qualquer IA ou engenheiro trabalhando neste projeto deve seguir rigorosamente o fluxo de **Issues**, **Branches**, **Pull Requests** e os **Padrões de Craft Visual** descritos abaixo.

---

## 🏗️ 1. Governança de Ciclo de Vida: Issues & Pull Requests

Todo trabalho no sistema deve ser rastreável e auditável através do GitHub.

### 1.1 Classificação Obrigatória de Tarefas (Issues)
Antes de iniciar qualquer código, verifique ou crie a **Issue correspondente no GitHub**, classificada em uma das categorias:
- 🟢 **`[Nova Função]` (Label: `Nova Função`):** Para novos recursos, componentes ou rotas no SaaS.
- 🔵 **`[Melhoria]` (Label: `Melhoria`):** Para refatorações, otimizações de performance, ajustes visuais ou melhorias de UX.
- 🔴 **`[Correção]` (Label: `Correção`):** Para resolução de bugs, discrepâncias de dados ou quebras de layout.

### 1.2 Estratégia de Branches
- `main`: Branch de produção protegida. **Nunca faça commits diretos na `main`**.
- `feat/<nome-curto>`: Para novas funcionalidades.
- `fix/<nome-curto>`: Para correções de bugs.
- `refactor/<nome-curto>`: Para melhorias e polimento de UI.

---

## 🚀 2. Padrão Obrigatório de Pull Request (PR)

Toda entrega deve ser feita via Pull Request contendo **obrigatoriamente** as quatro seções abaixo:

```markdown
### 🔗 Issue Relacionada
Closes #<número_da_issue> (ou Ref #<número_da_issue>)

### 📝 O que mudou?
- Explicação clara e detalhada das mudanças feitas no código.
- Arquivos novos, modificados ou removidos.
- Motivação técnica e arquitetural da decisão.

### 🧪 Como foi validado?
- Comandos executados para verificação (ex: `npm run build`, testes unitários).
- Evidências de comportamento correto em tela (mobile e desktop).
- Confirmação de integridade com o banco de dados Supabase.

### ⚠️ Riscos, Limitações e Próximos Passos
- Riscos potenciais identificados ou dependências externas.
- Limitações conhecidas da solução atual.
- Próximos passos e melhorias futuras recomendadas.
```

---

## 🎨 3. Padrões de Design Engineering & Interface (Emil Kowalski Craft)

O T-Maint adota a filosofia de **Design Engineering Industrial de Alta Precisão**:

1. **Paleta Industrial Cockpit:**
   - Backgrounds: Dark `#0B0F17` / Cards `#131A26` / Bordas `#1F293D`.
   - Acentos: Cyber Teal `#00F5D4`, Cyan `#38BDF8`, Amber `#F59E0B`, Red `#EF4444`.
   - Suporte completo a **Light Mode** para legibilidade em campo sob sol forte.

2. **Física e Feedback Tátil em Botões:**
   - Todo botão e elemento acionável deve ter micro-interação tátil: `active:scale-[0.97]` com transição rápida de 120ms (`var(--ease-out)`).
   - O usuário deve sentir instantaneamente que o clique foi registrado pelo sistema.

3. **Curvas de Easing Cúbicas (Zero Easing Genérico):**
   - Entrada rápida e suave: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`.
   - Gavetas e Sheets: `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`.
   - **Proibido usar `ease-in`** em dropdowns ou popovers (pois causa sensação de lentidão).
   - **Proibido animar a partir de `scale(0)`** (use `scale(0.95)` + `opacity`).

4. **Integridade de Dados (Zero Mocks em Produção):**
   - Todos os gráficos, contadores e tabelas devem estar conectados a hooks dinâmicos (`useReports`, `useAllSessions`, `useClients`, etc.) do Supabase.
   - Sempre forneça estados vazios (*empty states*) limpos e explicativos quando não houver registros.

5. **Acessibilidade:**
   - Respeite `@media (prefers-reduced-motion: reduce)` desativando animações supérfluas para usuários sensíveis a movimento.

---

## 🛠️ 4. Comandos de Verificação

Antes de abrir qualquer Pull Request, certifique-se de que o build compila com 0 erros:
```bash
npm run build
```


## 🛡️ Padrão de Qualidade & CI/CD (Obrigatório para Todos os Agentes)

Antes de qualquer alteração ser mesclada na branch `main`, ela deve passar pelos seguintes critérios de integridade:

1. **Esteira de CI/CD (`.github/workflows/ci.yml`)**:
   - `npm run test` (Vitest): Todos os testes unitários e de integração devem passar.
   - `npx tsc --noEmit`: Zero erros de tipagem TypeScript.
   - `npm run lint`: Conformidade de código e formatação.
   - `npm run build`: Validação de build do Vite / TanStack Start.

2. **Observabilidade & Tratamento de Erros (`src/lib/observability.ts`)**:
   - Todas as capturas de exceção críticas devem registrar contexto via `telemetry.captureException(error)`.
   - Fallback resiliente para operação local sem travamento.

3. **Segurança & Rate Limit (`src/lib/rate-limit.ts`)**:
   - Ações de mutação e envios de formulário com risco de flood devem utilizar `checkRateLimit` ou `withRateLimit`.

4. **Conformidade Jurídica (LGPD)**:
   - Rotas públicas de compliance: `/termos` (Termos de Uso) e `/privacidade` (Política de Privacidade LGPD).

5. **Governança Git & Pull Requests**:
   - Todo trabalho deve ter uma **Issue** categorizada como `[Nova Função]`, `[Melhoria]` ou `[Correção]`.
   - Criar branch de feature (`feat/...` ou `fix/...`).
   - Abrir **Pull Request** contendo as 4 seções obrigatórias:
     1. Issue Relacionada
     2. O que mudou
     3. Como foi validado
     4. Riscos, Limitações e Próximos Passos.
