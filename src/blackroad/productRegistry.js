// BlackRoad OS — Product Registry
// Single source of truth: combines products, routes, and copy

import { PRODUCTS, CATEGORIES, getProduct, getByCategory, getByTag, getConnected } from './products.js';
import { STANDARD_PAGES, getProductRoutes, getAllRoutes, TOTAL_ROUTES } from './productRoutes.js';
import { SITE_RULEBOOK, UNIVERSAL_COPY, getProductCopy, getAllProductCopy } from './productCopy.js';

export const ProductRegistry = {
  // Data
  products: PRODUCTS,
  categories: CATEGORIES,
  standardPages: STANDARD_PAGES,
  totalProducts: PRODUCTS.length,
  totalRoutes: TOTAL_ROUTES,

  // Lookups
  getProduct,
  getByCategory,
  getByTag,
  getConnected,

  // Routes
  getProductRoutes,
  getAllRoutes,

  // Copy
  getProductCopy,
  getAllProductCopy,
  siteRulebook: SITE_RULEBOOK,
  universalCopy: UNIVERSAL_COPY,

  // Validate: does a product answer all 8 rulebook questions?
  validate(productId) {
    const copy = getProductCopy(productId);
    if (!copy) return { valid: false, missing: ['product not found'] };
    const checks = [
      ['whatIsThis', copy.whatIsThis],
      ['whoIsItFor', copy.whoIsItFor],
      ['whatDoesItReplace', copy.whatDoesItReplace],
      ['whatCanIDo', copy.whatCanIDo],
      ['whatDoesItConnect', copy.whatDoesItConnect?.length > 0],
      ['whatDoesItRemember', copy.whatDoesItRemember],
      ['whatPermissions', copy.whatPermissions],
      ['howToOpen', copy.howToOpen]
    ];
    const missing = checks.filter(([, val]) => !val).map(([key]) => key);
    return { valid: missing.length === 0, missing };
  },

  // Validate all products
  validateAll() {
    return PRODUCTS.map(p => ({ id: p.id, ...this.validate(p.id) }));
  }
};

export default ProductRegistry;
