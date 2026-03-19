export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { prisma } = await import('@/lib/prisma');
    try {
      await prisma.$connect();
      console.log('\x1b[32m✓ Database connected (MySQL)\x1b[0m');
    } catch (e) {
      console.error('\x1b[31m✗ Database not connected:\x1b[0m', e instanceof Error ? e.message : e);
    }
  }
}
