import {
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", [
  "dikirim",
  "psikotes",
  "wawancara",
  "diterima",
  "ditolak",
]);

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicationNumber: integer("application_number")
      .generatedByDefaultAsIdentity()
      .notNull()
      .unique(),
    company: text("company").notNull(),
    position: text("position").notNull(),
    jobUrl: text("job_url"),
    appliedAt: date("applied_at").notNull(),
    reminderAt: timestamp("reminder_at", { withTimezone: true }),
    status: statusEnum("status").notNull().default("dikirim"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("applications_status_idx").on(table.status),
    index("applications_applied_at_idx").on(table.appliedAt),
  ],
);

export type Application = typeof applications.$inferSelect;
