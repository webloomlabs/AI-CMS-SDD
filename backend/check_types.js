const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const types = await prisma.contentType.findMany({
    include: { fields: true }
  });
  console.log(JSON.stringify(types, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
