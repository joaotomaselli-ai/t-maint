## O que vou implementar

Hoje cada Ordem de Serviço (OS) guarda **um único conjunto** de horários (deslocamento ida, serviço, volta), **um único KM**, **um único técnico** (na corretiva) e descrições únicas. Quando o atendimento dura vários dias ou envolve mais técnicos em dias diferentes, não há como continuar registrando na mesma OS.

A proposta é transformar cada OS em um "guarda-chuva" que contém **uma ou mais sessões de trabalho** (uma por dia / por técnico / por visita), mantendo dados gerais (cliente, máquina, número da OS, tipo, problema relatado) no nível da OS.

### 1. Nova estrutura de dados

Criar tabela `service_sessions` (uma linha por dia/visita trabalhada):
- `activity_id` → vincula à OS
- `date` (data da sessão)
- `technician_id` (técnico responsável daquela sessão; cadastrado)
- `travel_out_start/end`, `service_start/end`, `travel_back_start/end`
- `km`
- `overtime_weekday_hours`, `overtime_weekend_hours`
- `activities_done` (texto: o que foi feito naquele dia)
- `observation` (opcional)

A OS (`service_reports`) continua guardando:
- número, cliente, máquina, tipo, solicitante, **descrição do problema** (corretiva) ou **descrição mecânica/elétrica** (preventiva), resumo geral, requisições para troca futura, status.
- Os anexos antes/depois da preventiva permanecem na OS.

Os campos antigos de horários/KM/técnico em `service_reports` ficam como **referência da primeira sessão** (compatibilidade com OS já criadas), mas a UI passa a operar exclusivamente via `service_sessions`. Na migração, eu copio cada OS atual para 1 linha em `service_sessions`.

### 2. Mudanças na tela de Atividades

Na edição da OS aparece um novo bloco **"Sessões de trabalho"** com:
- Lista das sessões já registradas (data, técnico, horas totais, KM, valor).
- Botão **"+ Adicionar sessão"** → abre formulário com data, técnico (lista de cadastrados), horários, KM, horas extras, atividades realizadas, observação.
- Cada sessão pode ser editada ou excluída.

Para **preventiva**, cada sessão também aceita escolher 1 técnico; os 4 técnicos por OS continuam permitidos via múltiplas sessões.

Também adiciono campo livre **"Atividades acumuladas"** (texto cronológico) no nível da OS — preenchido automaticamente concatenando as atividades de cada sessão, com data como cabeçalho, e editável manualmente.

### 3. Mudanças nos relatórios PDF

Os PDFs (corretiva e preventiva operacional) passam a:
- Listar **todas as sessões** em formato de tabela: Data | Técnico | Deslocamento | Serviço | Volta | KM | Horas extras.
- Mostrar **somatório geral** (total de horas, total KM, total a cobrar do cliente, total a pagar por técnico — agrupado por técnico).
- Seção "Atividades realizadas" com o histórico cronológico de cada sessão.
- O PDF informativo da preventiva mantém o foco em fotos/descrições, mas inclui no rodapé as datas das visitas.

### 4. Arquivos afetados

- `supabase/migrations/<novo>.sql` — tabela `service_sessions` + RLS + cópia inicial das OS existentes.
- `src/lib/api.ts` — tipo `ServiceSession`, CRUD (`listSessions`, `createSession`, `updateSession`, `deleteSession`), recálculo de totais por OS somando sessões.
- `src/routes/atividades.tsx` — novo bloco de sessões com formulário inline, edição e exclusão.
- `src/lib/pdf.ts` — geração reescrita para iterar sessões e agregar por técnico.
- `src/routes/relatorios.tsx` — apuração mensal soma sessões.

### Detalhes técnicos

- Compatibilidade: OS antigas ganham 1 sessão automaticamente na migração; nada se perde.
- Totais financeiros do cliente: soma horas×tarifa do cliente + km×tarifa do cliente por sessão.
- Totais do técnico: agrupados por `technician_id` somando todas as sessões da OS.
- Relatório mensal: itera sessões no período (não mais OS), evitando contar duas vezes OS multi-mês.

Posso seguir?