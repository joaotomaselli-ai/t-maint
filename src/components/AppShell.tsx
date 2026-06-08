import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, Users, Wrench, FileText, Settings as SettingsIcon, LogOut, Loader2, HardHat, DollarSign, Eye, EyeOff } from "lucide-react";
import logoTmaint from "@/assets/logo-tmaint-icon.png";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useMoneyHidden, toggleMoneyHidden } from "@/hooks/use-money-visibility";
import { useAccess } from "@/hooks/use-access";

type NavItem = { to: string; label: string; icon: any; feature?: string };

const ALL_NAV: NavItem[] = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", icon: Users, feature: "clientes" },
  { to: "/tecnicos", label: "Técnicos", icon: HardHat, feature: "tecnicos" },
  { to: "/atividades", label: "Ordem de Serviço", icon: Wrench, feature: "atividades" },
  { to: "/relatorios", label: "Relatórios", icon: FileText, feature: "relatorios" },
  { to: "/financeiro", label: "Financeiro", icon: DollarSign, feature: "financeiro" },
  { to: "/configuracoes", label: "Configurações", icon: SettingsIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { location } = useRouterState();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const moneyHidden = useMoneyHidden();
  const { isMaster, isAdmin, isTechnician, allowedFeatures } = useAccess();

  const nav: NavItem[] = ALL_NAV.filter((item) => {
    if (!item.feature) return true;
    // Master: hide operational tabs (clientes, técnicos, atividades, relatórios)
    if (isMaster) return item.feature === "financeiro";
    if (isTechnician) {
      if (item.feature === "clientes" || item.feature === "tecnicos") return false;
      return true;
    }
    if (isAdmin) return true;
    if (allowedFeatures === null) return true;
    return allowedFeatures.includes(item.feature);
  });



  const isPublic = location.pathname === "/login";

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      navigate({ to: "/login" });
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

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="px-3 py-4 border-b border-sidebar-border flex items-center gap-2">
          <img src={logoTmaint} alt="T-Maint" className="h-9 w-9 object-contain shrink-0" />
          <div className="flex flex-col leading-tight min-w-0 flex-1">
            <span className="text-base font-semibold tracking-tight text-sidebar-foreground">T-Maint</span>
            <span className="text-[9px] uppercase tracking-[0.08em] text-sidebar-foreground/60 leading-snug break-words">
              Gestão Inteligente<br />de Manutenção
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
          <div className="px-2 text-xs text-sidebar-foreground/60 truncate">{user.email}</div>
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
                Gestão Inteligente de Manutenção
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleMoneyHidden} className="text-sidebar-foreground" title={moneyHidden ? "Mostrar valores" : "Ocultar valores"}>
              {moneyHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
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
