import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Wrench, 
  FileText, 
  Settings as SettingsIcon, 
  LogOut, 
  Loader2, 
  HardHat, 
  DollarSign, 
  Eye, 
  EyeOff, 
  ShoppingCart, 
  Package, 
  ShieldAlert, 
  Lock, 
  MessageCircle, 
  Calculator,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import logoTmaint from "@/assets/logo-tmaint-icon.png";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useMoneyHidden, toggleMoneyHidden } from "@/hooks/use-money-visibility";
import { useAccess } from "@/hooks/use-access";
import { useTheme } from "@/hooks/use-theme";

type NavItem = { to: string; label: string; icon: any; feature?: string; adminOnly?: boolean; masterOnly?: boolean; proOnly?: boolean; badge?: string };

const ALL_NAV: NavItem[] = [
  { to: "/master", label: "Painel Master", icon: ShieldAlert, masterOnly: true },
  { to: "/", label: "Cockpit Geral", icon: LayoutDashboard },
  { to: "/atividades", label: "Ordens de Serviço", icon: Wrench, feature: "atividades" },
  { to: "/orcamentos", label: "Orçamentos", icon: Calculator, feature: "orcamentos" },
  { to: "/clientes", label: "Clientes & CNCs", icon: Users, feature: "clientes" },
  { to: "/tecnicos", label: "Técnicos de Campo", icon: HardHat, feature: "tecnicos" },
  { to: "/relatorios", label: "Relatórios & Laudos", icon: FileText, feature: "relatorios" },
  { to: "/estoque", label: "Estoque & QR Code", icon: Package, feature: "estoque", proOnly: true },
  { to: "/financeiro", label: "Financeiro & KM", icon: DollarSign, feature: "financeiro" },
  { to: "/requisicoes", label: "Requisições", icon: ShoppingCart, feature: "requisicoes" },
  { to: "/configuracoes", label: "Configurações", icon: SettingsIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { location } = useRouterState();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const moneyHidden = useMoneyHidden();
  const { theme, toggleTheme, isDark } = useTheme();
  const { isMaster, isAdmin, isTechnician, isClient, companyName, allowedFeatures, planType, isBlocked, blockedReason, subscription } = useAccess();
  const [collapsed, setCollapsed] = useState(false);

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

  const publicRoutes = ["/login", "/landing", "/servicos-cnc", "/privacidade", "/termos"];
  const isPublic = publicRoutes.includes(location.pathname) || location.pathname.startsWith("/m/");

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      navigate({ to: "/landing" });
    }
  }, [loading, user, isPublic, navigate]);

  if (isPublic) return <>{children}</>;

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0B0F17]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#00F5D4]" />
          <span className="text-xs font-mono text-slate-400">Iniciando Ambiente T-Maint...</span>
        </div>
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
    <div className="flex min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
      {/* DESKTOP SIDEBAR */}
      <aside 
        className={cn(
          "hidden md:flex flex-col border-r border-[#1F293D] bg-[#0B0F17] transition-all duration-300 relative z-30",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-[#1F293D] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img src={logoTmaint} alt="T-Maint" className="h-8 w-8 object-contain shrink-0 drop-shadow-[0_0_10px_rgba(0,245,212,0.3)]" />
            {!collapsed && (
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  T-MAINT
                  <span className="text-[8px] font-mono uppercase font-bold tracking-wider px-1 py-0.2 rounded border border-[#00F5D4]/40 bg-[#00F5D4]/10 text-[#00F5D4]">
                    PRO
                  </span>
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono truncate">
                  {isClient ? "Portal do Cliente" : "Cockpit Operacional"}
                </span>
              </div>
            )}
          </Link>

          {/* Toggle Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#131A26] border border-transparent hover:border-[#1F293D] transition-colors"
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto font-mono text-xs">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all group relative",
                  active
                    ? "bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/40 font-bold shadow-[0_0_15px_rgba(0,245,212,0.15)]"
                    : "text-slate-400 hover:text-white hover:bg-[#131A26] border border-transparent"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", active && "text-[#00F5D4]")} />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#1F293D] space-y-2 bg-[#0B0F17]/90 font-mono text-xs">
          {/* User Email & Badge */}
          {!collapsed && (
            <div className="px-2 py-1 rounded-lg bg-[#131A26] border border-[#1F293D]">
              <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
              <div className="text-[9px] text-[#00F5D4] font-bold mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-pulse" />
                {isMaster ? "Acesso Master" : isAdmin ? "Administrador" : isTechnician ? "Técnico de Campo" : "Cliente"}
              </div>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="flex-1 justify-start gap-2 text-slate-300 hover:text-white hover:bg-[#131A26] border border-transparent hover:border-[#1F293D] rounded-lg text-xs"
              title={isDark ? "Alternar para Modo Claro" : "Alternar para Modo Escuro (Cockpit)"}
            >
              {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-cyan-400" />}
              {!collapsed && <span>{isDark ? "Modo Claro" : "Modo Escuro"}</span>}
            </Button>

            {/* Money Visibility Toggle */}
            {!isClient && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMoneyHidden}
                className="p-2 text-slate-300 hover:text-white hover:bg-[#131A26] border border-transparent hover:border-[#1F293D] rounded-lg"
                title={moneyHidden ? "Mostrar valores" : "Ocultar valores"}
              >
                {moneyHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5 text-[#00F5D4]" />}
              </Button>
            )}

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 rounded-lg"
              title="Sair do sistema"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* MOBILE TOP BAR & NAVIGATION */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-[#0B0F17]/95 border-b border-[#1F293D] backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <img src={logoTmaint} alt="T-Maint" className="h-7 w-7 object-contain shrink-0 drop-shadow-[0_0_8px_rgba(0,245,212,0.3)]" />
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-sm font-extrabold text-white flex items-center gap-1">
                T-MAINT
                <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30">PRO</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-slate-300 h-8 w-8">
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-cyan-400" />}
            </Button>
            {!isClient && (
              <Button variant="ghost" size="icon" onClick={toggleMoneyHidden} className="text-slate-300 h-8 w-8">
                {moneyHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-[#00F5D4]" />}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={signOut} className="text-rose-400 h-8 w-8">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Horizontal Nav Scroller */}
        <nav className="flex overflow-x-auto px-3 pb-2 gap-1.5 font-mono text-xs no-scrollbar">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
            return (
              <Link 
                key={to} 
                to={to}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors",
                  active 
                    ? "bg-[#00F5D4]/15 text-[#00F5D4] font-bold border border-[#00F5D4]/30" 
                    : "text-slate-400 hover:text-white bg-[#131A26]/60 border border-[#1F293D]"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 md:ml-0 mt-[96px] md:mt-0 overflow-x-hidden min-h-screen bg-background">
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
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F17] p-4 text-slate-100 font-mono">
      <div className="max-w-md w-full bg-[#131A26]/95 border border-amber-500/40 rounded-3xl p-8 shadow-2xl backdrop-blur text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
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
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            {blockedReason || "O acesso a este ambiente foi temporariamente suspenso devido ao término da vigência da assinatura ou bloqueio administrativo."}
          </p>
        </div>

        {subscription && formattedDate && (
          <div className="bg-[#0B0F17] rounded-xl p-4 border border-[#1F293D] text-left text-xs space-y-2">
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
            className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-lg shadow-emerald-900/40 hover:scale-[1.02] text-xs uppercase"
          >
            <MessageCircle className="h-4 w-4" /> Falar no WhatsApp para Renovar
          </a>

          <Button
            variant="ghost"
            onClick={onSignOut}
            className="w-full text-slate-400 hover:text-slate-100 hover:bg-[#0B0F17]"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
}
