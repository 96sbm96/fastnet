import { relations } from "drizzle-orm";
import {
  users,
  packages,
  cards,
  orders,
  paymentGateways,
  gatewayTransactions,
  webhookLogs,
  notifications,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  notifications: many(notifications),
}));

export const packagesRelations = relations(packages, ({ many }) => ({
  cards: many(cards),
  orders: many(orders),
}));

export const cardsRelations = relations(cards, ({ one }) => ({
  package: one(packages, {
    fields: [cards.packageId],
    references: [packages.id],
  }),
  order: one(orders, {
    fields: [cards.orderId],
    references: [orders.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  package: one(packages, {
    fields: [orders.packageId],
    references: [packages.id],
  }),
  card: one(cards, {
    fields: [orders.cardId],
    references: [cards.id],
  }),
  gateway: one(paymentGateways, {
    fields: [orders.gatewayId],
    references: [paymentGateways.id],
  }),
  transactions: many(gatewayTransactions),
}));

export const paymentGatewaysRelations = relations(paymentGateways, ({ many }) => ({
  transactions: many(gatewayTransactions),
  webhooks: many(webhookLogs),
}));

export const gatewayTransactionsRelations = relations(gatewayTransactions, ({ one }) => ({
  order: one(orders, {
    fields: [gatewayTransactions.orderId],
    references: [orders.id],
  }),
  gateway: one(paymentGateways, {
    fields: [gatewayTransactions.gatewayId],
    references: [paymentGateways.id],
  }),
}));

export const webhookLogsRelations = relations(webhookLogs, ({ one }) => ({
  gateway: one(paymentGateways, {
    fields: [webhookLogs.gatewayId],
    references: [paymentGateways.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
