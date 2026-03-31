/**
 * Removes seed/dummy orders and seed customer users so admin shows only real data.
 *   npx tsx prisma/clean-dummy-data.ts           — delete orders from customer1/customer2 and remove those users
 *   npx tsx prisma/clean-dummy-data.ts --wipe-all — delete ALL orders (use when you see wrong totals and want a fresh start)
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const WIPE_ALL = process.argv.includes('--wipe-all');

const SEED_CUSTOMER_EMAILS = ['customer1@example.com', 'customer2@example.com'];

async function main() {
  if (WIPE_ALL) {
    const deleted = await prisma.order.deleteMany({});
    console.log(`Deleted all ${deleted.count} orders. Admin will show only new real orders.`);
    return;
  }

  const seedUsers = await prisma.user.findMany({
    where: { email: { in: SEED_CUSTOMER_EMAILS } },
    select: { id: true, email: true },
  });

  if (seedUsers.length === 0) {
    console.log('No seed customer users (customer1/customer2) found.');
    console.log('To remove ALL orders and show only real data from now on, run:');
    console.log('  npx tsx prisma/clean-dummy-data.ts --wipe-all');
    return;
  }

  const userIds = seedUsers.map((u) => u.id);
  const ordersDeleted = await prisma.order.deleteMany({
    where: { userId: { in: userIds } },
  });
  console.log(`Deleted ${ordersDeleted.count} orders from seed users (${seedUsers.map((u) => u.email).join(', ')}).`);

  const usersDeleted = await prisma.user.deleteMany({
    where: { id: { in: userIds } },
  });
  console.log(`Deleted ${usersDeleted.count} seed customer user(s).`);
  console.log('Done. Admin dashboard will now show only real data.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
