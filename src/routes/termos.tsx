import { createFileRoute, Link } from '@tanstack/react-router';
import { FileText, ArrowLeft, CheckCircle2, Lock, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/termos')({
  component: TermosDeUsoPage,
});

function TermosDeUsoPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Termos de Uso do T-Maint SaaS</h1>
              <p className="text-xs text-slate-400">Última atualização: Setembro de 2026 • Versão 2.4 Enterprise</p>
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
              <CardTitle className="text-base text-amber-400 flex items-center gap-2">
                <FileText className="h-4 w-4" /> 1. Objeto e Escopo da Licença
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 leading-relaxed space-y-2">
              <p>
                O <strong>T-Maint</strong> é uma plataforma SaaS de gestão de manutenção industrial, ordens de serviço, telemetria de frotas e automação de orçamentos técnicos. O acesso é concedido sob regime de licença de uso limitada, não exclusiva e intransferível.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-amber-400 flex items-center gap-2">
                <Lock className="h-4 w-4" /> 2. Segurança, Credenciais e Responsabilidades
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 leading-relaxed space-y-2">
              <p>
                A empresa contratante é a única responsável pela gestão das credenciais dos seus técnicos e gestores. É proibido o compartilhamento de logins mestres e a execução de testes de penetração não autorizados.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-amber-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> 3. Disponibilidade de Serviço (SLA) & Suporte
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 leading-relaxed space-y-2">
              <p>
                A plataforma opera com garantia de disponibilidade alvo de <strong>99.8%</strong> ao mês, com redundância geográfica em infraestrutura cloud de alta performance. Janelas de manutenção programada são comunicadas previamente no Cockpit.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-xs text-slate-500 pt-6 border-t border-slate-800/60">
          T-Maint Gestão Industrial Ltda • CNPJ sob regime de conformidade jurídica industrial.
        </div>
      </div>
    </div>
  );
}
