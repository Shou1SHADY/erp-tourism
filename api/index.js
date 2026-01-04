import express from 'express';
import cors from 'cors';
import { format } from 'date-fns';

// In-memory storage for Vercel serverless
let tours = [
    {
        id: 1,
        title: "Pyramids of Giza & Sphinx",
        description: "Explore the ancient wonders of the world with an expert guide. Includes entry fees and lunch.",
        basePrice: 15000,
        currency: "USD",
        durationDays: 1,
        capacity: 20,
        isActive: true,
        images: ["https://images.unsplash.com/photo-1503177119275-0aa32b3a9368"],
        createdAt: new Date()
    },
    {
        id: 2,
        title: "Nile Cruise - Luxor to Aswan",
        description: "4-day luxury cruise along the Nile river. Visit Karnak, Valley of the Kings, and Edfu.",
        basePrice: 80000,
        currency: "USD",
        durationDays: 4,
        capacity: 50,
        isActive: true,
        images: ["https://images.unsplash.com/photo-1539650116455-251d9a04a521"],
        createdAt: new Date()
    }
];

let customers = [
    {
        id: 1,
        fullName: "Alice Smith",
        email: "alice@example.com",
        phone: "+15550199",
        nationality: "USA",
        notes: "Allergic to peanuts",
        passportDetails: { number: "A12345678", expiry: "2030-01-01" },
        createdAt: new Date()
    }
];

let bookings = [
    {
        id: 1,
        customerId: 1,
        tourId: 1,
        bookingDate: new Date(),
        travelDate: new Date("2024-12-01"),
        headCount: 2,
        totalAmount: 30000,
        status: "confirmed",
        notes: "Pickup from hotel at 8 AM"
    }
];

let payments = [];
let nextId = { tour: 3, customer: 2, booking: 2, payment: 1 };

const app = express();
app.use(cors());
app.use(express.json());

// Tours
app.get('/api/tours', (req, res) => res.json(tours));
app.get('/api/tours/:id', (req, res) => {
    const tour = tours.find(t => t.id === parseInt(req.params.id));
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json(tour);
});
app.post('/api/tours', (req, res) => {
    const tour = { ...req.body, id: nextId.tour++, createdAt: new Date() };
    tours.push(tour);
    res.status(201).json(tour);
});
app.put('/api/tours/:id', (req, res) => {
    const index = tours.findIndex(t => t.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ message: "Tour not found" });
    tours[index] = { ...tours[index], ...req.body };
    res.json(tours[index]);
});

// Customers
app.get('/api/customers', (req, res) => res.json(customers));
app.get('/api/customers/:id', (req, res) => {
    const customer = customers.find(c => c.id === parseInt(req.params.id));
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
});
app.post('/api/customers', (req, res) => {
    const customer = { ...req.body, id: nextId.customer++, createdAt: new Date() };
    customers.push(customer);
    res.status(201).json(customer);
});

// Bookings
app.get('/api/bookings', (req, res) => res.json(bookings));
app.get('/api/bookings/export', (req, res) => {
    const header = "Booking ID,Customer Name,Tour Title,Travel Date,Travelers,Total Amount,Status\n";
    const rows = bookings.map(b => {
        const customer = customers.find(c => c.id === b.customerId);
        const tour = tours.find(t => t.id === b.tourId);
        return `${b.id},"${customer?.fullName || "Unknown"}","${tour?.title || "Unknown"}",${format(new Date(b.travelDate), "yyyy-MM-dd")},${b.headCount},${(b.totalAmount / 100).toFixed(2)},${b.status}`;
    }).join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=bookings_report.csv");
    res.send(header + rows);
});
app.get('/api/bookings/:id', (req, res) => {
    const booking = bookings.find(b => b.id === parseInt(req.params.id));
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
});
app.post('/api/bookings', (req, res) => {
    const booking = { ...req.body, id: nextId.booking++, bookingDate: new Date() };
    bookings.push(booking);
    res.status(201).json(booking);
});
app.put('/api/bookings/:id', (req, res) => {
    const index = bookings.findIndex(b => b.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ message: "Booking not found" });
    bookings[index] = { ...bookings[index], ...req.body };
    res.json(bookings[index]);
});

// Payments
app.get('/api/payments', (req, res) => res.json(payments));
app.post('/api/payments', (req, res) => {
    const payment = { ...req.body, id: nextId.payment++, paymentDate: new Date() };
    payments.push(payment);
    res.status(201).json(payment);
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

export default app;
