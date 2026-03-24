import { PrismaClient } from "@prisma/client";

import { resetAndSeedDemoData } from "@/lib/demo-seed";

const prisma = new PrismaClient();

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
