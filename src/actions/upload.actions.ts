'use server';

import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = 'public/uploads';
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Local filesystem upload for testing. Saves to public/uploads so URLs are /uploads/...
 * Replace with Cloudinary (or other) in production.
 */
export async function uploadImages(formData: FormData): Promise<{ urls?: string[]; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not signed in' };

  const files = formData.getAll('files') as File[];
  if (!files?.length) return { error: 'No files' };

  const urls: string[] = [];
  const dir = path.join(process.cwd(), UPLOAD_DIR);

  await mkdir(dir, { recursive: true });

  for (const file of files) {
    if (file.size > MAX_SIZE) return { error: 'File too large (max 10MB)' };
    if (!ALLOWED_TYPES.includes(file.type)) return { error: 'Invalid type (use JPG, PNG, WebP, GIF)' };

    const ext = path.extname(file.name) || '.jpg';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    const filePath = path.join(dir, name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    urls.push(`/uploads/${name}`);
  }

  return { urls };
}
