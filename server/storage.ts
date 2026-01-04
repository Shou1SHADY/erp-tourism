import { db } from "./db";
import {
  users, tours, customers, bookings, payments,
  type User, type InsertUser,
  type Tour, type InsertTour,
  type Customer, type InsertCustomer,
  type Booking, type InsertBooking,
  type Payment, type InsertPayment
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Tours
  getTours(): Promise<Tour[]>;
  getTour(id: number): Promise<Tour | undefined>;
  createTour(tour: InsertTour): Promise<Tour>;
  updateTour(id: number, tour: Partial<InsertTour>): Promise<Tour | undefined>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;

  // Bookings
  getBookings(): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined>;

  // Payments
  getPayments(): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!db) throw new Error("Database not initialized");
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Tours
  async getTours(): Promise<Tour[]> {
    if (!db) throw new Error("Database not initialized");
    return await db.select().from(tours);
  }

  async getTour(id: number): Promise<Tour | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [tour] = await db.select().from(tours).where(eq(tours.id, id));
    return tour;
  }

  async createTour(insertTour: InsertTour): Promise<Tour> {
    if (!db) throw new Error("Database not initialized");
    // Explicitly handle images array to avoid type issues with jsonb
    const [tour] = await db.insert(tours).values({
      ...insertTour,
      images: insertTour.images as any
    }).returning();
    return tour;
  }

  async updateTour(id: number, updates: Partial<InsertTour>): Promise<Tour | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [updated] = await db.update(tours).set({
      ...updates,
      images: updates.images as any
    }).where(eq(tours.id, id)).returning();
    return updated;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    if (!db) throw new Error("Database not initialized");
    return await db.select().from(customers);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    if (!db) throw new Error("Database not initialized");
    const [customer] = await db.insert(customers).values(insertCustomer).returning();
    return customer;
  }

  // Bookings
  async getBookings(): Promise<Booking[]> {
    if (!db) throw new Error("Database not initialized");
    return await db.select().from(bookings);
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    if (!db) throw new Error("Database not initialized");
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }

  async updateBooking(id: number, updates: Partial<InsertBooking>): Promise<Booking | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [updated] = await db.update(bookings).set(updates).where(eq(bookings.id, id)).returning();
    return updated;
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    if (!db) throw new Error("Database not initialized");
    return await db.select().from(payments);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    if (!db) throw new Error("Database not initialized");
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }
}

export class MemStorage implements IStorage {
  private users = new Map<number, User>();
  private tours = new Map<number, Tour>();
  private customers = new Map<number, Customer>();
  private bookings = new Map<number, Booking>();
  private payments = new Map<number, Payment>();
  private nextId = { user: 1, tour: 1, customer: 1, booking: 1, payment: 1 };

  constructor() {
    console.log("Initializing In-Memory Storage (MemStorage)...");
    this.seed();
  }

  private seed() {
    const tour1Id = this.nextId.tour++;
    this.tours.set(tour1Id, {
      id: tour1Id,
      title: "Pyramids of Giza & Sphinx",
      description: "Explore the ancient wonders of the world with an expert guide. Includes entry fees and lunch.",
      basePrice: 15000,
      currency: "USD",
      durationDays: 1,
      capacity: 20,
      isActive: true,
      images: ["https://images.unsplash.com/photo-1503177119275-0aa32b3a9368"],
      createdAt: new Date()
    });

    const tour2Id = this.nextId.tour++;
    this.tours.set(tour2Id, {
      id: tour2Id,
      title: "Nile Cruise - Luxor to Aswan",
      description: "4-day luxury cruise along the Nile river. Visit Karnak, Valley of the Kings, and Edfu.",
      basePrice: 80000,
      currency: "USD",
      durationDays: 4,
      capacity: 50,
      isActive: true,
      images: ["https://images.unsplash.com/photo-1539650116455-251d9a04a521"],
      createdAt: new Date()
    });

    const customer1Id = this.nextId.customer++;
    this.customers.set(customer1Id, {
      id: customer1Id,
      fullName: "Alice Smith",
      email: "alice@example.com",
      phone: "+15550199",
      nationality: "USA",
      notes: "Allergic to peanuts",
      passportDetails: { number: "A12345678", expiry: "2030-01-01" },
      createdAt: new Date()
    });

    const booking1Id = this.nextId.booking++;
    this.bookings.set(booking1Id, {
      id: booking1Id,
      customerId: customer1Id,
      tourId: tour1Id,
      bookingDate: new Date(),
      travelDate: new Date("2024-12-01"),
      headCount: 2,
      totalAmount: 30000,
      status: "confirmed",
      notes: "Pickup from hotel at 8 AM"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextId.user++;
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role ?? 'sales',
      email: insertUser.email ?? null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getTours(): Promise<Tour[]> {
    return Array.from(this.tours.values());
  }

  async getTour(id: number): Promise<Tour | undefined> {
    return this.tours.get(id);
  }

  async createTour(insertTour: InsertTour): Promise<Tour> {
    const id = this.nextId.tour++;
    const tour: Tour = {
      ...insertTour,
      id,
      isActive: insertTour.isActive ?? true,
      currency: insertTour.currency ?? 'USD',
      images: (insertTour.images as string[]) || null,
      createdAt: new Date()
    };
    this.tours.set(id, tour);
    return tour;
  }

  async updateTour(id: number, updates: Partial<InsertTour>): Promise<Tour | undefined> {
    const tour = this.tours.get(id);
    if (!tour) return undefined;
    const updated: Tour = {
      ...tour,
      ...updates,
      images: (updates.images as string[]) ?? tour.images
    };
    this.tours.set(id, updated);
    return updated;
  }

  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.nextId.customer++;
    const customer: Customer = {
      ...insertCustomer,
      id,
      phone: insertCustomer.phone ?? null,
      nationality: insertCustomer.nationality ?? null,
      passportDetails: (insertCustomer.passportDetails as any) ?? null,
      notes: insertCustomer.notes ?? null,
      createdAt: new Date()
    };
    this.customers.set(id, customer);
    return customer;
  }

  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.nextId.booking++;
    const booking: Booking = {
      ...insertBooking,
      id,
      bookingDate: new Date(),
      status: insertBooking.status ?? 'pending',
      headCount: insertBooking.headCount ?? 1,
      notes: insertBooking.notes ?? null
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: number, updates: Partial<InsertBooking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    const updated = { ...booking, ...updates };
    this.bookings.set(id, updated);
    return updated;
  }

  async getPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.nextId.payment++;
    const payment: Payment = {
      ...insertPayment,
      id,
      paymentDate: new Date(),
      status: insertPayment.status ?? 'pending',
      currency: insertPayment.currency ?? 'USD',
      transactionRef: insertPayment.transactionRef ?? null
    };
    this.payments.set(id, payment);
    return payment;
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
