// instrument.ts
import * as Sentry from "@sentry/bun";

Sentry.init({
  dsn: "https://…",
  tracesSampleRate: 1.0,
  // …
});
