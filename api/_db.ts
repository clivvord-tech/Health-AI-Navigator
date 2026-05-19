import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { pgTable, text, serial, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";

const { Pool } = pg;

export const urgencyEnum = pgEnum("urgency", ["low", "moderate", "high"]);
export const reportStatusEnum = pgEnum("report_status", ["pending", "processing", "complete"]);
export const roleEnum = pgEnum("chat_role", ["user", "assistant"]);

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("anonymous"),
  title: text("title").notNull(),
  originalText: text("original_text"),
  simplifiedExplanation: text("simplified_explanation"),
  urgency: urgencyEnum("urgency").notNull().default("low"),
  status: reportStatusEnum("status").notNull().default("pending"),
  recommendedNextSteps: text("recommended_next_steps"),
  medicalTermsBreakdown: text("medical_terms_breakdown"),
  reportType: text("report_type"),
  bodyPart: text("body_part"),
  shareToken: text("share_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessagesTable = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("anonymous"),
  reportId: integer("report_id"),
  role: roleEnum("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    _db = drizzle(pool, { schema: { reportsTable, chatMessagesTable } });
  }
  return _db;
}
