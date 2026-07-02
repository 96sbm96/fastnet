import { authRouter } from "./auth-router";
import { packageRouter } from "./package-router";
import { cardRouter } from "./card-router";
import { orderRouter } from "./order-router";
import { paymentRouter } from "./payment-router";
import { settingsRouter } from "./settings-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  package: packageRouter,
  card: cardRouter,
  order: orderRouter,
  payment: paymentRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
