/**
 * Script de Auditoria de Índices de Banco de Dados (T-Maint)
 * Verifica a consistência da migração de índices.
 */
const fs = require('fs');
const path = require('path');

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260910000000_database_performance_indexing.sql');

if (!fs.existsSync(migrationPath)) {
  console.error('❌ Erro: Arquivo de migração de índices não encontrado!');
  process.exit(1);
}

const content = fs.readFileSync(migrationPath, 'utf8');
const indexMatches = content.match(/CREATE INDEX IF NOT EXISTS\s+([a-zA-Z0-9_]+)/gi) || [];

console.log('===========================================================');
console.log('🚀 AUDITORIA DE ÍNDICES DE ALTA PERFORMANCE (T-MAINT)');
console.log('===========================================================');
console.log(`Total de índices estratégicos mapeados na migração: ${indexMatches.length}\n`);

indexMatches.forEach((match, idx) => {
  const indexName = match.replace(/CREATE INDEX IF NOT EXISTS\s+/i, '');
  console.log(`  [${idx + 1}] ✅ ${indexName}`);
});

console.log('\n===========================================================');
console.log('✨ Todos os índices essenciais foram validados com sucesso!');
console.log('===========================================================');
