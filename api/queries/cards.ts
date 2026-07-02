import { getDb } from "./connection";
import { cards } from "@db/schema";
import { eq, and, lt } from "drizzle-orm";
import type { InsertCard } from "@db/schema";

export async function findAllCards() {
  return getDb().query.cards.findMany({
    with: { package: true },
  });
}

export async function findCardById(id: number) {
  return getDb().query.cards.findFirst({
    where: eq(cards.id, id),
    with: { package: true },
  });
}

export async function findCardsByPackage(packageId: number) {
  return getDb().query.cards.findMany({
    where: eq(cards.packageId, packageId),
    with: { package: true },
  });
}

export async function findAvailableCardsByPackage(packageId: number) {
  return getDb().query.cards.findMany({
    where: and(
      eq(cards.packageId, packageId),
      eq(cards.status, "available")
    ),
  });
}

export async function findAvailableCard(packageId: number) {
  return getDb().query.cards.findFirst({
    where: and(
      eq(cards.packageId, packageId),
      eq(cards.status, "available")
    ),
  });
}

export async function createCard(data: InsertCard) {
  const result = await getDb().insert(cards).values(data).$returningId();
  return findCardById(result[0].id);
}

export async function createCardsBatch(data: InsertCard[]) {
  if (data.length === 0) return [];
  const result = await getDb().insert(cards).values(data).$returningId();
  return result;
}

export async function updateCard(id: number, data: Partial<InsertCard>) {
  await getDb()
    .update(cards)
    .set(data)
    .where(eq(cards.id, id));
  return findCardById(id);
}

export async function reserveCard(
  id: number,
  orderId: number,
  expiryMinutes: number = 5
) {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + expiryMinutes);

  await getDb()
    .update(cards)
    .set({
      status: "reserved",
      orderId,
      reservationExpiry: expiry,
    })
    .where(eq(cards.id, id));

  return findCardById(id);
}

export async function releaseCard(id: number) {
  await getDb()
    .update(cards)
    .set({
      status: "available",
      orderId: null,
      reservationExpiry: null,
    })
    .where(eq(cards.id, id));
  return findCardById(id);
}

export async function markCardSold(id: number) {
  await getDb()
    .update(cards)
    .set({
      status: "sold",
      soldAt: new Date(),
      reservationExpiry: null,
    })
    .where(eq(cards.id, id));
  return findCardById(id);
}

export async function deleteCard(id: number) {
  await getDb().delete(cards).where(eq(cards.id, id));
}

export async function getCardStats(packageId?: number) {
  const db = getDb();
  const conditions = packageId
    ? and(eq(cards.packageId, packageId))
    : undefined;

  const allCards = conditions
    ? await db.select().from(cards).where(conditions)
    : await db.select().from(cards);

  const total = allCards.length;
  const available = allCards.filter((c) => c.status === "available").length;
  const reserved = allCards.filter((c) => c.status === "reserved").length;
  const sold = allCards.filter((c) => c.status === "sold").length;
  const expired = allCards.filter((c) => c.status === "expired").length;

  // Get package low stock threshold if packageId is provided
  let lowStock = false;
  if (packageId) {
    const { packages } = await import("@db/schema");
    const db = getDb();
    const pkg = await db.query.packages.findFirst({
      where: eq(packages.id, packageId),
    });
    if (pkg?.lowStockThreshold) {
      lowStock = available <= pkg.lowStockThreshold;
    }
  }

  return { total, available, reserved, sold, expired, lowStock };
}

export async function cleanupExpiredReservations() {
  const now = new Date();
  const expired = await getDb()
    .select()
    .from(cards)
    .where(
      and(
        eq(cards.status, "reserved"),
        lt(cards.reservationExpiry, now)
      )
    );

  for (const card of expired) {
    await releaseCard(card.id);
  }

  return expired.length;
}

export async function deleteCardsByPackage(packageId: number) {
  await getDb()
    .delete(cards)
    .where(eq(cards.packageId, packageId));
}
