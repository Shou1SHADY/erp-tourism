import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'sales', 'operations', 'accountant']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'cancelled', 'completed']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed', 'refunded']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'paypal', 'paymob', 'bank_transfer']);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").default('sales').notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tours = pgTable("tours", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  basePrice: integer("base_price").notNull(), // stored in cents
  currency: text("currency").default('USD').notNull(),
  durationDays: integer("duration_days").notNull(),
  capacity: integer("capacity").notNull(),
  isActive: boolean("is_active").default(true),
  images: jsonb("images").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  nationality: text("nationality"),
  passportDetails: jsonb("passport_details").$type<{number: string, expiry: string}>(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  tourId: integer("tour_id").notNull(),
  bookingDate: timestamp("booking_date").defaultNow(),
  travelDate: timestamp("travel_date").notNull(),
  headCount: integer("head_count").default(1).notNull(),
  totalAmount: integer("total_amount").notNull(), // cents
  status: bookingStatusEnum("status").default('pending').notNull(),
  notes: text("notes"),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  amount: integer("amount").notNull(), // cents
  currency: text("currency").default('USD').notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").default('pending').notNull(),
  transactionRef: text("transaction_ref"),
  paymentDate: timestamp("payment_date").defaultNow(),
});

// Relations
export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  customer: one(customers, { fields: [bookings.customerId], references: [customers.id] }),
  tour: one(tours, { fields: [bookings.tourId], references: [tours.id] }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, { fields: [payments.bookingId], references: [bookings.id] }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertTourSchema = createInsertSchema(tours).omit({ id: true, createdAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, bookingDate: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, paymentDate: true });

export type User = typeof users.$inferSelect;
export type Tour = typeof tours.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Payment = typeof payments.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTour = z.infer<typeof insertTourSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
