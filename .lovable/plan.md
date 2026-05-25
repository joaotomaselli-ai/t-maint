## Resumo do que vou implementar

### 1. Atividade Corretiva (sem mudanças no formulário)
- Mantém todos os campos atuais.
- Ao clicar em **"Gerar PDF"** na lista de atividades, abre um diálogo perguntando:
  - **"Incluir valores no relatório?"** com opções:
    - Completo (com valores cobrados do cliente e pagos ao técnico)
    - Sem valores (apenas informações técnicas)

### 2. Atividade Preventiva (nova experiência)
No formulário de nova/editar atividade, quando o tipo for **Preventiva**:
- Campo **"Descrição do serviço solicitado / problema"** → renomeia para **"Descrição de Atividades Mecânicas"**.
- Campo **"Resumo dos serviços executados"** → renomeia para **"Descrição das Atividades Elétricas"**.
- Abaixo de cada um desses campos, dois blocos de upload:
  - **Anexos — Antes**
  - **Anexos — Depois**
  (imagens; múltiplos arquivos por bloco)
- Campo **Técnico** vira **lista de até 4 técnicos** (todos selecionados de cadastros existentes; cada um com suas horas especiais semana/fim de semana próprias).
- Campo extra **"Requisições para troca futura"** (texto livre) — usado na versão informativa do PDF.

### 3. PDFs de Preventiva — dois formatos
Ao gerar PDF de uma atividade preventiva, abre diálogo com escolha:

- **Informativo (cliente)** — layout limpo e profissional:
  - Cabeçalho com logo/empresa, dados do cliente, máquina, data.
  - Seção "Atividades Mecânicas" com descrição + galeria de fotos antes/depois lado a lado.
  - Seção "Atividades Elétricas" com descrição + galeria de fotos antes/depois.
  - Seção "Requisições para troca futura" destacada.
  - Sem valores, sem apuração — foco em mostrar o valor da preventiva.
- **Operacional (formato atual)** — mantém o PDF como hoje:
  - Tabelas de horas, KM, apuração cliente + técnico.
  - Sem anexos (apenas referência a "X fotos anexadas").
  - Mesmo diálogo de "com/sem valores" da corretiva.

### 4. Banco de dados (Lovable Cloud)
Migração necessária:
- Nova tabela `activity_attachments` (activity_id, kind: `mechanical_before`/`mechanical_after`/`electrical_before`/`electrical_after`, storage_path, user_id) com RLS por usuário.
- Nova tabela `activity_technicians` (activity_id, technician_id, overtime_weekday_hours, overtime_weekend_hours, position 1–4) com RLS por usuário. Mantém colunas legadas em `service_reports` para compatibilidade com corretivas.
- Nova coluna `service_reports.future_replacements` (texto).
- Novo bucket de Storage **`activity-attachments`** (privado) com policies para o dono do `user_id`.

### 5. Arquivos a alterar
- `supabase/migrations/<novo>.sql` — tabelas, RLS, bucket, policies.
- `src/lib/api.ts` — tipos `ActivityAttachment`, `ActivityTechnician`, helpers de upload/listagem/salvamento, ajuste em `ServiceReport` (campo `futureReplacements`, suporte a múltiplos técnicos).
- `src/lib/pdf.ts` — novas funções `exportPreventiveInformativeReport` e `exportPreventiveOperationalReport`; flag `includeValues` em `exportSingleReport`.
- `src/routes/atividades.tsx` — formulário condicional por tipo, upload de anexos, lista de técnicos (até 4), diálogo de escolha de PDF.
- `src/routes/relatorios.tsx` — passar `includeValues` quando aplicável.

### Detalhes técnicos
- Uploads vão para `activity-attachments/{user_id}/{activity_id}/{kind}/{uuid}.jpg`.
- No PDF informativo, fotos são baixadas via signed URL (curta duração) e embutidas com `doc.addImage`. Para limitar tamanho, redimensiono client-side antes do upload (max 1600px).
- Tipo `corretiva` continua usando os campos atuais e a coluna `technician` legada; tipo `preventiva` usa a nova tabela `activity_technicians` (1 a 4 linhas).
- Apuração financeira para preventiva soma o "a pagar" de todos os técnicos vinculados.

Posso seguir com a implementação?