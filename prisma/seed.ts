/**
 * Seeds a demo moderator account and a handful of fictional reports.
 * All data is invented for local development and screenshots.
 */
import bcrypt from "bcryptjs";
import { PrismaClient, type Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_REPORTS: Prisma.ReportCreateInput[] = [
  {
    reportId: "a1b2c3d4e5f60718",
    type: "EMERGENCY",
    reportType: "Fire Outbreak",
    title: "Smoke coming from warehouse roof",
    description:
      "Thick grey smoke is rising from the roof of the storage warehouse near the river. No visible flames yet, but the smell is strong.",
    location: "Riverside Industrial Park, Unit 4",
    latitude: 51.5079,
    longitude: -0.0877,
    status: "IN_PROGRESS",
  },
  {
    reportId: "0f9e8d7c6b5a4321",
    type: "NON_EMERGENCY",
    reportType: "Theft",
    title: "Bicycles stolen from station rack",
    description:
      "Several locks were cut on the bike rack outside the north entrance overnight. At least three bikes are missing.",
    location: "Central Station, north entrance",
    status: "PENDING",
  },
  {
    reportId: "5c4b3a29180f7e6d",
    type: "NON_EMERGENCY",
    reportType: "Other",
    title: "Streetlights out along park path",
    description:
      "The lights along the east footpath of Elm Park have been off for a week, making the path unsafe after dark.",
    location: "Elm Park, east footpath",
    status: "RESOLVED",
  },
  {
    reportId: "9a8b7c6d5e4f3021",
    type: "EMERGENCY",
    reportType: "Medical Emergency",
    title: "Person collapsed outside pharmacy",
    description:
      "An elderly person collapsed on the pavement outside the pharmacy. Bystanders are helping; ambulance requested.",
    location: "High Street 112",
    status: "RESOLVED",
  },
  {
    reportId: "1234abcd5678ef90",
    type: "NON_EMERGENCY",
    reportType: "Violence",
    title: "Repeated fights outside late-night venue",
    description:
      "Groups have been getting into fights outside the venue most weekends around closing time. Reporting so patrols can be scheduled.",
    location: "Market Square",
    status: "PENDING",
  },
];

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "change-me-please";

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Demo Moderator",
      role: "ADMIN",
      password: await bcrypt.hash(password, 12),
    },
  });

  for (const report of DEMO_REPORTS) {
    await prisma.report.upsert({
      where: { reportId: report.reportId },
      update: {},
      create: report,
    });
  }

  console.log(`✔ Seeded admin ${email} and ${DEMO_REPORTS.length} demo reports`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
