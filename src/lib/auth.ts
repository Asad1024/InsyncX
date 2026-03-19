import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: UserRole;
    storeId?: string | null;
    needsPassword?: boolean;
  }
  interface Session {
    user: User & { id: string; role: UserRole; storeId?: string | null; needsPassword?: boolean; image?: string | null };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    storeId?: string | null;
    needsPassword?: boolean;
    image?: string | null;
  }
}

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const googleEnabled = Boolean(googleClientId && googleClientSecret);

// NextAuth v5 assertConfig requires secret and trustHost on the config object
const authSecret =
  process.env.AUTH_SECRET?.trim() ||
  process.env.NEXTAUTH_SECRET?.trim() ||
  undefined;
if (!authSecret?.length && process.env.NODE_ENV === 'production') {
  console.error('[auth] AUTH_SECRET or NEXTAUTH_SECRET must be set in production');
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: authSecret && authSecret.length > 0 ? authSecret : 'dev-secret-change-in-production',
  providers: [
    ...(googleEnabled
      ? [
          Google({
            clientId: googleClientId!,
            clientSecret: googleClientSecret!,
          }),
        ]
      : []),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            storesOwned: { take: 1, where: { isActive: true } },
          },
        });
        if (!user || user.isBanned) return null;
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;
        const storeId = user.storesOwned[0]?.id ?? null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar ?? null,
          role: user.role,
          storeId,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== 'google' || !profile?.email) return true;
      const googlePicture = (profile as { picture?: string }).picture ?? null;
      try {
        const existing = await prisma.user.findUnique({ where: { email: profile.email } });
        if (existing) {
          // Same email: update authProvider and avatar (if not set) so we persist Google linkage and profile pic
          await prisma.user.update({
            where: { id: existing.id },
            data: {
              authProvider: 'google',
              ...(googlePicture && !existing.avatar ? { avatar: googlePicture } : {}),
            },
          });
          return true;
        }
        const salt = await bcrypt.genSalt(12);
        const placeholderPassword = await bcrypt.hash(`oauth-${profile.email}-${Date.now()}`, salt);
        await prisma.user.create({
          data: {
            name: (profile.name as string) || profile.email.split('@')[0],
            email: profile.email,
            password: placeholderPassword,
            role: 'CUSTOMER',
            needsPassword: true,
            authProvider: 'google',
            avatar: googlePicture,
          },
        });
      } catch (e: unknown) {
        // P2002 = unique constraint (user already created, e.g. race)
        if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2002') return true;
        console.error('[auth] signIn (Google):', e);
        throw e;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user && typeof (user as { id?: string }).id === 'string') {
        token.id = (user as { id: string }).id;
        token.role = (user as { role?: UserRole }).role ?? 'CUSTOMER';
        token.storeId = (user as { storeId?: string | null }).storeId ?? null;
        token.needsPassword = (user as { needsPassword?: boolean }).needsPassword ?? false;
        const img = (user as { image?: string | null }).image ?? (user as { picture?: string | null }).picture ?? null;
        if (img) token.image = img;
      }
      if (account?.provider === 'google' && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: {
              id: true,
              role: true,
              needsPassword: true,
              avatar: true,
              storesOwned: { take: 1, where: { isActive: true }, select: { id: true } },
            },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.storeId = dbUser.storesOwned[0]?.id ?? null;
            token.needsPassword = dbUser.needsPassword ?? false;
            token.image = dbUser.avatar ?? token.image ?? (token as { picture?: string }).picture ?? null;
          }
        } catch (e) {
          console.error('[auth] jwt (Google lookup):', e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? (session.user as { id?: string }).id ?? '';
        session.user.role = (token.role as UserRole) ?? 'CUSTOMER';
        session.user.storeId = token.storeId ?? null;
        session.user.needsPassword = token.needsPassword ?? false;
        session.user.image =
          token.image ??
          (token as { picture?: string | null }).picture ??
          (session.user as { image?: string | null }).image ??
          null;
      }
      return session;
    },
    redirect(p) {
      const { url, baseUrl } = p;
      const base = (baseUrl || process.env.NEXTAUTH_URL || process.env.AUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
      const token = (p as { token?: { needsPassword?: boolean } }).token;
      if (token?.needsPassword === true) return `${base}/auth/register?complete=1`;
      if (!url || typeof url !== 'string') return `${base}/`;
      if (url.startsWith('http')) {
        try {
          new URL(url);
          return url;
        } catch {
          return `${base}/`;
        }
      }
      const path = url.startsWith('/') ? url : `/${url}`;
      return `${base}${path}`;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
});
