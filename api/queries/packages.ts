import { getDb } from "./connection";
import { packages } from "@db/schema";
import { eq, asc } from "drizzle-orm";
import type { InsertPackage } from "@db/schema";

export async function findAllPackages() {
  return getDb().query.packages.findMany({
    where: eq(packages.isActive, true),
    orderBy: [asc(packages.sortOrder)],
  });
}

export async function findPackageById(id: number) {
  return getDb().query.packages.findFirst({
    where: eq(packages.id, id),
  });
}

export async function findPackageWithCards(id: number) {
  return getDb().query.packages.findFirst({
    where: eq(packages.id, id),
    with: {
      cards: true,
    },
  });
}

export async function createPackage(data: InsertPackage) {
  const result = await getDb().insert(packages).values(data).$returningId();
  return findPackageById(result[0].id);
}

export async function updatePackage(id: number, data: Partial<InsertPackage>) {
  await getDb()
    .update(packages)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(packages.id, id));
  return findPackageById(id);
}

export async function deletePackage(id: number) {
  await getDb().delete(packages).where(eq(packages.id, id));
}

export async function getPackageStats(packageId: number) {
  const pkg = await findPackageWithCards(packageId);
  if (!pkg) return null;

  const availableCards = pkg.cards.filter((c) => c.status === "available").length;
  const soldCards = pkg.cards.filter((c) => c.status === "sold").length;
  const reservedCards = pkg.cards.filter((c) => c.status === "reserved").length;
  const totalCards = pkg.cards.length;

  return {
    package: pkg,
    stats: {
      total: totalCards,
      available: availableCards,
      sold: soldCards,
      reserved: reservedCards,
      lowStock: pkg.lowStockThreshold
        ? availableCards <= pkg.lowStockThreshold
        : false,
    },
  };
}
