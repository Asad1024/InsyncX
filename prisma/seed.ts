// prisma/seed.ts
import 'dotenv/config';
import { PrismaClient, UserRole, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? 'admin@insyncx.store').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin@123456';

async function main() {
  const salt = await bcrypt.genSalt(12);
  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

  // ── 1. Admin user (update path resets password/role so Google-first signups at this email can sign in) ──
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      password: adminPasswordHash,
      role: UserRole.ADMIN,
      name: 'InsyncX Admin',
      isBanned: false,
      needsPassword: false,
      authProvider: 'credentials',
    },
    create: {
      name: 'InsyncX Admin',
      email: ADMIN_EMAIL,
      password: adminPasswordHash,
      role: UserRole.ADMIN,
    },
  });
  console.log('✓ Admin:', admin.email);

  // ── 2. InsyncX Official store ──
  const officialStore = await prisma.store.upsert({
    where: { slug: 'insyncx-official' },
    update: { isOfficial: true, isActive: true },
    create: {
      name: 'InsyncX Official',
      slug: 'insyncx-official',
      description: 'Curated official collection by InsyncX. Premium picks selected by our team.',
      logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&q=80',
      banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
      ownerId: admin.id,
      isActive: true,
      isApproved: true,
      isOfficial: true,
    },
  });
  console.log('✓ Official store:', officialStore.slug);

  // ── 3. Categories (with images for Shop by Category section) ──
  const categoriesData = [
    { name: 'Athleisure',  slug: 'athleisure',  icon: 'Activity',      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=60' },
    { name: 'Beauty & care', slug: 'beauty',    icon: 'Sparkles',      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=60' },
    { name: 'Men',          slug: 'men',         icon: 'Shirt',         image: 'https://plus.unsplash.com/premium_photo-1755901267835-6bcb4de846a3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8TWVuJTIwZWNvbW1lcmNlJTIwcGljc3xlbnwwfHwwfHx8MA%3D%3D' },
    { name: 'Women',       slug: 'women',       icon: 'Sparkles',      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80' },
    { name: 'LGBTQ+',      slug: 'lgbtq',       icon: 'Heart',         image: 'https://images.squarespace-cdn.com/content/v1/5f4cd040d1fbe943c7a863d0/1692165273836-KZBN5CQODUUF19VVN36P/MV-MI3A8255-1024x683_2100x.jpeg' },
    { name: 'Wellness',    slug: 'wellness',    icon: 'Leaf',          image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80' },
    { name: 'Party',       slug: 'party',       icon: 'PartyPopper',   image: 'https://media.istockphoto.com/id/2263412080/photo/lgbtq-online-clothing-business-owner-adult-asian-woman-stands-arms-crossed-warehouse-shelves.webp?a=1&b=1&s=612x612&w=0&k=20&c=2EY8AvkA8bbVB7duHGAqTQkw28-vQDYBBogBT6E7glM=' },
    { name: 'Exotic',      slug: 'exotic',      icon: 'Gem',          image: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bGVhdGhlciUyMGJhZ3xlbnwwfHwwfHx8MA%3D%3D' },
    { name: 'Sale & Offers', slug: 'sale-offers', icon: 'Tag',        image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fFNhbGVzJTIwYW5kJTIwb2ZmZmVyfGVufDB8fDB8fHww' },
    { name: 'Yoga',        slug: 'yoga',        icon: 'Leaf',        image: 'https://images.unsplash.com/photo-1591291621164-2c6367723315?w=600&auto=format&fit=crop&q=60' },
  ];
  const categories: { id: string; name: string; slug: string }[] = [];
  for (const c of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon, image: c.image } as Prisma.CategoryUpdateInput,
      create: { name: c.name, slug: c.slug, icon: c.icon, image: c.image } as Prisma.CategoryCreateInput,
    });
    categories.push(cat);
  }
  console.log('✓ Categories:', categories.length);

  // ── 4. Vendor 1 — Luxe Threads ──
  const vendor1 = await prisma.user.upsert({
    where: { email: 'vendor1@insyncx.store' },
    update: {},
    create: {
      name: 'Luxe Threads',
      email: 'vendor1@insyncx.store',
      password: await bcrypt.hash('Vendor@123', salt),
      role: UserRole.VENDOR,
    },
  });
  const store1 = await prisma.store.upsert({
    where: { slug: 'luxe-threads' },
    update: {},
    create: {
      name: 'Luxe Threads',
      slug: 'luxe-threads',
      description: 'Premium fashion for the modern individual. Timeless pieces, contemporary style.',
      logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80',
      banner: 'https://images.unsplash.com/photos/qnKhZJPKFD8/download?w=1200&q=80',
      ownerId: vendor1.id,
      isActive: true,
      isApproved: true,
    },
  });

  console.log('✓ Vendor stores: 1');

  // ── 5. Products (only products with reliable Unsplash images) ──
  const productsData = [
    // InsyncX Official — 4 products
    {
      title: 'Classic Gold Watch',
      storeId: officialStore.id,
      categorySlug: 'men',
      price: 299.99,
      comparePrice: 349.99,
      isFeatured: true,
      description: 'A timeless gold watch crafted with precision. Sapphire crystal glass, Swiss movement, leather strap.',
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
    },
    {
      title: 'Silk Evening Gown',
      storeId: officialStore.id,
      categorySlug: 'women',
      price: 189.99,
      comparePrice: 249.99,
      isFeatured: true,
      description: 'Luxurious silk evening gown with an elegant cut. Perfect for special occasions.',
      images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80'],
    },
    {
      title: 'Pride Collection Tee',
      storeId: officialStore.id,
      categorySlug: 'lgbtq',
      price: 39.99,
      isFeatured: true,
      description: 'Celebrate identity with our Pride Collection. 100% organic cotton, vibrant print.',
      images: ['https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80'],
    },
    {
      title: 'Flash Sale Sneakers',
      storeId: officialStore.id,
      categorySlug: 'sale-offers',
      price: 59.99,
      comparePrice: 89.99,
      isFeatured: true,
      description: 'Limited time offer on our bestselling sneakers. Lightweight, durable, stylish.',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
    },

    // Luxe Threads (1 vendor) — 4 products
    {
      title: 'Designer Blazer',
      storeId: store1.id,
      categorySlug: 'men',
      price: 159.99,
      isFeatured: false,
      description: 'Sharp structured blazer in premium wool blend. Tailored fit for the modern professional.',
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80'],
    },
    {
      title: 'Exotic Leather Bag',
      storeId: store1.id,
      categorySlug: 'exotic',
      price: 249.99,
      comparePrice: 299.99,
      isFeatured: false,
      description: 'Handcrafted exotic leather bag with gold hardware. Spacious interior, multiple compartments.',
      images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'],
    },
    {
      title: 'Summer Dress',
      storeId: store1.id,
      categorySlug: 'women',
      price: 79.99,
      isFeatured: false,
      description: 'Breezy summer dress in floral print. Lightweight fabric, adjustable straps.',
      images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'],
    },
    {
      title: 'Luxury Perfume Set',
      storeId: store1.id,
      categorySlug: 'wellness',
      price: 89.99,
      comparePrice: 119.99,
      isFeatured: false,
      description: 'A curated set of three luxury fragrances. Notes of oud, rose, and sandalwood.',
      images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'],
    },
  ];

  for (const p of productsData) {
    const category = categories.find((c) => c.slug === p.categorySlug)!;
    const slug = p.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    await prisma.product.upsert({
      where: { slug },
      update: {
        title: p.title,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice ?? null,
        images: p.images as unknown as object,
        isFeatured: p.isFeatured ?? false,
        storeId: p.storeId,
        categoryId: category.id,
        isActive: true,
      },
      create: {
        title: p.title,
        slug,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice ?? null,
        images: p.images as unknown as object,
        stock: Math.floor(Math.random() * 50) + 10,
        sku: `INS-${slug.slice(0, 6).toUpperCase()}-${Math.random()
          .toString(36)
          .slice(2, 5)
          .toUpperCase()}`,
        storeId: p.storeId,
        categoryId: category.id,
        tags: [p.categorySlug, 'quality', 'insyncx'] as unknown as object,
        isFeatured: p.isFeatured ?? false,
        isActive: true,
      },
    });
  }
  console.log('✓ Products:', productsData.length);

  // ── 6. Platform coupon ──
  await prisma.coupon.upsert({
    where: { code: 'INSYNCX143' },
    update: {},
    create: {
      code: 'INSYNCX143',
      discount: 20,
      type: 'PERCENT',
      storeId: null,
      usageLimit: 1000,
      usedCount: 0,
      isActive: true,
    },
  });
  console.log('✓ Coupon: INSYNCX143');

  // ── 7. Platform settings (only seed products + required data; users/orders = real only) ──
  await prisma.platformSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      commissionPercent: parseInt(
        process.env.PLATFORM_COMMISSION_PERCENT ?? '10',
        10
      ),
      maintenanceMode: false,
    },
  });
  console.log('✓ Platform settings');
  console.log('\n🎉 Seed completed successfully!\n');
  console.log('Login credentials:');
  console.log('  Admin:    admin@insyncx.store / Admin@123456');
  console.log('  Vendor 1: vendor1@insyncx.store / Vendor@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
