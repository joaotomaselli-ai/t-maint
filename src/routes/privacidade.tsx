import { createFileRoute, Link } from '@tanstack/react-router';
import { ShieldCheck, Lock, ArrowLeft, Database, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/privacidade')({
  component: PoliticaPrivacidadePage,
});

function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Política de Privacidade & Proteção de Dados (LGPD)</h1>
              <p className="text-xs text-slate-400">Em total conformidade com a Lei Federal nº 13.709/2018 (LGPD)</p>
            </div>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm" className="border-slate-800 hover:bg-slate-900 gap-2">
              <ArrowLeft className="h-4 w-4" /> Voltar ao Painel
            </Button>
          </Link>
        </div>

        <div className="grid gap-6">
          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-emerald-400 flex items-center gap-2">
                <Database className="h-4 w-4" /> 1. Dados Coletados e Finalidade do Tratamento
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 leading-relaxed space-y-2">
              <p>
                O T-Maint coleta apenas os dados estritamente necessários para a prestação dos serviços de gestão de manutenção:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                <li><strong>Dados de Usuários/Técnicos:</strong> Nome, e-mail corporativo, telefone e registros de presença/execução de OS;</li>
                <li><strong>Dados de Clientes e Frotas:</strong> Razão social, CNPJ, localização de equipamentos e histórico de intervenções mecânicas;</li>
                <li><strong>Dados de Telemetria e Auditoria:</strong> Logs de acesso, endereços IP e métricas de desempenho de sistema.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-emerald-400 flex items-center gap-2">
                <Lock className="h-4 w-4" /> 2. Armazenamento Seguro e Criptografia
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 leading-relaxed space-y-2">
              <p>
                Todos os dados em trânsito são protegidos com TLS 1.3 com criptografia de ponta a ponta. Os bancos de dados contam com <strong>Row Level Security (RLS)</strong> no Supabase, garantindo isolamento total de dados entre diferentes empresas contratantes (Multi-tenant).
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-emerald-400 flex items-center gap-2">
                <UserCheck className="h-4 w-4" /> 3. Direitos dos Titulares de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 leading-relaxed space-y-2">
              <p>
                Conforme previsto no Art. 18 da LGPD, os titulares de dados podem solicitar a qualquer momento a confirmação de tratamento, acesso aos dados, correção de inconsistências ou anonimização de registros diretamente ao encarregado de dados (DPO) através dos canais de suporte oficiais.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-xs text-slate-500 pt-6 border-t border-slate-800/60">
          Encarregado de Proteção de Dados (DPO): dpo@t-maint.com.br • T-Maint Software Industrial
        </div>
      </div>
    </div>
  );
}
