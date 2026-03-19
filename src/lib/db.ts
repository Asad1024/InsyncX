/**
 * True if DATABASE_URL is set and not the placeholder (e.g. user:password@host:3306).
 * When false, avoid calling Prisma to prevent connection errors and log spam.
 */
export function isDbConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  // Placeholder from .env.example uses hostname "host"
  if (url.includes('@host:') || url.includes('host:3306')) return false;
  return true;
}
