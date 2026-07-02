import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import {
  findAllCards,
  findCardById,
  findCardsByPackage,
  findAvailableCardsByPackage,
  createCard,
  createCardsBatch,
  updateCard,
  reserveCard,
  releaseCard,
  markCardSold,
  deleteCard,
  getCardStats,
  cleanupExpiredReservations,
  deleteCardsByPackage,
} from "./queries/cards";

export const cardRouter = createRouter({
  list: adminQuery.query(async () => {
    return findAllCards();
  }),

  getById: adminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return findCardById(input.id);
    }),

  getByPackage: adminQuery
    .input(z.object({ packageId: z.number() }))
    .query(async ({ input }) => {
      return findCardsByPackage(input.packageId);
    }),

  getAvailable: adminQuery
    .input(z.object({ packageId: z.number() }))
    .query(async ({ input }) => {
      return findAvailableCardsByPackage(input.packageId);
    }),

  getStats: adminQuery
    .input(z.object({ packageId: z.number().optional() }))
    .query(async ({ input }) => {
      return getCardStats(input.packageId);
    }),

  create: adminQuery
    .input(
      z.object({
        packageId: z.number(),
        username: z.string().min(1),
        password: z.string().min(1),
        pdfSource: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createCard({
        ...input,
        status: "available",
      });
    }),

  createBatch: adminQuery
    .input(
      z.array(
        z.object({
          packageId: z.number(),
          username: z.string().min(1),
          password: z.string().min(1),
          pdfSource: z.string().optional(),
        })
      )
    )
    .mutation(async ({ input }) => {
      return createCardsBatch(
        input.map((card) => ({ ...card, status: "available" }))
      );
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        username: z.string().optional(),
        password: z.string().optional(),
        status: z
          .enum(["available", "reserved", "sold", "expired"])
          .optional(),
        pdfSource: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateCard(id, data);
    }),

  reserve: adminQuery
    .input(
      z.object({
        id: z.number(),
        orderId: z.number(),
        expiryMinutes: z.number().default(5),
      })
    )
    .mutation(async ({ input }) => {
      return reserveCard(input.id, input.orderId, input.expiryMinutes);
    }),

  release: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return releaseCard(input.id);
    }),

  markSold: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return markCardSold(input.id);
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteCard(input.id);
      return { success: true };
    }),

  deleteByPackage: adminQuery
    .input(z.object({ packageId: z.number() }))
    .mutation(async ({ input }) => {
      await deleteCardsByPackage(input.packageId);
      return { success: true };
    }),

  cleanupExpired: adminQuery.mutation(async () => {
    const count = await cleanupExpiredReservations();
    return { cleaned: count };
  }),
});
