import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal.js";
import { getPaymobAuthToken, createPaymobOrder, getPaymentKey, getPaymobIframeUrl } from "./paymob";
import { insertTourSchema, insertCustomerSchema, insertBookingSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Paymob Routes
  app.post("/api/paymob/setup", async (req, res) => {
    try {
      const { amountCents, currency, customer } = req.body;
      const authToken = await getPaymobAuthToken();
      const order = await createPaymobOrder(authToken, amountCents, currency);
      const paymentKey = await getPaymentKey(authToken, order.id, amountCents, currency, {
        email: customer.email,
        first_name: customer.firstName,
        last_name: customer.lastName,
        phone_number: customer.phone,
      });
      const iframeUrl = getPaymobIframeUrl(paymentKey);
      res.json({ iframeUrl });
    } catch (err) {
      console.error("Paymob setup error:", err);
      res.status(500).json({ message: "Failed to initialize Paymob payment" });
    }
  });

  // PayPal Routes
  app.get("/paypal/setup", async (req, res) => {
      await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    // Request body should contain: { intent, amount, currency }
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Tours
  app.get(api.tours.list.path, async (req, res) => {
    const tours = await storage.getTours();
    res.json(tours);
  });

  app.get(api.tours.get.path, async (req, res) => {
    const tour = await storage.getTour(Number(req.params.id));
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json(tour);
  });

  app.post(api.tours.create.path, async (req, res) => {
    try {
      const input = api.tours.create.input.parse(req.body);
      const tour = await storage.createTour(input);
      res.status(201).json(tour);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.tours.update.path, async (req, res) => {
    try {
      const input = api.tours.update.input.parse(req.body);
      const tour = await storage.updateTour(Number(req.params.id), input);
      if (!tour) return res.status(404).json({ message: "Tour not found" });
      res.json(tour);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Customers
  app.get(api.customers.list.path, async (req, res) => {
    const customers = await storage.getCustomers();
    res.json(customers);
  });

  app.get(api.customers.get.path, async (req, res) => {
    const customer = await storage.getCustomer(Number(req.params.id));
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  });

  app.post(api.customers.create.path, async (req, res) => {
    try {
      const input = api.customers.create.input.parse(req.body);
      const customer = await storage.createCustomer(input);
      res.status(201).json(customer);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Bookings
  app.get(api.bookings.list.path, async (req, res) => {
    const bookings = await storage.getBookings();
    res.json(bookings);
  });

  app.get(api.bookings.get.path, async (req, res) => {
    const booking = await storage.getBooking(Number(req.params.id));
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  });

  app.post(api.bookings.create.path, async (req, res) => {
    try {
      const input = api.bookings.create.input.parse(req.body);
      const booking = await storage.createBooking(input);
      res.status(201).json(booking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.bookings.update.path, async (req, res) => {
    try {
      const input = api.bookings.update.input.parse(req.body);
      const booking = await storage.updateBooking(Number(req.params.id), input);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      res.json(booking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Payments
  app.get(api.payments.list.path, async (req, res) => {
    const payments = await storage.getPayments();
    res.json(payments);
  });

  app.post(api.payments.create.path, async (req, res) => {
    try {
      const input = api.payments.create.input.parse(req.body);
      const payment = await storage.createPayment(input);
      res.status(201).json(payment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Seed Data Endpoint
  app.post("/api/seed", async (req, res) => {
    try {
      const existingTours = await storage.getTours();
      if (existingTours.length === 0) {
        const tour1 = await storage.createTour({
          title: "Pyramids of Giza & Sphinx",
          description: "Explore the ancient wonders of the world with an expert guide.",
          basePrice: 15000, // $150.00
          currency: "USD",
          durationDays: 1,
          capacity: 20,
          isActive: true,
          images: ["https://images.unsplash.com/photo-1503177119275-0aa32b3a9368"]
        });
        
        const tour2 = await storage.createTour({
          title: "Nile Cruise - Luxor to Aswan",
          description: "4-day luxury cruise along the Nile river.",
          basePrice: 80000, // $800.00
          currency: "USD",
          durationDays: 4,
          capacity: 50,
          isActive: true,
          images: ["https://images.unsplash.com/photo-1539650116455-251d9a04a521"]
        });

        const customer1 = await storage.createCustomer({
          fullName: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
          nationality: "USA",
          notes: "Vegetarian meal preference",
          passportDetails: { number: "A12345678", expiry: "2030-01-01" }
        });

        await storage.createBooking({
          customerId: customer1.id,
          tourId: tour1.id,
          travelDate: new Date("2024-12-01"),
          headCount: 2,
          totalAmount: 30000,
          status: "confirmed",
          notes: "Pickup from hotel at 8 AM"
        });
      }
      res.json({ message: "Database seeded successfully" });
    } catch (error) {
      console.error("Seed error:", error);
      res.status(500).json({ message: "Failed to seed database" });
    }
  });

  return httpServer;
}
