import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  findAllSettings,
  findSettingsByGroup,
  findSettingByKey,
  getSettingValue,
  setSetting,
  deleteSetting,
} from "./queries/settings";

export const settingsRouter = createRouter({
  list: adminQuery.query(async () => {
    return findAllSettings();
  }),

  byGroup: adminQuery
    .input(z.object({ group: z.string() }))
    .query(async ({ input }) => {
      return findSettingsByGroup(input.group);
    }),

  getByKey: publicQuery
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      return findSettingByKey(input.key);
    }),

  getValue: publicQuery
    .input(
      z.object({
        key: z.string(),
        defaultValue: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return getSettingValue(input.key, input.defaultValue);
    }),

  set: adminQuery
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
        group: z.string().default("general"),
        isEncrypted: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      return setSetting(input.key, input.value, input.group, input.isEncrypted);
    }),

  setBulk: adminQuery
    .input(
      z.array(
        z.object({
          key: z.string(),
          value: z.string(),
          group: z.string().default("general"),
          isEncrypted: z.boolean().default(false),
        })
      )
    )
    .mutation(async ({ input }) => {
      const results = [];
      for (const item of input) {
        const result = await setSetting(
          item.key,
          item.value,
          item.group,
          item.isEncrypted
        );
        results.push(result);
      }
      return results;
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteSetting(input.id);
      return { success: true };
    }),
});
