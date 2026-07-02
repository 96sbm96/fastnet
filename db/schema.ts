import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  int,
  bigint,
  mysqlEnum,
  boolean,
  decimal,
  json,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ==================== المستخدمون والأدوار ====================
export const users = mysqlTable(
  "users",
  {
    id: serial("id").primaryKey(),
    unionId: varchar("unionId", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 320 }),
    avatar: text("avatar"),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    phone: varchar("phone", { length: 50 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
  },
  (table) => ({
    unionIdIdx: uniqueIndex("unionId_idx").on(table.unionId),
    roleIdx: index("role_idx").on(table.role),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ==================== الباقات ====================
export const packages = mysqlTable(
  "packages",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    speed: varchar("speed", { length: 100 }),
    dataLimit: varchar("data_limit", { length: 100 }),
    durationHours: int("duration_hours").notNull(),
    color: varchar("color", { length: 50 }).default("#3b82f6"),
    icon: varchar("icon", { length: 100 }).default("wifi"),
    sortOrder: int("sort_order").default(0),
    isActive: boolean("is_active").default(true).notNull(),
    lowStockThreshold: int("low_stock_threshold").default(10),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    activeIdx: index("pkg_active_idx").on(table.isActive),
    sortIdx: index("pkg_sort_idx").on(table.sortOrder),
  })
);

export type Package = typeof packages.$inferSelect;
export type InsertPackage = typeof packages.$inferInsert;

// ==================== الكروت ====================
export const cards = mysqlTable(
  "cards",
  {
    id: serial("id").primaryKey(),
    packageId: bigint("packageId", { mode: "number", unsigned: true })
      .notNull(),
    username: varchar("username", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    status: mysqlEnum("status", [
      "available",
      "reserved",
      "sold",
      "expired",
    ])
      .default("available")
      .notNull(),
    pdfSource: varchar("pdf_source", { length: 255 }),
    reservationExpiry: timestamp("reservation_expiry"),
    orderId: bigint("orderId", { mode: "number", unsigned: true }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    soldAt: timestamp("sold_at"),
  },
  (table) => ({
    pkgStatusIdx: index("card_pkg_status_idx").on(table.packageId, table.status),
    usernameIdx: uniqueIndex("card_username_idx").on(table.username),
    statusIdx: index("card_status_idx").on(table.status),
  })
);

export type Card = typeof cards.$inferSelect;
export type InsertCard = typeof cards.$inferInsert;

// ==================== الطلبات ====================
export const orders = mysqlTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
    userId: bigint("userId", { mode: "number", unsigned: true }),
    packageId: bigint("packageId", { mode: "number", unsigned: true }).notNull(),
    cardId: bigint("cardId", { mode: "number", unsigned: true }),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    status: mysqlEnum("status", [
      "pending",
      "reserved",
      "completed",
      "cancelled",
      "expired",
      "failed",
    ])
      .default("pending")
      .notNull(),
    gatewayId: bigint("gatewayId", { mode: "number", unsigned: true }),
    customerName: varchar("customer_name", { length: 255 }),
    customerPhone: varchar("customer_phone", { length: 50 }),
    customerEmail: varchar("customer_email", { length: 320 }),
    macAddress: varchar("mac_address", { length: 50 }),
    ipAddress: varchar("ip_address", { length: 50 }),
    routerIdentity: varchar("router_identity", { length: 255 }),
    hotspotInterface: varchar("hotspot_interface", { length: 100 }),
    redirectUrl: text("redirect_url"),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    orderNumIdx: uniqueIndex("order_num_idx").on(table.orderNumber),
    userIdx: index("order_user_idx").on(table.userId),
    statusIdx: index("order_status_idx").on(table.status),
    createdIdx: index("order_created_idx").on(table.createdAt),
  })
);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ==================== بوابات الدفع ====================
export const paymentGateways = mysqlTable(
  "payment_gateways",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    displayNameAr: varchar("display_name_ar", { length: 255 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isSandbox: boolean("is_sandbox").default(true).notNull(),
    apiKey: text("api_key"),
    apiSecret: text("api_secret"),
    merchantId: varchar("merchant_id", { length: 255 }),
    baseUrl: text("base_url"),
    sandboxUrl: text("sandbox_url"),
    webhookSecret: text("webhook_secret"),
    config: json("config"),
    sortOrder: int("sort_order").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    codeIdx: uniqueIndex("gateway_code_idx").on(table.code),
    activeIdx: index("gateway_active_idx").on(table.isActive),
  })
);

export type PaymentGateway = typeof paymentGateways.$inferSelect;
export type InsertPaymentGateway = typeof paymentGateways.$inferInsert;

// ==================== معاملات الدفع ====================
export const gatewayTransactions = mysqlTable(
  "gateway_transactions",
  {
    id: serial("id").primaryKey(),
    orderId: bigint("orderId", { mode: "number", unsigned: true }).notNull(),
    gatewayId: bigint("gatewayId", { mode: "number", unsigned: true }).notNull(),
    transactionRef: varchar("transaction_ref", { length: 255 }),
    gatewayRef: varchar("gateway_ref", { length: 255 }),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    status: mysqlEnum("status", [
      "pending",
      "success",
      "failed",
      "cancelled",
      "refunded",
    ])
      .default("pending")
      .notNull(),
    requestPayload: json("request_payload"),
    responsePayload: json("response_payload"),
    idempotencyKey: varchar("idempotency_key", { length: 255 }),
    processedAt: timestamp("processed_at"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    orderIdx: index("txn_order_idx").on(table.orderId),
    gatewayIdx: index("txn_gateway_idx").on(table.gatewayId),
    idempotencyIdx: uniqueIndex("txn_idempotency_idx").on(table.idempotencyKey),
  })
);

export type GatewayTransaction = typeof gatewayTransactions.$inferSelect;
export type InsertGatewayTransaction = typeof gatewayTransactions.$inferInsert;

// ==================== سجلات الـ Webhook ====================
export const webhookLogs = mysqlTable(
  "webhook_logs",
  {
    id: serial("id").primaryKey(),
    gatewayId: bigint("gatewayId", { mode: "number", unsigned: true }).notNull(),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    payload: json("payload"),
    signature: text("signature"),
    signatureValid: boolean("signature_valid").default(false),
    headers: json("headers"),
    ipAddress: varchar("ip_address", { length: 50 }),
    processedAt: timestamp("processed_at"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    gatewayIdx: index("wh_gateway_idx").on(table.gatewayId),
    eventIdx: index("wh_event_idx").on(table.eventType),
    createdIdx: index("wh_created_idx").on(table.createdAt),
  })
);

export type WebhookLog = typeof webhookLogs.$inferSelect;

// ==================== سجل النشاط ====================
export const activityLogs = mysqlTable(
  "activity_logs",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }),
    entityId: bigint("entityId", { mode: "number", unsigned: true }),
    details: json("details"),
    ipAddress: varchar("ip_address", { length: 50 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("act_user_idx").on(table.userId),
    actionIdx: index("act_action_idx").on(table.action),
    createdIdx: index("act_created_idx").on(table.createdAt),
  })
);

export type ActivityLog = typeof activityLogs.$inferSelect;

// ==================== إعدادات النظام ====================
export const systemSettings = mysqlTable(
  "system_settings",
  {
    id: serial("id").primaryKey(),
    key: varchar("key", { length: 255 }).notNull().unique(),
    value: text("value"),
    group: varchar("group", { length: 100 }).default("general"),
    isEncrypted: boolean("is_encrypted").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    keyIdx: uniqueIndex("setting_key_idx").on(table.key),
  })
);

export type SystemSetting = typeof systemSettings.$inferSelect;

// ==================== الإشعارات ====================
export const notifications = mysqlTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message"),
    type: mysqlEnum("type", ["info", "success", "warning", "error"])
      .default("info")
      .notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    data: json("data"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("notif_user_idx").on(table.userId),
    readIdx: index("notif_read_idx").on(table.isRead),
  })
);

export type Notification = typeof notifications.$inferSelect;
