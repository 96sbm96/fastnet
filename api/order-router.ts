import { z } from "zod";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import {
  findAllOrders,
  findOrderById,
  findOrderByNumber,
  findOrdersByUser,
  findOrdersByStatus,
  createOrder,
  updateOrder,
  cancelOrder,
  completeOrder,
  deleteOrder,
  getOrderStats,
  getDailyStats,
} from "./queries/orders";
import { findAvailableCard, reserveCard, releaseCard, markCardSold } from "./queries/cards";
// import { findGatewayById } from "./queries/payment-gateways";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FN-${timestamp}${random}`;
}

export const orderRouter = createRouter({
  list: adminQuery.query(async () => {
    return findAllOrders();
  }),

  getById: adminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return findOrderById(input.id);
    }),

  getByNumber: publicQuery
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ input }) => {
      return findOrderByNumber(input.orderNumber);
    }),

  myOrders: authedQuery.query(async ({ ctx }) => {
    return findOrdersByUser(ctx.user.id);
  }),

  getByStatus: adminQuery
    .input(
      z.object({
        status: z.enum([
          "pending",
          "reserved",
          "completed",
          "cancelled",
          "expired",
          "failed",
        ]),
      })
    )
    .query(async ({ input }) => {
      return findOrdersByStatus(input.status);
    }),

  create: publicQuery
    .input(
      z.object({
        packageId: z.number(),
        amount: z.string().or(z.number()),
        gatewayId: z.number(),
        customerName: z.string().optional(),
        customerPhone: z.string().optional(),
        customerEmail: z.string().optional(),
        macAddress: z.string().optional(),
        ipAddress: z.string().optional(),
        routerIdentity: z.string().optional(),
        hotspotInterface: z.string().optional(),
        redirectUrl: z.string().optional(),
        userId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Find available card for this package
      const availableCard = await findAvailableCard(input.packageId);
      if (!availableCard) {
        throw new Error("لا توجد كروت متاحة لهذه الباقة حالياً");
      }

      const orderNumber = generateOrderNumber();

      // Create order
      const order = await createOrder({
        ...input,
        orderNumber,
        amount: input.amount.toString(),
        status: "pending",
        cardId: availableCard.id,
      });

      // Reserve the card
      await reserveCard(availableCard.id, order!.id, 10);

      // Update order to reserved
      await updateOrder(order!.id, { status: "reserved" });

      return findOrderById(order!.id);
    }),

  confirmPayment: publicQuery
    .input(z.object({ orderNumber: z.string() }))
    .mutation(async ({ input }) => {
      const order = await findOrderByNumber(input.orderNumber);
      if (!order) throw new Error("الطلب غير موجود");
      if (order.status !== "reserved" && order.status !== "pending") {
        throw new Error("حالة الطلب لا تسمح بتاكيد الدفع");
      }

      if (order.cardId) {
        await markCardSold(order.cardId);
      }

      return completeOrder(order.id, order.cardId!);
    }),

  cancel: publicQuery
    .input(z.object({ orderNumber: z.string() }))
    .mutation(async ({ input }) => {
      const order = await findOrderByNumber(input.orderNumber);
      if (!order) throw new Error("الطلب غير موجود");

      if (order.cardId) {
        await releaseCard(order.cardId);
      }

      return cancelOrder(order.id);
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z
          .enum([
            "pending",
            "reserved",
            "completed",
            "cancelled",
            "expired",
            "failed",
          ])
          .optional(),
        amount: z.string().optional(),
        customerName: z.string().optional(),
        customerPhone: z.string().optional(),
        customerEmail: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateOrder(id, data);
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteOrder(input.id);
      return { success: true };
    }),

  stats: adminQuery.query(async () => {
    return getOrderStats();
  }),

  dailyStats: adminQuery
    .input(z.object({ days: z.number().default(30) }).optional())
    .query(async ({ input }) => {
      return getDailyStats(input?.days ?? 30);
    }),
});
