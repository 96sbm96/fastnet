import { getDb } from "./connection";
import { paymentGateways } from "@db/schema";
import { eq } from "drizzle-orm";
import type { InsertPaymentGateway } from "@db/schema";

export async function findAllGateways() {
  return getDb().query.paymentGateways.findMany({
    orderBy: (gateways, { asc }) => [asc(gateways.sortOrder)],
  });
}

export async function findActiveGateways() {
  return getDb().query.paymentGateways.findMany({
    where: eq(paymentGateways.isActive, true),
    orderBy: (gateways, { asc }) => [asc(gateways.sortOrder)],
  });
}

export async function findGatewayById(id: number) {
  return getDb().query.paymentGateways.findFirst({
    where: eq(paymentGateways.id, id),
  });
}

export async function findGatewayByCode(code: string) {
  return getDb().query.paymentGateways.findFirst({
    where: eq(paymentGateways.code, code),
  });
}

export async function createGateway(data: InsertPaymentGateway) {
  const result = await getDb()
    .insert(paymentGateways)
    .values(data)
    .$returningId();
  return findGatewayById(result[0].id);
}

export async function updateGateway(
  id: number,
  data: Partial<InsertPaymentGateway>
) {
  await getDb()
    .update(paymentGateways)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(paymentGateways.id, id));
  return findGatewayById(id);
}

export async function deleteGateway(id: number) {
  await getDb().delete(paymentGateways).where(eq(paymentGateways.id, id));
}
