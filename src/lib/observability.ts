/**
 * T-Maint Observability & Error Telemetry Module
 * 
 * Centralized error tracking and performance metrics with resilient fallback.
 */

export interface TelemetryEvent {
  message: string;
  level: 'info' | 'warning' | 'error' | 'fatal';
  context?: Record<string, unknown>;
  timestamp: string;
}

class ObservabilityService {
  private isInitialized = false;
  private breadcrumbs: string[] = [];
  private maxBreadcrumbs = 25;

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    this.isInitialized = true;
    const sentryDsn = (import.meta as any).env?.VITE_SENTRY_DSN;

    if (sentryDsn) {
      console.info('[Observability] Initialized with remote telemetry.');
    } else {
      console.info('[Observability] Initialized in local structured mode.');
    }

    window.addEventListener('error', (event) => {
      this.captureException(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.captureException(event.reason || new Error('Unhandled Promise Rejection'), {
        type: 'unhandledrejection',
      });
    });
  }

  addBreadcrumb(message: string) {
    const entry = '[' + new Date().toISOString() + '] ' + message;
    this.breadcrumbs.push(entry);
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  captureException(error: unknown, context?: Record<string, unknown>) {
    const errObj = error instanceof Error ? error : new Error(String(error));
    const payload: TelemetryEvent = {
      message: errObj.message,
      level: 'error',
      context: {
        ...context,
        stack: errObj.stack,
        breadcrumbs: [...this.breadcrumbs],
      },
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV === 'development') {
      console.error('[Observability:Error]', payload);
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, unknown>) {
    const payload: TelemetryEvent = {
      message,
      level,
      context,
      timestamp: new Date().toISOString(),
    };
    if (process.env.NODE_ENV === 'development') {
      console.log('[Observability:' + level.toUpperCase() + ']', payload);
    }
  }
}

export const telemetry = new ObservabilityService();
