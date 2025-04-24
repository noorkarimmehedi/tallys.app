import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  shortId: text("short_id").notNull().unique(),
  published: boolean("published").default(false),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  questions: json("questions").$type<FormQuestion[]>().notNull(),
  theme: json("theme").$type<FormTheme>().notNull(),
});

export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull(),
  answers: json("answers").$type<FormResponse>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Form Types
export type FieldType = 
  | "shortText" 
  | "paragraph" 
  | "email" 
  | "multipleChoice" 
  | "fileUpload" 
  | "rating" 
  | "name" 
  | "address" 
  | "phone" 
  | "date" 
  | "number";

export interface FormQuestion {
  id: string;
  type: FieldType;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  maxRating?: number;
  variableName?: string;
}

export interface FormTheme {
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  fontFamily: string;
}

export interface FormResponse {
  [questionId: string]: string | string[] | number | null;
}

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertFormSchema = createInsertSchema(forms).omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
});

export const insertResponseSchema = createInsertSchema(responses).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertForm = z.infer<typeof insertFormSchema>;
export type Form = typeof forms.$inferSelect;

export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type Response = typeof responses.$inferSelect;
