import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  findAllPackages,
  findPackageById,
  findPackageWithCards,
  createPackage,
  updatePackage,
  deletePackage,
  getPackageStats,
} from "./queries/packages";
import { getCardStats } from "./queries/cards";

export const packageRouter = createRouter({
  list: publicQuery.query(async () => {
    return findAllPackages();
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return findPackageById(input.id);
    }),

  getWithCards: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return findPackageWithCards(input.id);
    }),

  getStats: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getPackageStats(input.id);
    }),

  getAllStats: publicQuery.query(async () => {
    const allPackages = await findAllPackages();
    const stats = [];
    for (const pkg of allPackages) {
      const cardStats = await getCardStats(pkg.id);
      stats.push({
        package: pkg,
        stats: cardStats,
      });
    }
    return stats;
  }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.string().or(z.number()),
        speed: z.string().optional(),
        dataLimit: z.string().optional(),
        durationHours: z.number().min(1),
        color: z.string().optional(),
        icon: z.string().optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
        lowStockThreshold: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createPackage({
        ...input,
        price: input.price.toString(),
      });
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        price: z.string().or(z.number()).optional(),
        speed: z.string().optional(),
        dataLimit: z.string().optional(),
        durationHours: z.number().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
        lowStockThreshold: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updatePackage(id, {
        ...data,
        price: data.price?.toString(),
      });
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deletePackage(input.id);
      return { success: true };
    }),
});
