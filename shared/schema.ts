import { pgTable, text, serial, integer, boolean, date, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Address schema
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
});

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  ssn: text("ssn").notNull().unique(),
  dob: text("dob").notNull(),
  address: jsonb("address").notNull().$type<{
    street: string;
    city: string;
    state: string;
    zip: string;
  }>(),
  verified: boolean("verified").default(false),
  dateAdded: timestamp("date_added").defaultNow(),
});

// Base insert schema
export const insertMemberSchema = createInsertSchema(members).extend({
  // Add validation
  email: z.string().email({ message: "Invalid email address" }),
  ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/, { message: "SSN must be in format XXX-XX-XXXX" }),
  phone: z.string().regex(/^\d{3}-\d{3}-\d{4}$/, { message: "Phone must be in format XXX-XXX-XXXX" }),
  address: addressSchema,
}).omit({ id: true, dateAdded: true });

export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;
export type Address = z.infer<typeof addressSchema>;
