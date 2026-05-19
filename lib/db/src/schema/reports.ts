import { pgTable, text, serial, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const urgencyEnum = pgEnum("urgency", ["low", "moderate", "high"]);
export const reportStatusEnum = pgEnum("report_status", ["pending", "processing", "complete"]);

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

export const insertReportSchema = createInsertSchema(reportsTable).omit({ id: true, createdAt: true });
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
