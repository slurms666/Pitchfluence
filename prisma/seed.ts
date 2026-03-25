import path from "node:path";

import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { resetAndSeedDemoData } from "@/lib/demo-seed";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const connectionString =
  process.env.DATABASE_URL ??
  process.env.DIRECT_URL ??
  "postgresql://postgres:postgres@localhost:5432/postgres";

const configuredPoolMax = Number(process.env.PG_POOL_MAX ?? "1");
const poolMax = Number.isFinite(configuredPoolMax) && configuredPoolMax > 0 ? configuredPoolMax : 1;

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
    max: poolMax,
  }),
});

async function main() {
  await resetAndSeedDemoData(prisma);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
