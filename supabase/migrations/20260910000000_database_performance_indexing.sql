-- ==============================================================================
-- 🚀 MIGRATION: OTIMIZAÇÃO DE ÍNDICES E PERFORMANCE DO BANCO DE DADOS (T-MAINT)
-- ==============================================================================

-- 1. Service Reports (Ordens de Serviço - Tabela Principal de Atendimentos)
-- Otimiza consultas filtradas por empresa, ordenadas por data descrescente e por cliente
CREATE INDEX IF NOT EXISTS idx_service_reports_company_date
  ON public.service_reports (company_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_service_reports_client_id
  ON public.service_reports (client_id);

CREATE INDEX IF NOT EXISTS idx_service_reports_user_id
  ON public.service_reports (user_id);

CREATE INDEX IF NOT EXISTS idx_service_reports_company_type
  ON public.service_reports (company_id, type);

-- 2. Service Sessions (Sessões / Apontamentos por Ordem de Serviço)
-- Otimiza o carregamento de todas as sessões vinculadas a uma OS
CREATE INDEX IF NOT EXISTS idx_service_sessions_activity_id
  ON public.service_sessions (activity_id);

CREATE INDEX IF NOT EXISTS idx_service_sessions_company_id
  ON public.service_sessions (company_id);

CREATE INDEX IF NOT EXISTS idx_service_sessions_technician_id
  ON public.service_sessions (technician_id);

CREATE INDEX IF NOT EXISTS idx_service_sessions_date
  ON public.service_sessions (date DESC);

-- 3. Activity Technicians (Técnicos vinculados a cada OS)
CREATE INDEX IF NOT EXISTS idx_activity_technicians_activity_id
  ON public.activity_technicians (activity_id);

CREATE INDEX IF NOT EXISTS idx_activity_technicians_technician_id
  ON public.activity_technicians (technician_id);

CREATE INDEX IF NOT EXISTS idx_activity_technicians_company_id
  ON public.activity_technicians (company_id);

-- 4. Activity Attachments (Fotos / Evidências antes e depois)
CREATE INDEX IF NOT EXISTS idx_activity_attachments_activity_id
  ON public.activity_attachments (activity_id);

CREATE INDEX IF NOT EXISTS idx_activity_attachments_company_id
  ON public.activity_attachments (company_id);

-- 5. User Roles (RBAC e Resolução de Multi-Tenant - Alta Frequência)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id
  ON public.user_roles (user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_company_role
  ON public.user_roles (company_id, role);

CREATE INDEX IF NOT EXISTS idx_user_roles_username
  ON public.user_roles (username) WHERE username IS NOT NULL;

-- 6. Clients (Clientes)
CREATE INDEX IF NOT EXISTS idx_clients_company_name
  ON public.clients (company_id, name);

CREATE INDEX IF NOT EXISTS idx_clients_user_id
  ON public.clients (user_id);

-- 7. Technicians (Técnicos)
CREATE INDEX IF NOT EXISTS idx_technicians_company_name
  ON public.technicians (company_id, name);

CREATE INDEX IF NOT EXISTS idx_technicians_user_id
  ON public.technicians (user_id);

-- 8. Financial Control (Controle Financeiro de Pagamentos e Recebimentos)
CREATE INDEX IF NOT EXISTS idx_client_payments_activity_id
  ON public.client_payments (activity_id);

CREATE INDEX IF NOT EXISTS idx_client_payments_company_id
  ON public.client_payments (company_id);

CREATE INDEX IF NOT EXISTS idx_technician_payments_activity_id
  ON public.technician_payments (activity_id);

CREATE INDEX IF NOT EXISTS idx_technician_payments_technician_id
  ON public.technician_payments (technician_id);

CREATE INDEX IF NOT EXISTS idx_technician_payments_company_id
  ON public.technician_payments (company_id);

-- 10. Inventory & Stock Movements (Catálogo de Peças e Movimentações de Estoque)
CREATE INDEX IF NOT EXISTS idx_inventory_items_company_name
  ON public.inventory_items (company_id, name);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_item_date
  ON public.inventory_movements (item_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_company_id
  ON public.inventory_movements (company_id);

-- 11. Commercial Quotes (Orçamentos e Propostas Comerciais)
CREATE INDEX IF NOT EXISTS idx_commercial_quotes_company_date
  ON public.commercial_quotes (company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_commercial_quotes_client_id
  ON public.commercial_quotes (client_id);

CREATE INDEX IF NOT EXISTS idx_commercial_quotes_status
  ON public.commercial_quotes (status);

-- 12. Agenda Events & Participants (Agendamentos e Calendário de Serviços)
CREATE INDEX IF NOT EXISTS idx_agenda_events_company_date
  ON public.agenda_events (company_id, start_date);

CREATE INDEX IF NOT EXISTS idx_agenda_event_participants_user
  ON public.agenda_event_participants (user_id);

-- 13. Allowed Emails (Lista de Acesso Permitido)
CREATE INDEX IF NOT EXISTS idx_allowed_emails_company_id
  ON public.allowed_emails (company_id);
