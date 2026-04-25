// BlackRoad OS — Schema.org JSON-LD Generator
// Structured data for every BlackRoad site

import { PRODUCTS } from './products.js';
import { SITES } from './sites.js';
import { UNIVERSAL_COPY } from './productCopy.js';

const SCHEMA_TYPE_MAP = {
  'blackroad-io': 'Organization',
  'os-blackroad-io': 'SoftwareApplication',
  'blackroad-company': 'Organization',
  'blackroad-network': 'WebSite',
  'docs-blackroad-io': 'WebSite',
  'status-blackroad-io': 'WebPage',
  'agents-blackroad-io': 'SoftwareApplication',
  'roadchain-io': 'SoftwareApplication',
  'roadcoin-io': 'Service',
  'search-blackroad-io': 'WebSite'
};

const PRODUCT_SCHEMA_TYPE = {
  roadbook: 'CreativeWork',
  default: 'SoftwareApplication'
};

// Build schema.org JSON-LD for a product
function buildProductSchema(product) {
  const schemaType = PRODUCT_SCHEMA_TYPE[product.id] || PRODUCT_SCHEMA_TYPE.default;

  return {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: product.name,
    description: product.longDescription,
    url: `https://${product.domain}/`,
    applicationCategory: product.category,
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    author: {
      '@type': 'Organization',
      name: 'BlackRoad OS, Inc.',
      url: 'https://blackroad.io'
    },
    isPartOf: {
      '@type': 'SoftwareApplication',
      name: 'BlackRoad OS',
      url: 'https://os.blackroad.io'
    },
    keywords: product.tags.join(', ')
  };
}

// Build schema.org JSON-LD for the main BlackRoad org
function buildOrgSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BlackRoad OS, Inc.',
    url: 'https://blackroad.io',
    logo: 'https://images.blackroad.io/brand/logo.png',
    description: UNIVERSAL_COPY.brandLine,
    slogan: UNIVERSAL_COPY.tagline,
    founder: {
      '@type': 'Person',
      name: 'Alexa Louise Amundson'
    },
    foundingDate: '2025-11-17',
    foundingLocation: {
      '@type': 'Place',
      name: 'Delaware, USA'
    },
    sameAs: [
      'https://github.com/BlackRoadOS'
    ]
  };
}

// Build schema.org JSON-LD for a non-product site
function buildSiteSchema(site) {
  const schemaType = SCHEMA_TYPE_MAP[site.id] || 'WebPage';

  const base = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: site.title,
    description: site.purpose,
    url: `https://${site.domain}/`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'BlackRoad OS',
      url: 'https://blackroad.io'
    }
  };

  // Add org schema for org-type sites
  if (schemaType === 'Organization') {
    return { ...base, ...buildOrgSchema() };
  }

  return base;
}

// Build schema.org JSON-LD for any domain
export function buildSchema(domain) {
  // Main org site
  if (domain === 'blackroad.io') return buildOrgSchema();

  // Product
  const product = PRODUCTS.find(p => p.domain === domain);
  if (product) return buildProductSchema(product);

  // Other site
  const site = SITES.find(s => s.domain === domain);
  if (site) return buildSiteSchema(site);

  return null;
}

// Generate <script type="application/ld+json"> tag
export function buildSchemaTag(domain) {
  const schema = buildSchema(domain);
  if (!schema) return '';
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

// Build all schemas
export function buildAllSchemas() {
  const allDomains = [
    ...PRODUCTS.map(p => p.domain),
    ...SITES.filter(s => s.type !== 'agent').map(s => s.domain)
  ];
  const unique = [...new Set(allDomains)];
  return unique.map(d => ({ domain: d, schema: buildSchema(d) }));
}
