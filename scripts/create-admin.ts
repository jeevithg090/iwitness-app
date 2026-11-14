/**
 * Creates (or promotes) a staff account.
 *
 *   npm run create-admin -- <email> <password> [name] [ADMIN|MODERATOR]
 *
 * Falls back to SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD when no arguments are given.
 */
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

async function main() {
  const [emailArg, passwordArg, nameArg, roleArg] = process.argv.slice(2);
  const email = (emailArg ?? process.env.SEED_ADMIN_EMAIL)?.trim().toLowerCase();
  const password = passwordArg ?? process.env.SEED_ADMIN_PASSWORD;
  const name = nameArg ?? "Administrator";
  const role = (roleArg?.toUpperCase() ?? "ADMIN") as Role;

  if (!email || !password) {
    console.error(
      "Usage: npm run create-admin -- <email> <password> [name] [ADMIN|MODERATOR]",
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }
  if (role !== "ADMIN" && role !== "MODERATOR") {
    console.error("Role must be ADMIN or MODERATOR.");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hash, role, name },
      create: { email, password: hash, role, name },
    });
    console.log(`✔ ${user.role} account ready: ${user.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
