import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, Users, Wrench, FileText, Settings as SettingsIcon, Cog, LogOut, Loader2, HardHat, DollarSign } from "lucide-react";
import logoTmaint from "@/assets/logo-tmaint-icon.png";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/tecnicos", label: "Técnicos", icon: HardHat },
  { to: "/atividades", label: "Ordem de Serviço", icon: Wrench },
  { to: "/relatorios", label: "Relatórios", icon: FileText },
  { to: "/financeiro", label: "Financeiro", icon: DollarSign },
  { to: "/configuracoes", label: "Configurações", icon: SettingsIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { location } = useRouterState();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

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
        <div className="px-4 py-4 border-b border-sidebar-border flex items-center gap-3">
          <img src={logoTmaint} alt="T-Maint" className="h-10 w-10 object-contain shrink-0" />
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-base font-semibold tracking-tight text-sidebar-foreground">T-Maint</span>
            <span className="text-[10px] uppercase tracking-[0.12em] text-sidebar-foreground/60 truncate">
              Gestão Inteligente de Manutenção
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
          <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </aside>

      {/* mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <img src={logoTmaint} alt="T-Maint" className="h-8 w-8 object-contain shrink-0" />
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">T-Maint</span>
              <span className="text-[9px] uppercase tracking-[0.1em] text-sidebar-foreground/60 truncate">
                Gestão Inteligente de Manutenção
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} className="text-sidebar-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
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
