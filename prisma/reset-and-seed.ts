/**
 * Wipes all data and re-runs seed. Admin will show only: 1 admin, 1 vendor, 8 products.
 * Run: npx tsx prisma/reset-and-seed.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function main() {
  console.log('Wiping all data in dependency order...\n');

  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.payout.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.newsletterSubscriber.deleteMany({});
  await prisma.platformSettings.deleteMany({});
  // Categories last (no FK from others we need to keep)
  await prisma.category.deleteMany({});

  console.log('✓ All data wiped.\n');
  console.log('Running seed...\n');

  execSync('npx tsx prisma/seed.ts', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  console.log('\n✓ Reset complete. Admin has only: 1 admin, 1 vendor, 8 products. No dummy data.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
