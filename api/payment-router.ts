import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  findAllGateways,
  findActiveGateways,
  findGatewayById,
  findGatewayByCode,
  createGateway,
  updateGateway,
  deleteGateway,
} from "./queries/payment-gateways";
import {
  findAllTransactions,
  findTransactionById,
  findTransactionsByOrder,
  findTransactionByIdempotencyKey,
  createTransaction,
  updateTransaction,
} from "./queries/transactions";

export const paymentRouter = createRouter({
  // ===== Gateway Endpoints =====
  gatewayList: adminQuery.query(async () => {
    return findAllGateways();
  }),

  activeGateways: publicQuery.query(async () => {
    return findActiveGateways();
  }),

  gatewayById: adminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return findGatewayById(input.id);
    }),

  gatewayByCode: adminQuery
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      return findGatewayByCode(input.code);
    }),

  createGateway: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        displayNameAr: z.string().min(1),
        isActive: z.boolean().default(true),
        isSandbox: z.boolean().default(true),
        apiKey: z.string().optional(),
        apiSecret: z.string().optional(),
        merchantId: z.string().optional(),
        baseUrl: z.string().optional(),
        sandboxUrl: z.string().optional(),
        webhookSecret: z.string().optional(),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      return createGateway(input);
    }),

  updateGateway: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        displayNameAr: z.string().optional(),
        isActive: z.boolean().optional(),
        isSandbox: z.boolean().optional(),
        apiKey: z.string().optional(),
        apiSecret: z.string().optional(),
        merchantId: z.string().optional(),
        baseUrl: z.string().optional(),
        sandboxUrl: z.string().optional(),
        webhookSecret: z.string().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateGateway(id, data);
    }),

  deleteGateway: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteGateway(input.id);
      return { success: true };
    }),

  // ===== Transaction Endpoints =====
  transactionList: adminQuery.query(async () => {
    return findAllTransactions();
  }),

  transactionById: adminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return findTransactionById(input.id);
    }),

  transactionsByOrder: adminQuery
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      return findTransactionsByOrder(input.orderId);
    }),

  checkIdempotency: adminQuery
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      return findTransactionByIdempotencyKey(input.key);
    }),

  createTransaction: adminQuery
    .input(
      z.object({
        orderId: z.number(),
        gatewayId: z.number(),
        amount: z.string().or(z.number()),
        idempotencyKey: z.string().optional(),
        requestPayload: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createTransaction({
        orderId: input.orderId,
        gatewayId: input.gatewayId,
        amount: input.amount.toString(),
        status: "pending",
        idempotencyKey: input.idempotencyKey,
        requestPayload: input.requestPayload,
      } as any);
    }),

  updateTransaction: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z
          .enum(["pending", "success", "failed", "cancelled", "refunded"])
          .optional(),
        transactionRef: z.string().optional(),
        gatewayRef: z.string().optional(),
        responsePayload: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateTransaction(id, {
        ...data,
        processedAt: new Date(),
      } as any);
    }),
});
