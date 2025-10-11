import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: 'editor' },
    update: {},
    create: {
      name: 'editor',
    },
  });

  console.log('✅ Roles created:', { admin: adminRole.id, editor: editorRole.id });

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create editor user
  const editorPassword = await bcrypt.hash('editor123', 10);
  const editorUser = await prisma.user.upsert({
    where: { email: 'editor@example.com' },
    update: {},
    create: {
      email: 'editor@example.com',
      password: editorPassword,
      roleId: editorRole.id,
    },
  });

  console.log('✅ Editor user created:', editorUser.email);

  // Create a default content type
  const articleType = await prisma.contentType.upsert({
    where: { name: 'Article' },
    update: {},
    create: {
      name: 'Article',
    },
  });

  console.log('✅ Content type created:', articleType.name);

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
