import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password"), // Make password optional for Firebase users
  firebaseId: text("firebase_id").unique(), // Firebase UID
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  lastLogin: timestamp("last_login"),
  
  // Subscription-related fields
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("trial"),
  trialEndsAt: timestamp("trial_ends_at"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
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
  sections: json("sections").$type<FormSection[]>().default([]).notNull(),
  theme: json("theme").$type<FormTheme>().notNull(),
  metadata: json("metadata").$type<{infoDescription?: string}>().default({}).notNull(),
});

export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull(),
  answers: json("answers").$type<FormResponse>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  shortId: text("short_id").notNull().unique(),
  duration: integer("duration").notNull(), // Duration in minutes
  location: text("location"),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  availableTimes: json("available_times").$type<EventAvailability[]>().default([]).notNull(),
  weeklySchedule: text("weekly_schedule"), // JSON string of weekly availability
  theme: json("theme").$type<FormTheme>().default({
    backgroundColor: '#ffffff',
    textColor: '#000000',
    primaryColor: '#3b82f6',
    fontFamily: 'Inter, sans-serif'
  }),
  metadata: json("metadata").$type<{infoDescription?: string}>().default({}).notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  status: text("status").default("confirmed").notNull(), // confirmed, canceled, rescheduled
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

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface FormQuestion {
  id: string;
  type: FieldType;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  maxRating?: number;
  variableName?: string;
  sectionId?: string; // Reference to parent section
}

export interface FormTheme {
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  fontFamily: string;
  logoUrl?: string;
}

export interface FormResponse {
  [questionId: string]: string | string[] | number | null;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface EventAvailability {
  date: string; // ISO date string
  timeSlots: TimeSlot[];
}

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  lastLogin: true,
}).extend({
  // Make password optional for Firebase users
  password: z.string().min(6).optional(),
  // Add Firebase fields
  firebaseId: z.string().optional(),
  displayName: z.string().optional(),
  photoURL: z.string().optional(),
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

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
}).extend({
  // Make sure date can be parsed from both string and Date
  date: z.preprocess(
    (val) => val instanceof Date ? val : new Date(String(val)),
    z.date()
  )
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertForm = z.infer<typeof insertFormSchema>;
export type Form = typeof forms.$inferSelect;

export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type Response = typeof responses.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
