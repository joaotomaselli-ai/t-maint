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
  ShieldCheck,
  Menu,
} from "lucide-react";
import logoTmaint from "@/assets/logo-tmaint-icon.png";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useMoneyHidden, toggleMoneyHidden } from "@/hooks/use-money-visibility";
import { useAccess } from "@/hooks/use-access";
import { useTheme } from "@/hooks/use-theme";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type NavGroup = "operacao" | "cadastros" | "gestao" | "sistema";
type NavItem = {
  to: string;
  label: string;
  shortLabel?: string;
  icon: any;
  group?: NavGroup;
  feature?: string;
  adminOnly?: boolean;
  masterOnly?: boolean;
  proOnly?: boolean;
  badge?: string;
};

const NAV_GROUPS: { id: NavGroup; label: string | null }[] = [
  { id: "operacao", label: null },
  { id: "cadastros", label: "Cadastros" },
  { id: "gestao", label: "Gestão" },
  { id: "sistema", label: null },
];

const ALL_NAV: NavItem[] = [
  { to: "/master", label: "Painel master", shortLabel: "Master", icon: ShieldAlert, masterOnly: true },
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/atividades", label: "Ordens de serviço", shortLabel: "OS", icon: Wrench, feature: "atividades" },
  { to: "/orcamentos", label: "Orçamentos", icon: Calculator, feature: "orcamentos" },
  { to: "/requisicoes", label: "Requisições", icon: ShoppingCart, feature: "requisicoes" },
  { to: "/clientes", label: "Clientes e máquinas", shortLabel: "Clientes", icon: Users, feature: "clientes", group: "cadastros" },
  { to: "/tecnicos", label: "Técnicos", icon: HardHat, feature: "tecnicos", group: "cadastros" },
  { to: "/estoque", label: "Estoque", icon: Package, feature: "estoque", proOnly: true, group: "cadastros" },
  { to: "/relatorios", label: "Relatórios e laudos", shortLabel: "Relatórios", icon: FileText, feature: "relatorios", group: "gestao" },
  { to: "/financeiro", label: "Financeiro", icon: DollarSign, feature: "financeiro", group: "gestao" },
  { to: "/configuracoes", label: "Configurações", shortLabel: "Ajustes", icon: SettingsIcon, group: "sistema" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { location } = useRouterState();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const moneyHidden = useMoneyHidden();
  const { theme, toggleTheme, isDark } = useTheme();
  const { isMaster, isAdmin, isTechnician, isClient, companyName, allowedFeatures, planType, isBlocked, blockedReason, subscription } = useAccess();
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

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
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Carregando…</span>
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

  const isActive = (to: string) => (to === "/" ? location.pathname === "/" : location.pathname.startsWith(to));
  const roleLabel = isMaster ? "Acesso master" : isAdmin ? "Administrador" : isTechnician ? "Técnico de campo" : "Cliente";
  const groups = NAV_GROUPS.map((g) => ({ ...g, items: nav.filter((i) => (i.group ?? "operacao") === g.id) })).filter(
    (g) => g.items.length > 0,
  );

  // Barra inferior (celular): até 4 atalhos diretos + "Mais" com o restante.
  const mobilePrimary = nav.length <= 5 ? nav : nav.filter((i) => i.to !== "/configuracoes").slice(0, 4);
  const mobileOverflow = nav.filter((i) => !mobilePrimary.includes(i));
  const overflowActive = mobileOverflow.some((i) => isActive(i.to));

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>

      {/* MENU LATERAL (desktop) */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-[var(--ease-out)] md:flex",
          collapsed ? "w-[68px]" : "w-60",
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center border-b border-sidebar-border",
            collapsed ? "justify-center px-2" : "justify-between px-4",
          )}
        >
          {!collapsed && (
            <Link
              to="/"
              className="flex min-w-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <img src={logoTmaint} alt="" width={28} height={28} className="h-7 w-7 shrink-0 object-contain" />
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="text-sm font-semibold tracking-tight text-foreground" translate="no">
                  T-Maint
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {companyName || (isClient ? "Portal do cliente" : "Gestão de manutenção")}
                </span>
              </div>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav aria-label="Navegação principal" className="flex-1 space-y-5 overflow-y-auto px-2.5 py-4">
          {groups.map((g) => (
            <div key={g.id} className="space-y-0.5">
              {!collapsed && g.label && (
                <div className="px-2.5 pb-1 text-[11px] font-medium text-muted-foreground">{g.label}</div>
              )}
              {g.items.map(({ to, label, icon: Icon }) => {
                const active = isActive(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    title={collapsed ? label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      collapsed && "justify-center px-0",
                      active
                        ? "bg-sidebar-accent font-medium text-foreground before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-foreground",
                    )}
                  >
                    <Icon
                      aria-hidden="true"
                      className={cn("h-4 w-4 shrink-0", active ? "text-sidebar-primary" : "text-muted-foreground")}
                    />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="space-y-2 border-t border-sidebar-border p-2.5">
          {!collapsed && (
            <div className="px-2.5 py-1">
              <div className="truncate text-xs text-foreground">{user.email}</div>
              <div className="text-[11px] text-muted-foreground">{roleLabel}</div>
            </div>
          )}
          <div className={cn("flex items-center gap-1", collapsed && "flex-col")}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label={isDark ? "Usar modo claro" : "Usar modo escuro"}
              title={isDark ? "Modo claro (uso no sol)" : "Modo escuro"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {!isClient && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMoneyHidden}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label={moneyHidden ? "Mostrar valores" : "Ocultar valores"}
                title={moneyHidden ? "Mostrar valores" : "Ocultar valores"}
              >
                {moneyHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className={cn(
                "h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                !collapsed && "ml-auto",
              )}
              aria-label="Sair do sistema"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* BARRA SUPERIOR (celular) */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:hidden">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <img src={logoTmaint} alt="" width={26} height={26} className="h-[26px] w-[26px] shrink-0 object-contain" />
          <span className="truncate text-sm font-semibold" translate="no">
            T-Maint
          </span>
          {companyName && <span className="truncate text-xs text-muted-foreground">· {companyName}</span>}
        </Link>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-10 w-10 text-muted-foreground"
            aria-label={isDark ? "Usar modo claro" : "Usar modo escuro"}
          >
            {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </Button>
          {!isClient && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMoneyHidden}
              className="h-10 w-10 text-muted-foreground"
              aria-label={moneyHidden ? "Mostrar valores" : "Ocultar valores"}
            >
              {moneyHidden ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </Button>
          )}
        </div>
      </header>

      {/* NAVEGAÇÃO INFERIOR (celular) — alvos de toque de 56px, pensados para uso com luva */}
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="flex">
          {mobilePrimary.map(({ to, shortLabel, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <li key={to} className="min-w-0 flex-1">
                <Link
                  to={to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-14 flex-col items-center justify-center gap-1 text-[11px] transition-colors",
                    active ? "font-medium text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon aria-hidden="true" className="h-5 w-5" />
                  <span className="max-w-full truncate px-1">{shortLabel ?? label}</span>
                </Link>
              </li>
            );
          })}
          {mobileOverflow.length > 0 && (
            <li className="min-w-0 flex-1">
              <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex h-14 w-full flex-col items-center justify-center gap-1 text-[11px] transition-colors",
                      overflowActive ? "font-medium text-primary" : "text-muted-foreground",
                    )}
                  >
                    <Menu aria-hidden="true" className="h-5 w-5" />
                    <span>Mais</span>
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="bottom"
                  className="rounded-t-xl pb-[calc(env(safe-area-inset-bottom)+1rem)] [overscroll-behavior:contain]"
                >
                  <SheetHeader className="text-left">
                    <SheetTitle>Menu</SheetTitle>
                    <SheetDescription className="truncate">
                      {user.email} · {roleLabel}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {mobileOverflow.map(({ to, label, icon: Icon }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setMoreOpen(false)}
                        aria-current={isActive(to) ? "page" : undefined}
                        className={cn(
                          "flex h-14 items-center gap-3 rounded-md border px-3 text-sm transition-colors",
                          isActive(to)
                            ? "border-primary/40 bg-primary/10 font-medium text-foreground"
                            : "border-border bg-card text-foreground hover:bg-accent",
                        )}
                      >
                        <Icon aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
                        <span className="truncate">{label}</span>
                      </Link>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={signOut}
                    className="mt-4 h-12 w-full text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" /> Sair do sistema
                  </Button>
                </SheetContent>
              </Sheet>
            </li>
          )}
        </ul>
      </nav>

      {/* CONTEÚDO */}
      <main
        id="conteudo"
        className="min-h-screen min-w-0 flex-1 overflow-x-hidden bg-background pb-[calc(72px+env(safe-area-inset-bottom))] pt-14 md:pb-0 md:pt-0"
      >
        <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 text-foreground">
      <div className="max-w-md w-full bg-card/95 border border-amber-500/40 rounded-lg p-8 shadow-sm text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Lock className="h-10 w-10" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <ShieldAlert className="h-3.5 w-3.5" /> Acesso Suspenso
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            {companyName ? `Empresa ${companyName}` : "Acesso Bloqueado"}
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed ">
            {blockedReason || "O acesso a este ambiente foi temporariamente suspenso devido ao término da vigência da assinatura ou bloqueio administrativo."}
          </p>
        </div>

        {subscription && formattedDate && (
          <div className="bg-background rounded-md p-4 border border-border text-left text-xs space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Plano Contratado:</span>
              <span className="font-semibold text-foreground capitalize">{subscription.cycle || "Mensal"}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Data de Vencimento:</span>
              <span className="font-semibold text-amber-300">{formattedDate}</span>
            </div>
            {subscription.daysRemaining < 0 && (
              <div className="flex justify-between text-muted-foreground">
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
            className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all text-sm"
          >
            <MessageCircle className="h-4 w-4" /> Falar no WhatsApp para Renovar
          </a>

          <Button
            variant="ghost"
            onClick={onSignOut}
            className="w-full text-muted-foreground hover:text-foreground hover:bg-background"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
}
