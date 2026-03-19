import { NextRequest } from 'next/server';
import { searchProducts } from '@/actions/product.actions';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  const limit = Math.min(20, parseInt(request.nextUrl.searchParams.get('limit') ?? '10', 10));
  const products = await searchProducts(q, limit);
  return Response.json(products);
}
