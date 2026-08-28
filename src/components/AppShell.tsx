import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, Users, Wrench, FileText, Settings as SettingsIcon, LogOut, Loader2, HardHat, DollarSign, Eye, EyeOff, ShoppingCart, Package, ShieldAlert, Lock, MessageCircle } from "lucide-react";
import logoTmaint from "@/assets/logo-tmaint-icon.png";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useMoneyHidden, toggleMoneyHidden } from "@/hooks/use-money-visibility";
import { useAccess } from "@/hooks/use-access";

type NavItem = { to: string; label: string; icon: any; feature?: string; adminOnly?: boolean; masterOnly?: boolean };

const ALL_NAV: NavItem[] = [
  { to: "/master", label: "Painel Master", icon: ShieldAlert, masterOnly: true },
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", icon: Users, feature: "clientes" },
  { to: "/tecnicos", label: "Técnicos", icon: HardHat, feature: "tecnicos" },
  { to: "/atividades", label: "Ordem de Serviço", icon: Wrench, feature: "atividades" },
  { to: "/relatorios", label: "Relatórios", icon: FileText, feature: "relatorios" },
  { to: "/financeiro", label: "Financeiro", icon: DollarSign, feature: "financeiro" },
  { to: "/requisicoes", label: "Requisições", icon: ShoppingCart, feature: "requisicoes" },
  { to: "/estoque", label: "Estoque", icon: Package, feature: "estoque", proOnly: true },
  { to: "/configuracoes", label: "Configurações", icon: SettingsIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { location } = useRouterState();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const moneyHidden = useMoneyHidden();
  const { isMaster, isAdmin, isTechnician, isClient, companyName, allowedFeatures, planType, isBlocked, blockedReason, subscription } = useAccess();

  const nav: NavItem[] = ALL_NAV.filter((item: any) => {
    if (isMaster) {
      return item.to === "/master" || item.to === "/financeiro" || item.to === "/configuracoes";
    }
    if (item.masterOnly) return false;
    if (isClient) {
      return item.to === "/" || item.to === "/configuracoes";
    }
    if (item.adminOnly && !isAdmin) return false;
    if (item.proOnly && planType === "basic") return false;
    if (!item.feature) return true;
    
    // Only admins can see Clientes and Técnicos
    if (item.feature === "clientes" || item.feature === "tecnicos") {
      if (!isAdmin) return false;
    }

    if (isTechnician) {
      if (item.feature === "atividades" || item.feature === "relatorios") return true;
      return allowedFeatures?.includes(item.feature) ?? false;
    }
    
    if (isAdmin) return true;
    if (allowedFeatures === null) return true;
    return allowedFeatures.includes(item.feature);
  });

  const isPublic = location.pathname === "/login" || location.pathname === "/landing";

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      navigate({ to: "/landing" });
    }
  }, [loading, user, isPublic, navigate]);

  if (isPublic) return <>{children}</>;

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If user/admin is blocked and not master, show BlockedScreen
  if (isBlocked && !isMaster) {
    return (
      <BlockedScreen
        companyName={companyName}
        blockedReason={blockedReason}
        subscription={subscription}
        onSignOut={signOut}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="px-3 py-4 border-b border-sidebar-border flex items-center gap-2">
          <img src={logoTmaint} alt="T-Maint" className="h-9 w-9 object-contain shrink-0" />
          <div className="flex flex-col leading-tight min-w-0 flex-1">
            <span className="text-base font-semibold tracking-tight text-sidebar-foreground">T-Maint</span>
            <span className="text-[9px] uppercase tracking-[0.08em] text-sidebar-foreground/60 leading-snug break-words">
              {isClient ? "Portal do Cliente" : "Gestão Inteligente\nde Manutenção"}
            </span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <div className="px-2 text-xs text-sidebar-foreground/60 truncate">
            {user.email}
            {isClient && <div className="text-[10px] text-cyan-400 font-semibold mt-0.5">● Portal do Cliente</div>}
          </div>
          {!isClient && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMoneyHidden}
              className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              title={moneyHidden ? "Mostrar valores" : "Ocultar valores"}
            >
              {moneyHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {moneyHidden ? "Mostrar valores" : "Ocultar valores"}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </aside>

      {/* mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <img src={logoTmaint} alt="T-Maint" className="h-8 w-8 object-contain shrink-0" />
            <div className="flex flex-col leading-tight min-w-0 flex-1">
              <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">T-Maint</span>
              <span className="text-[9px] uppercase tracking-[0.08em] text-sidebar-foreground/60 leading-snug">
                {isClient ? "Portal do Cliente" : "Gestão Inteligente de Manutenção"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!isClient && (
              <Button variant="ghost" size="icon" onClick={toggleMoneyHidden} className="text-sidebar-foreground" title={moneyHidden ? "Mostrar valores" : "Ocultar valores"}>
                {moneyHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={signOut} className="text-sidebar-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <nav className="flex overflow-x-auto px-2 pb-2 gap-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
            return (
              <Link key={to} to={to}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap",
                  active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80"
                )}>
                <Icon className="h-3.5 w-3.5" />{label}
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="flex-1 md:ml-0 mt-[88px] md:mt-0 overflow-x-hidden">
        <div className="max-w-7xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}

function BlockedScreen({
  companyName,
  blockedReason,
  subscription,
  onSignOut,
}: {
  companyName: string | null;
  blockedReason: string | null;
  subscription: any;
  onSignOut: () => void;
}) {
  const masterPhone = "47988485668";
  const whatsappMsg = encodeURIComponent(
    `Olá João! Sou da empresa *${companyName || "Minha Empresa"}* e gostaria de solicitar a renovação / liberação do nosso acesso ao T-Maint.`
  );
  const whatsappUrl = `https://wa.me/55${masterPhone}?text=${whatsappMsg}`;

  const formattedDate = subscription?.endDate
    ? subscription.endDate.split("-").reverse().join("/")
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4 text-slate-100">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl backdrop-blur text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Lock className="h-10 w-10" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <ShieldAlert className="h-3.5 w-3.5" /> Acesso Suspenso
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {companyName ? `Empresa ${companyName}` : "Acesso Bloqueado"}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            {blockedReason || "O acesso a este ambiente foi temporariamente suspenso devido ao término da vigência da assinatura ou bloqueio administrativo."}
          </p>
        </div>

        {subscription && formattedDate && (
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50 text-left text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Plano Contratado:</span>
              <span className="font-semibold text-slate-200 capitalize">{subscription.cycle || "Mensal"}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Data de Vencimento:</span>
              <span className="font-semibold text-amber-300">{formattedDate}</span>
            </div>
            {subscription.daysRemaining < 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Tempo expirado:</span>
                <span className="font-semibold text-rose-400">{Math.abs(subscription.daysRemaining)} dia(s) atrás</span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-lg shadow-emerald-900/40 hover:scale-[1.02]"
          >
            <MessageCircle className="h-5 w-5" /> Falar no WhatsApp para Renovar
          </a>

          <Button
            variant="ghost"
            onClick={onSignOut}
            className="w-full text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
}
