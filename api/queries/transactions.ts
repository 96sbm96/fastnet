import { getDb } from "./connection";
import { gatewayTransactions } from "@db/schema";
import { eq, desc } from "drizzle-orm";
// import type { InsertGatewayTransaction } from "@db/schema";

export async function findAllTransactions() {
  return getDb().query.gatewayTransactions.findMany({
    orderBy: [desc(gatewayTransactions.createdAt)],
    with: {
      order: true,
      gateway: true,
    },
  });
}

export async function findTransactionById(id: number) {
  return getDb().query.gatewayTransactions.findFirst({
    where: eq(gatewayTransactions.id, id),
    with: {
      order: true,
      gateway: true,
    },
  });
}

export async function findTransactionsByOrder(orderId: number) {
  return getDb().query.gatewayTransactions.findMany({
    where: eq(gatewayTransactions.orderId, orderId),
    orderBy: [desc(gatewayTransactions.createdAt)],
  });
}

export async function findTransactionsByGateway(gatewayId: number) {
  return getDb().query.gatewayTransactions.findMany({
    where: eq(gatewayTransactions.gatewayId, gatewayId),
    orderBy: [desc(gatewayTransactions.createdAt)],
  });
}

export async function findTransactionByIdempotencyKey(key: string) {
  return getDb().query.gatewayTransactions.findFirst({
    where: eq(gatewayTransactions.idempotencyKey, key),
  });
}

export async function createTransaction(data: any) {
  const result = await getDb()
    .insert(gatewayTransactions)
    .values(data)
    .$returningId();
  return findTransactionById(result[0].id);
}

export async function updateTransaction(
  id: number,
  data: any
) {
  await getDb()
    .update(gatewayTransactions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(gatewayTransactions.id, id));
  return findTransactionById(id);
}
