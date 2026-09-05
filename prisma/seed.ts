import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Flipkart",
  "Swiggy",
  "Zomato",
  "Razorpay",
  "PhonePe",
  "Paytm",
  "Infosys",
  "TCS",
  "Wipro",
  "Accenture",
  "Deloitte",
  "Atlassian",
  "Uber",
  "Adobe",
  "Salesforce",
];

const roles = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Data Engineer",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Product Manager",
];

const levels = [
  { name: "Intern", canonicalLevel: "Intern", seniority: 0 },
  { name: "Entry Level", canonicalLevel: "L1", seniority: 1 },
  { name: "Software Engineer I", canonicalLevel: "L2", seniority: 2 },
  { name: "Software Engineer II", canonicalLevel: "L3", seniority: 3 },
  { name: "Senior Engineer", canonicalLevel: "L4", seniority: 4 },
  { name: "Staff Engineer", canonicalLevel: "L5", seniority: 5 },
  { name: "Principal Engineer", canonicalLevel: "L6", seniority: 6 },
];

const locations = [
  { city: "Bangalore", country: "India" },
  { city: "Hyderabad", country: "India" },
  { city: "Pune", country: "India" },
  { city: "Mumbai", country: "India" },
  { city: "Delhi", country: "India" },
  { city: "Gurgaon", country: "India" },
  { city: "Chennai", country: "India" },
  { city: "Noida", country: "India" },
];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("🌱 Seeding CompScope database...");

  await prisma.compensation.deleteMany();
  await prisma.company.deleteMany();
  await prisma.role.deleteMany();
  await prisma.level.deleteMany();
  await prisma.location.deleteMany();

  console.log("Creating companies...");

  const companyRecords = await Promise.all(
    companies.map((name) =>
      prisma.company.create({
        data: {
          name,
          normalizedName: name.toLowerCase().replace(/[^a-z0-9]/g, ""),
        },
      }),
    ),
  );

  console.log("Creating roles...");

  const roleRecords = await Promise.all(
    roles.map((name) =>
      prisma.role.create({
        data: {
          name,
          normalizedName: name.toLowerCase().replace(/[^a-z0-9]/g, ""),
        },
      }),
    ),
  );

  console.log("Creating levels...");

  const levelRecords = await Promise.all(
    levels.map((level) =>
      prisma.level.create({
        data: level,
      }),
    ),
  );

  console.log("Creating locations...");

  const locationRecords = await Promise.all(
    locations.map((location) =>
      prisma.location.create({
        data: location,
      }),
    ),
  );

  console.log("Creating compensation records...");

  const compensationRecords = [];

  for (let i = 0; i < 750; i++) {
    const company =
      companyRecords[randomBetween(0, companyRecords.length - 1)];

    const role =
      roleRecords[randomBetween(0, roleRecords.length - 1)];

    const level =
      levelRecords[randomBetween(0, levelRecords.length - 1)];

    const location =
      locationRecords[randomBetween(0, locationRecords.length - 1)];

    const seniority = level.seniority ?? 0;

    const baseMultiplier = 1 + seniority * 0.35;

    const companyMultiplier =
      ["Google", "Meta", "Microsoft", "Apple"].includes(company.name)
        ? 1.5
        : 1;

    const baseSalary = Math.round(
      randomBetween(500000, 1600000) *
        baseMultiplier *
        companyMultiplier,
    );

    const bonus = Math.round(
      baseSalary * (randomBetween(5, 20) / 100),
    );

    const stock =
      seniority >= 3
        ? Math.round(baseSalary * (randomBetween(10, 40) / 100))
        : Math.round(baseSalary * (randomBetween(0, 15) / 100));

    const totalCompensation = baseSalary + bonus + stock;

    compensationRecords.push({
      companyId: company.id,
      roleId: role.id,
      levelId: level.id,
      locationId: location.id,
      baseSalary,
      bonus,
      stock,
      totalCompensation,
      currency: "INR",
      yearsExperience:
        level.seniority === 0
          ? randomBetween(0, 1)
          : randomBetween(
              Math.max(1, seniority),
              Math.max(2, seniority * 2 + 2),
            ),
      source: "CompScope Synthetic Dataset",    
    });
  }

  await prisma.compensation.createMany({
    data: compensationRecords,
  });

  console.log(
    `✅ Created ${compensationRecords.length} compensation records.`,
  );
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });