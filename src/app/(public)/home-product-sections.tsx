import { NewArrivals } from '@/components/storefront/NewArrivals';
import { LatestFromStores } from '@/components/storefront/LatestFromStores';
import { OfficialPicksScroll } from '@/components/storefront/OfficialPicksScroll';
import {
  getLatestProducts,
  getNewArrivalsProducts,
  getOfficialStoreProducts,
} from '@/actions/product.actions';

export async function NewArrivalsSection() {
  const products = await getNewArrivalsProducts(8);
  return <NewArrivals products={products} />;
}

export async function LatestFromStoresSection() {
  const products = await getLatestProducts(9);
  return <LatestFromStores products={products} />;
}

export async function OfficialPicksSection() {
  const products = await getOfficialStoreProducts(8);
  return <OfficialPicksScroll products={products} />;
}
