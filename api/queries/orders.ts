import { getDb } from "./connection";
import { orders } from "@db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import type { InsertOrder } from "@db/schema";

export async function findAllOrders() {
  return getDb().query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
    with: {
      package: true,
      card: true,
      gateway: true,
    },
  });
}

export async function findOrderById(id: number) {
  return getDb().query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      package: true,
      card: true,
      gateway: true,
      transactions: true,
    },
  });
}

export async function findOrderByNumber(orderNumber: string) {
  return getDb().query.orders.findFirst({
    where: eq(orders.orderNumber, orderNumber),
    with: {
      package: true,
      card: true,
      gateway: true,
      transactions: true,
    },
  });
}

export async function findOrdersByUser(userId: number) {
  return getDb().query.orders.findMany({
    where: eq(orders.userId, userId),
    orderBy: [desc(orders.createdAt)],
    with: {
      package: true,
      card: true,
    },
  });
}

export async function findOrdersByStatus(
  status: "pending" | "reserved" | "completed" | "cancelled" | "expired" | "failed"
) {
  return getDb().query.orders.findMany({
    where: eq(orders.status, status),
    orderBy: [desc(orders.createdAt)],
    with: {
      package: true,
      card: true,
    },
  });
}

export async function createOrder(data: InsertOrder) {
  const result = await getDb().insert(orders).values(data).$returningId();
  return findOrderById(result[0].id);
}

export async function updateOrder(
  id: number,
  data: Partial<InsertOrder>
) {
  await getDb()
    .update(orders)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(orders.id, id));
  return findOrderById(id);
}

export async function cancelOrder(id: number) {
  return updateOrder(id, { status: "cancelled" });
}

export async function completeOrder(id: number, cardId: number) {
  return updateOrder(id, {
    status: "completed",
    cardId,
    paidAt: new Date(),
  });
}

export async function deleteOrder(id: number) {
  await getDb().delete(orders).where(eq(orders.id, id));
}

export async function getOrdersByDateRange(
  from: Date,
  to: Date
) {
  return getDb()
    .select()
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, from),
        lte(orders.createdAt, to)
      )
    )
    .orderBy(desc(orders.createdAt));
}

export async function getOrderStats() {
  const db = getDb();
  const allOrders = await db.select().from(orders);

  const total = allOrders.length;
  const pending = allOrders.filter((o) => o.status === "pending").length;
  const reserved = allOrders.filter((o) => o.status === "reserved").length;
  const completed = allOrders.filter((o) => o.status === "completed").length;
  const cancelled = allOrders.filter((o) => o.status === "cancelled").length;
  const failed = allOrders.filter((o) => o.status === "failed").length;

  const totalRevenue = allOrders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + parseFloat(o.amount.toString()), 0);

  return {
    total,
    pending,
    reserved,
    completed,
    cancelled,
    failed,
    totalRevenue,
  };
}

export async function getDailyStats(days: number = 30) {
  const db = getDb();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const dailyOrders = await db
    .select()
    .from(orders)
    .where(gte(orders.createdAt, fromDate))
    .orderBy(orders.createdAt);

  const grouped = new Map<string, { count: number; revenue: number }>();

  for (const order of dailyOrders) {
    const date = order.createdAt.toISOString().split("T")[0];
    if (!grouped.has(date)) {
      grouped.set(date, { count: 0, revenue: 0 });
    }
    const current = grouped.get(date)!;
    current.count++;
    if (order.status === "completed") {
      current.revenue += parseFloat(order.amount.toString());
    }
  }

  return Array.from(grouped.entries()).map(([date, data]) => ({
    date,
    ...data,
  }));
}
