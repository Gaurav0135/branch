import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Category from "./models/Category.js";
import Image from "./models/Image.js";
import Service from "./models/Service.js";

dotenv.config();

const categories = [
  { name: "Wedding", slug: "wedding" },
  { name: "Pre-wedding", slug: "pre-wedding" },
  { name: "Fashion", slug: "fashion" },
  { name: "Events", slug: "events" },
  { name: "Commercial", slug: "commercial" }
];

const images = [
  { title: "Wedding Couple", category: "wedding", imageUrl: "photo/wedding/w1.webp" },
  { title: "Ceremony Vibes", category: "wedding", imageUrl: "photo/wedding/w2.jpg" },
  { title: "Bridal Elegance", category: "wedding", imageUrl: "photo/wedding/w3.jpg" },
  { title: "Pre-wedding Forest", category: "pre-wedding", imageUrl: "photo/pre-wedding/1.jpg" },
  { title: "Pre-wedding Sunset", category: "pre-wedding", imageUrl: "photo/pre-wedding/2.jpg" },
  { title: "Fashion Runway", category: "fashion", imageUrl: "photo/fashion/f1.jpg" },
  { title: "Model Portrait", category: "fashion", imageUrl: "photo/fashion/f2.jpg" },
  { title: "Concert Crowd", category: "events", imageUrl: "photo/events/e1.jpg" },
  { title: "Corporate Meeting", category: "commercial", imageUrl: "photo/commercial/c1.jpg" },
  { title: "Product Shoot", category: "commercial", imageUrl: "photo/commercial/c2.jpg" }
];

const services = [
  {
    title: "Wedding Photography",
    category: "Wedding",
    price: 2200,
    description: "Full-day wedding coverage, custom album, multi-location support.",
    imageUrl: "photo/wedding/w1.webp"
  },
  {
    title: "Pre-wedding Shoot",
    category: "Pre-wedding",
    price: 900,
    description: "Indoor/outdoor pre-wedding shoot with professional lighting and styling.",
    imageUrl: "photo/pre-wedding/1.jpg"
  },
  {
    title: "Fashion Portfolio",
    price: 1250,
    description: "Creative fashion photography for models and designers with retouching.",
    imageUrl: "photo/fashion/f1.jpg"
  },
  {
    title: "Event Coverage",
    price: 1100,
    description: "Corporate/celebration event coverage, highlight video snapshots, quick delivery.",
    imageUrl: "photo/events/e1.jpg"
  },
  {
    title: "Commercial Product",
    price: 1500,
    description: "Product photography and branding visuals for e-commerce catalogs.",
    imageUrl: "photo/commercial/c1.jpg"
  },
  {
    title: "Destination Package",
    price: 3200,
    description: "Travel-inclusive photo & video package for destination weddings and events.",
    imageUrl: "photo/wedding/w2.jpg"
  }
];

const seed = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for seeding...");

    await Category.deleteMany();
    await Category.insertMany(categories);
    console.log("Categories seeded:", categories.length);

    await Image.deleteMany();
    await Image.insertMany(images);
    console.log("Images seeded:", images.length);

    await Service.deleteMany();
    await Service.insertMany(services);
    console.log("Services seeded:", services.length);

    console.log("Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seed();