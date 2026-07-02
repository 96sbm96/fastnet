import { getDb } from "./connection";
import { systemSettings } from "@db/schema";
import { eq } from "drizzle-orm";
// import type { InsertSystemSetting } from "@db/schema";

export async function findAllSettings() {
  return getDb().query.systemSettings.findMany();
}

export async function findSettingsByGroup(group: string) {
  return getDb().query.systemSettings.findMany({
    where: eq(systemSettings.group, group),
  });
}

export async function findSettingByKey(key: string) {
  return getDb().query.systemSettings.findFirst({
    where: eq(systemSettings.key, key),
  });
}

export async function getSettingValue(key: string, defaultValue?: string) {
  const setting = await findSettingByKey(key);
  return setting?.value ?? defaultValue ?? null;
}

export async function setSetting(
  key: string,
  value: string,
  group: string = "general",
  isEncrypted: boolean = false
) {
  const existing = await findSettingByKey(key);
  if (existing) {
    await getDb()
      .update(systemSettings)
      .set({ value, isEncrypted, updatedAt: new Date() })
      .where(eq(systemSettings.key, key));
    return findSettingByKey(key);
  }
  const result = await getDb()
    .insert(systemSettings)
    .values({ key, value, group, isEncrypted })
    .$returningId();
  return findSettingById(result[0].id);
}

export async function findSettingById(id: number) {
  return getDb().query.systemSettings.findFirst({
    where: eq(systemSettings.id, id),
  });
}

export async function deleteSetting(id: number) {
  await getDb().delete(systemSettings).where(eq(systemSettings.id, id));
}
