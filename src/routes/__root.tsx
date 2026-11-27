import { useEffect } from 'react';
import { telemetry } from '@/lib/observability';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AppShell } from "@/components/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-sm text-muted-foreground">Erro 404</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Página não encontrada</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O endereço pode ter mudado ou a página foi removida. Volte ao painel para continuar.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Voltar ao painel
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  telemetry.captureException(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center" role="alert">
        <h1 className="text-xl font-semibold text-foreground">Não foi possível carregar esta tela</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo falhou do nosso lado. Tente de novo; se continuar, volte ao painel e avise o suporte.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Voltar ao painel
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0E1116" },
      { title: "T-Maint | Manutenção Eletrônica de Máquinas CNC & Software de Gestão" },
      { name: "description", content: "Especialistas em manutenção preventiva, corretiva e reparo eletrônico de máquinas CNC (tornos, centros de usinagem e servodrives) e criadores da plataforma T-Maint para gestão de ordens de serviço." },
      { name: "keywords", content: "manutenção cnc, manutenção eletrônica industrial, reparo servodrive, conserto torno cnc, software ordem de serviço, gestão de manutenção, cmms, sistema para técnicos, t-maint" },
      { name: "author", content: "T-Maint Industrial" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "T-Maint | Manutenção Eletrônica CNC & Software de Gestão" },
      { property: "og:description", content: "Serviços especializados em eletrônica de máquinas CNC e software completo para gestão de manutenção, controle de técnicos, orçamentos e ordens de serviço." },
      { property: "og:url", content: "https://t-maint.com.br" },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "T-Maint | Manutenção Eletrônica CNC & Software de Gestão" },
      { name: "twitter:description", content: "Serviços especializados em eletrônica de máquinas CNC e software completo para gestão de manutenção e ordens de serviço." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon.png",
      },
      {
        rel: "apple-touch-icon",
        href: "/logo.png",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          // Aplica o tema salvo antes da primeira pintura (evita piscar claro→escuro).
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('tmaint-theme')||'dark';document.documentElement.classList.add(t)}catch(e){document.documentElement.classList.add('dark')}",
          }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useEffect(() => {
    telemetry.init();
  }, []);

  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppShell>
          <Outlet />
        </AppShell>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
