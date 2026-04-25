// BlackRoad OS — Site Registry
// Master registry combining sites, domains, routes, templates, and pages

import { SITES, SITE_TYPES, getSite, getByType, getActive, getPhase1, getPhase2, getPhase3, TOTAL_SITES, SITE_COUNTS } from './sites.js';
import { ROOT_DOMAINS, buildDomainMap, getAllDomains, TOTAL_DOMAINS } from './domains.js';
import { buildRouteTable, buildOSRoutes, TOTAL_ROUTES } from './routes.js';
import { TOP_NAV, FOOTER_NAV, PRODUCT_NAV, RUNTIME_NAV, getNavForType } from './navModel.js';
import { getCTAs } from './ctaModel.js';
import { LANDING_SECTIONS, buildLandingSections, validateSections } from './pageSections.js';
import { buildProductPage, buildProductSite, buildSitePage, buildAllProductSites, getTemplateStats, DESIGN, FOOTER } from './siteTemplates.js';
import { buildAllPages, buildPage } from './sitePages.js';
import { UNIVERSAL_COPY, SITE_RULEBOOK } from './productCopy.js';

export const SiteRegistry = {
  // Data
  sites: SITES,
  siteTypes: SITE_TYPES,
  rootDomains: ROOT_DOMAINS,
  totalSites: TOTAL_SITES,
  totalDomains: TOTAL_DOMAINS,
  totalRoutes: TOTAL_ROUTES,
  siteCounts: SITE_COUNTS,

  // Lookups
  getSite,
  getByType,
  getActive,
  getPhase1,
  getPhase2,
  getPhase3,

  // Domain map
  buildDomainMap,
  getAllDomains,

  // Routes
  buildRouteTable,
  buildOSRoutes,

  // Navigation
  topNav: TOP_NAV,
  footerNav: FOOTER_NAV,
  productNav: PRODUCT_NAV,
  runtimeNav: RUNTIME_NAV,
  getNavForType,

  // CTAs
  getCTAs,

  // Sections
  landingSections: LANDING_SECTIONS,
  buildLandingSections,
  validateSections,

  // Templates
  buildProductPage,
  buildProductSite,
  buildSitePage,
  buildAllProductSites,
  getTemplateStats,
  design: DESIGN,
  footer: FOOTER,

  // Pages
  buildAllPages,
  buildPage,

  // Copy
  universalCopy: UNIVERSAL_COPY,
  siteRulebook: SITE_RULEBOOK,

  // Validate everything
  validateAll() {
    const stats = getTemplateStats();
    const domainMap = buildDomainMap();
    const routeTable = buildRouteTable();
    const domains = getAllDomains();

    return {
      stats,
      domainCount: domains.length,
      routeCount: routeTable.length,
      siteCount: SITES.length,
      phase1: getPhase1().map(s => s.domain),
      phase2: getPhase2().map(s => s.domain),
      phase3: getPhase3().map(s => s.domain),
      activeSites: getActive().map(s => s.domain),
      allDomainsHaveSites: domains.every(d => domainMap[d]),
      valid: true
    };
  }
};

export default SiteRegistry;
