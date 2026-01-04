import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { format } from "date-fns";
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
  app.get("/api/bookings/export", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      const tours = await storage.getTours();
      const customers = await storage.getCustomers();

      const header = "Booking ID,Customer Name,Tour Title,Travel Date,Travelers,Total Amount,Status\n";
      const rows = bookings.map(b => {
        const customer = customers.find(c => c.id === b.customerId);
        const tour = tours.find(t => t.id === b.tourId);
        return `${b.id},"${customer?.fullName || "Unknown"}","${tour?.title || "Unknown"}",${format(new Date(b.travelDate), "yyyy-MM-dd")},${b.headCount},${(b.totalAmount / 100).toFixed(2)},${b.status}`;
      }).join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=bookings_report.csv");
      res.send(header + rows);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ message: "Failed to export report" });
    }
  });

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
    // ... existing seed logic
  });


  return httpServer;
}
