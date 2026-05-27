# Sistema Multi-Empresa com Controle de Acesso

## Visão geral

Transformar o T-Maint em plataforma multi-tenant onde:

- **Master** (`joaotomaselli@gmail.com`, login alternativo por usuário `joaotomaselli` + senha `John2662`) é o único que cria empresas/admins.
- **Admin** é o dono de uma empresa, gerencia clientes/técnicos/OS dessa empresa e pode criar sub-usuários internos.
- **Usuário** (sub-usuário) opera dentro da empresa do seu admin, compartilhando todos os dados da empresa.
- Cadastro público (aba "Criar conta") é removido.
- Login com Google só funciona para e-mails previamente autorizados pelo master ou por um admin.

## O que será feito

### 1. Banco de dados (migração)

Novas tabelas:
- `companies` — empresas cadastradas (nome, dono).
- `app_role` enum: `master`, `admin`, `user`.
- `user_roles` — vincula `user_id` → `role` + `company_id` (nulo p/ master).
- `allowed_emails` — whitelist de e-mails autorizados a entrar (criado pelo master/admin), com `company_id` e `role` pré-definidos.

Função `has_role(uuid, app_role)` e `is_master(uuid)`, `current_company_id()` (SECURITY DEFINER) para evitar recursão em RLS.

Alterações em tabelas existentes (clients, technicians, service_reports, service_sessions, activity_attachments, activity_technicians, client_payments, technician_payments, profiles): adicionar coluna `company_id` (uuid).

**Migração de dados:** criar empresa "T-Maint" pertencente a `joaotomaselli@gmail.com`, marcar esse usuário como `master`, e popular `company_id` em todos os registros existentes com essa empresa (todos os dados atuais ficam visíveis para o master).

**RLS revisada** em todas as tabelas: master vê tudo; admin/user vêem apenas registros da própria `company_id`.

### 2. Autenticação

- Remover aba **"Criar conta"** da tela de login.
- Aceitar **usuário OU e-mail** no campo de login (se não tiver "@", busca o e-mail correspondente ao username via uma server function).
- Login com Google: após retorno do OAuth, validar se o e-mail está em `allowed_emails` ou já tem `user_roles`. Se não, fazer signOut e mostrar mensagem "E-mail não autorizado".
- Username `joaotomaselli` mapeado para `joaotomaselli@gmail.com` (master).
- Senha `John2662` precisa ser definida no Supabase Auth para essa conta (faço via migration `auth.users` update).

### 3. Telas novas

**Painel do Master** (rota `/master`, visível só para role=master no menu):
- Listar empresas + admin de cada uma.
- Criar nova empresa: nome + e-mail do admin + senha inicial.
- Autorizar e-mails adicionais para Google login (gera linha em `allowed_emails`).
- Suspender/excluir empresa.

**Aba "Usuários" em Configurações** (visível para role=admin):
- Listar sub-usuários da empresa.
- Criar sub-usuário (e-mail + senha) — entra como `user` na mesma `company_id`.
- Autorizar e-mails do Google para a empresa.
- Remover sub-usuário.

### 4. Server functions (TanStack)

Como criar usuários exige `service_role`, fica em `createServerFn` com `requireSupabaseAuth` + checagem de role:
- `resolveUsernameToEmail({ username })` — público, retorna e-mail se username existir (apenas para login).
- `createCompany({ name, adminEmail, adminPassword })` — só master.
- `createSubUser({ email, password })` — só admin.
- `authorizeEmail({ email, role })` — master ou admin.
- `listCompanies()`, `listSubUsers()`, `deleteUser({ id })`.

### 5. Frontend

- `AppShell`: esconder/exibir itens de menu por role; adicionar item "Master" quando role=master.
- `useAuth` exposto com `role` e `companyId` (lido de `user_roles`).
- Hooks de dados (`use-data.ts`) e `lib/api.ts`: queries continuam usando RLS, mas inserts passam a setar `company_id` (vindo do contexto) ao invés de só `user_id`.

## Detalhes técnicos

```
auth.users (Supabase)
   └─ user_roles (user_id, role, company_id)
            └─ companies (id, name, owner_user_id)
                    └─ clients, technicians, service_reports, ...
                          (todos com company_id)
```

RLS padrão para tabelas de dados:
```
USING (
  public.is_master(auth.uid())
  OR company_id = public.current_company_id()
)
```

Whitelist Google: no callback de login, server function `validateLoginEmail()` consulta `user_roles` + `allowed_emails`; se nenhum, desloga e retorna erro.

## Riscos / pontos de atenção

- **Quebra de dados atuais**: a migração move TODOS os registros para a empresa do master. Garantido que nada é perdido — apenas ganha `company_id`.
- **Username login**: implementado mapeando username→email no servidor; o login Supabase continua sendo por e-mail.
- **Senha master**: vou definir `John2662` para `joaotomaselli@gmail.com`. Isso sobrescreve qualquer senha anterior dessa conta (se houver).

## Fora de escopo neste passo

- Pagamento/cobrança por empresa.
- Limites de uso (quota de OS por empresa).
- Convite por e-mail com link mágico (admins criam direto com senha inicial; podem mudar depois).
