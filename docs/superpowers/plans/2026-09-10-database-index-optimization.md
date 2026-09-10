# Database Index Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Otimizar a indexação do banco de dados PostgreSQL/Supabase do T-Maint através da criação de índices B-Tree estratégicos em todas as chaves estrangeiras (FKs), filtros de multi-tenant (`company_id`) e colunas de ordenação composta (`date DESC`, `created_at DESC`, `name ASC`).

**Architecture:** A abordagem utiliza migrações SQL idempotentes (`CREATE INDEX IF NOT EXISTS`) cobrindo as 12 tabelas críticas do sistema.

**Tech Stack:** PostgreSQL 15+ / Supabase, Node.js, SQL.

---

### Task 1: Criar a migração SQL de indexação de alta performance
**Files:**
- Create: `supabase/migrations/20260910000000_database_performance_indexing.sql`

- [ ] **Step 1: Escrever arquivo de migração SQL com índices para todas as tabelas**
- [ ] **Step 2: Validar sintaxe SQL e idempotência (`IF NOT EXISTS`)**

---

### Task 2: Script de verificação e auditoria de índices
**Files:**
- Create: `scripts/verify-indexes.cjs`

- [ ] **Step 1: Escrever script de auditoria que valida a presença de índices nas colunas críticas**
- [ ] **Step 2: Executar e validar saída do script**

---

### Task 3: Atualizar documentação e Walkthrough
**Files:**
- Modify: `walkthrough.md`

- [ ] **Step 1: Documentar os índices criados e os ganhos de performance esperados**
- [ ] **Step 2: Fornecer instruções para aplicação no Supabase SQL Editor**
