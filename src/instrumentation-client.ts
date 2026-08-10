import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV,

  enabled: process.env.NODE_ENV === "production",

  tracesSampleRate: 0,
  enableLogs: false,
  sendDefaultPii: false,

  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  beforeSend(event) {
    return scrubEvent(event);
  },

  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category === "console") return null;
    if (breadcrumb.data && "body" in breadcrumb.data) {
      delete breadcrumb.data.body;
    }
    return breadcrumb;
  },
});

const SENSITIVE_KEYS = [
  "password",
  "current_password",
  "password_confirmation",
  "diary_password",
  "code",
  "otp",
  "token",
  "access_token",
  "refresh_token",
  "signature",
  "hash",
  "content",
  "body",
  "email",
];

function scrubValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(scrubValue);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEYS.includes(k.toLowerCase()) ? "[scrubbed]" : scrubValue(v);
    }
    return out;
  }
  return value;
}

function scrubEvent(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
  if (event.request) {
    delete event.request.data;
    delete event.request.cookies;
    if (event.request.headers) {
      delete event.request.headers["Authorization"];
      delete event.request.headers["authorization"];
      delete event.request.headers["Cookie"];
      delete event.request.headers["cookie"];
    }
  }

  if (event.user) {
    event.user = { id: event.user.id };
  }

  if (event.extra) {
    event.extra = scrubValue(event.extra) as Record<string, unknown>;
  }
  if (event.contexts) {
    event.contexts = scrubValue(event.contexts) as typeof event.contexts;
  }

  return event;
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;