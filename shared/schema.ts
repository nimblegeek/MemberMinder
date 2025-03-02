import { pgTable, text, serial, integer, boolean, date, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Address schema
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  municipality: z.string(), // Changed from state to municipality for Swedish standard
  postalCode: z.string(), // Changed from zip to postalCode for Swedish standard
});

// User schema for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters" }),
}).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  personnummer: text("ssn").notNull().unique(), // Same db column, but renamed in code for clarity
  dob: text("dob").notNull(),
  address: jsonb("address").notNull().$type<{
    street: string;
    city: string;
    municipality: string; // Changed from state to municipality
    postalCode: string; // Changed from zip to postalCode
  }>(),
  verified: boolean("verified").default(false),
  dateAdded: timestamp("date_added").defaultNow(),
});

// Base insert schema
export const insertMemberSchema = createInsertSchema(members).extend({
  // Add validation
  email: z.string().email({ message: "Invalid email address" }),
  // Swedish personnummer format YYMMDD-XXXX
  personnummer: z.string().regex(/^\d{6}-\d{4}$/, { message: "Personnummer must be in format YYMMDD-XXXX" }),
  // Swedish phone format +46 XX XXX XX XX or 07X-XXX XX XX
  phone: z.string().regex(/^(\+46\s\d{2}\s\d{3}\s\d{2}\s\d{2})|(\d{3}-\d{3}\s\d{2}\s\d{2})$/, 
    { message: "Phone must be in format +46 XX XXX XX XX or 07X-XXX XX XX" }),
  address: addressSchema,
}).omit({ id: true, dateAdded: true });

export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;
export type Address = z.infer<typeof addressSchema>;
