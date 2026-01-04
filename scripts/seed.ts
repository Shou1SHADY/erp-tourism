import { storage } from "../server/storage";
import { db } from "../server/db";

async function run() {
  console.log("Seeding database...");
  try {
    const existingTours = await storage.getTours();
    if (existingTours.length > 0) {
      console.log("Database already seeded.");
      return;
    }

    const tour1 = await storage.createTour({
      title: "Pyramids of Giza & Sphinx",
      description: "Explore the ancient wonders of the world with an expert guide. Includes entry fees and lunch.",
      basePrice: 15000, // $150.00
      currency: "USD",
      durationDays: 1,
      capacity: 20,
      isActive: true,
      images: ["https://images.unsplash.com/photo-1503177119275-0aa32b3a9368"]
    });
    console.log("Created tour:", tour1.title);
    
    const tour2 = await storage.createTour({
      title: "Nile Cruise - Luxor to Aswan",
      description: "4-day luxury cruise along the Nile river. Visit Karnak, Valley of the Kings, and Edfu.",
      basePrice: 80000, // $800.00
      currency: "USD",
      durationDays: 4,
      capacity: 50,
      isActive: true,
      images: ["https://images.unsplash.com/photo-1539650116455-251d9a04a521"]
    });
    console.log("Created tour:", tour2.title);

    const customer1 = await storage.createCustomer({
      fullName: "Alice Smith",
      email: "alice@example.com",
      phone: "+15550199",
      nationality: "USA",
      notes: "Allergic to peanuts",
      passportDetails: { number: "A12345678", expiry: "2030-01-01" }
    });
    console.log("Created customer:", customer1.fullName);

    const booking1 = await storage.createBooking({
      customerId: customer1.id,
      tourId: tour1.id,
      travelDate: new Date("2024-12-01"),
      headCount: 2,
      totalAmount: 30000,
      status: "confirmed",
      notes: "Pickup from hotel at 8 AM"
    });
    console.log("Created booking:", booking1.id);

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    process.exit(0);
  }
}

run();
