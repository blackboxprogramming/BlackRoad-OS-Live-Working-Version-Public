import type { Product } from "./types";
import { PRODUCTS } from "./products";

export function listProducts(): Product[] {
  return PRODUCTS.slice();
}

export function getProductById(id: string): Product | undefined {
  const needle = id.toLowerCase();
  return PRODUCTS.find((p) => p.id.toLowerCase() === needle);
}

export function getProductByName(name: string): Product | undefined {
  const needle = name.toLowerCase();
  return PRODUCTS.find((p) => p.name.toLowerCase() === needle);
}

export function getProductByDomain(domain: string): Product | undefined {
  const needle = domain.toLowerCase();
  return PRODUCTS.find((p) => p.domain.toLowerCase() === needle);
}

export function getProductOpenTargets(product: Product): { surfaceUrl: string; liveUrl: string } {
  const surfaceUrl = product.route;
  const liveUrl = product.domain.startsWith("http") ? product.domain : `https://${product.domain}`;
  return { surfaceUrl, liveUrl };
}

