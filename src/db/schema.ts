import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ── کاربران ─────────────────────────────────────────────
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone").notNull(),
    role: text("role").$type<"admin" | "customer">().notNull().default("customer"),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_phone_unique").on(t.phone)]
);

// ── نشست‌ها (Sanctum-like tokens) ────────────────────────
export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    token: text("token").notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("sessions_token_unique").on(t.token)]
);

// ── سازمان‌ها ────────────────────────────────────────────
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  organizationType: text("organization_type"),
  registrationNumber: text("registration_number"),
  economicCode: text("economic_code"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  status: text("status")
    .$type<"pending" | "approved" | "rejected">()
    .notNull()
    .default("pending"),
  createdBy: integer("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── درخواست‌های خدمات (هسته سیستم) ──────────────────────
export const serviceRequests = pgTable(
  "service_requests",
  {
    id: serial("id").primaryKey(),
    trackingCode: text("tracking_code").notNull(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    organizationId: integer("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    requestType: text("request_type")
      .$type<"personal" | "organization" | "municipal">()
      .notNull()
      .default("personal"),
    status: text("status")
      .$type<
        | "new"
        | "under_review"
        | "contacted"
        | "meeting_scheduled"
        | "proposal_sent"
        | "contracted"
        | "in_production"
        | "completed"
        | "cancelled"
      >()
      .notNull()
      .default("new"),
    priority: text("priority")
      .$type<"normal" | "high" | "urgent">()
      .notNull()
      .default("normal"),
    contactName: text("contact_name").notNull(),
    contactPhone: text("contact_phone").notNull(),
    contactEmail: text("contact_email"),
    desiredDeliveryDate: date("desired_delivery_date"),
    needsConsultation: boolean("needs_consultation").notNull().default(true),
    needsDesign: boolean("needs_design").notNull().default(false),
    needsInstallation: boolean("needs_installation").notNull().default(false),
    needsPermitFollowup: boolean("needs_permit_followup").notNull().default(false),
    description: text("description"),
    // فقط برای مدیران؛ هرگز به کاربر برنمی‌گردد.
    adminNotes: text("admin_notes"),
    meetingScheduledAt: timestamp("meeting_scheduled_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("service_requests_tracking_unique").on(t.trackingCode),
    index("service_requests_status_created_idx").on(t.status, t.createdAt),
    index("service_requests_org_status_idx").on(t.organizationId, t.status),
  ]
);

// ── آیتم‌های هر درخواست ─────────────────────────────────
export const serviceRequestItems = pgTable("service_request_items", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id")
    .notNull()
    .references(() => serviceRequests.id, { onDelete: "cascade" }),
  category: text("category")
    .$type<
      | "banner"
      | "billboard"
      | "urban_advertising"
      | "poster"
      | "brochure"
      | "catalog"
      | "sticker"
      | "signage"
      | "graphic_design"
      | "other"
    >()
    .notNull(),
  title: text("title").notNull(),
  quantity: integer("quantity").notNull().default(1),
  width: numeric("width", { precision: 10, scale: 2 }),
  height: numeric("height", { precision: 10, scale: 2 }),
  dimensionUnit: text("dimension_unit").$type<"cm" | "m">().notNull().default("cm"),
  material: text("material"),
  installationLocation: text("installation_location"),
  installationAddress: text("installation_address"),
  requiresPermit: boolean("requires_permit").notNull().default(false),
  requiresInstallationTeam: boolean("requires_installation_team").notNull().default(false),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── گفت‌وگوی اختصاصی هر درخواست ─────────────────────────
export const requestMessages = pgTable("request_messages", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id")
    .notNull()
    .references(() => serviceRequests.id, { onDelete: "cascade" }),
  senderId: integer("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  senderRole: text("sender_role").$type<"admin" | "customer">().notNull(),
  message: text("message").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type ServiceRequestItem = typeof serviceRequestItems.$inferSelect;
export type RequestMessage = typeof requestMessages.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
