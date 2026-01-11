const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Cek apakah admin sudah ada
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'admin' }
  });

  if (existingAdmin) {
    console.log('✅ Admin already exists');
    return;
  }

  // Buat admin default
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      nama: 'Admin Kebersihan',
      email: 'admin@kebersihan.com',
      password: hashedPassword,
      role: 'admin'
    }
  });

  console.log('✅ Admin created:', {
    email: admin.email,
    password: 'admin123',
    role: admin.role
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });