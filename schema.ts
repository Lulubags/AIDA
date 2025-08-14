import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  currentGrade: integer("current_grade").notNull(),
  currentSubject: text("current_subject").notNull(),
  questionsAsked: integer("questions_asked").notNull().default(0),
  studyTimeMinutes: integer("study_time_minutes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  grade: integer("grade").notNull(),
  subject: text("subject").notNull(),
  mediaType: text("media_type"), // 'text', 'image', 'video', 'diagram'
  mediaUrl: text("media_url"), // URL or path to media file
  mediaThumbnail: text("media_thumbnail"), // Thumbnail for videos/large images
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const curriculumDocuments = pgTable("curriculum_documents", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  grade: integer("grade").notNull(),
  subject: text("subject").notNull(),
  description: text("description"),
  content: text("content"), // Extracted text content
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  isActive: integer("is_active").notNull().default(1), // 1 for active, 0 for inactive
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertCurriculumDocumentSchema = createInsertSchema(curriculumDocuments).omit({
  id: true,
  uploadedAt: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertCurriculumDocument = z.infer<typeof insertCurriculumDocumentSchema>;
export type CurriculumDocument = typeof curriculumDocuments.$inferSelect;
