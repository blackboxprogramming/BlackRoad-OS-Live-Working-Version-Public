// BlackRoad OS — Registry System
// Single import for the entire product + site + template system
//
// Usage:
//   import { ProductRegistry, SiteRegistry } from './src/blackroad/index.js';
//
// 18 products. 73+ sites. 10 pages per product. 180+ product pages.
// 27 agent sites. 16 utility sites. 13 root sites.
// One OS. One template. One empire.

export { ProductRegistry } from './productRegistry.js';
export { SiteRegistry } from './siteRegistry.js';

// Direct exports for convenience
export { PRODUCTS, CATEGORIES, getProduct, getByCategory, getByTag, getConnected } from './products.js';
export { STANDARD_PAGES, getProductRoutes, getAllRoutes } from './productRoutes.js';
export { UNIVERSAL_COPY, SITE_RULEBOOK, getProductCopy } from './productCopy.js';
export { SITES, SITE_TYPES, getSite, getByType, getActive } from './sites.js';
export { ROOT_DOMAINS, buildDomainMap, getAllDomains } from './domains.js';
export { buildRouteTable, buildOSRoutes } from './routes.js';
export { TOP_NAV, FOOTER_NAV, PRODUCT_NAV, RUNTIME_NAV, getNavForType } from './navModel.js';
export { getCTAs } from './ctaModel.js';
export { LANDING_SECTIONS, buildLandingSections } from './pageSections.js';
export { buildProductPage, buildProductSite, buildSitePage, buildAllProductSites, DESIGN, FOOTER } from './siteTemplates.js';
export { buildAllPages, buildPage } from './sitePages.js';
export { SITE_COPY } from './siteCopy.js';

// SEO, sitemap, AI-readable layer
export { buildProductSEO, buildSiteSEO, buildAllSEO, DEFAULT_OG } from './seoRegistry.js';
export { buildSitemap, buildSitemapIndex, buildAllSitemaps } from './sitemap.js';
export { buildRobots, buildAllRobots } from './robots.js';
export { buildProductLlmsText, buildSiteLlmsText, buildLlmsText, buildAllLlmsText } from './llmsText.js';
export { buildManifest, buildSiteJson, buildAllManifests } from './siteManifests.js';
export { buildOpenGraph, buildMetaTags, buildAllOpenGraph } from './openGraph.js';
export { buildSchema, buildSchemaTag, buildAllSchemas } from './schemaOrg.js';

// UI components
export { SiteShell, renderFullPage, ALL_COMPONENT_CSS } from './ui/SiteShell.js';
export { TopBar } from './ui/TopBar.js';
export { MediaRail } from './ui/MediaRail.js';
export { HeroPanel } from './ui/HeroPanel.js';
export { QuickActions } from './ui/QuickActions.js';
export { StatsRow } from './ui/StatsRow.js';
export { ProductLauncherGrid } from './ui/ProductLauncherGrid.js';
export { CommandDock, initCommandDock, routeCommand, executeCommand, searchCommand } from './ui/CommandDock.js';
export { CommandSuggestions } from './ui/CommandSuggestions.js';
export { CommandResult } from './ui/CommandResult.js';
export { CommandLog } from './ui/CommandLog.js';
export { TerminalFooter } from './ui/TerminalFooter.js';
export { SurfaceFrame } from './ui/SurfaceFrame.js';
export { TrustNotice } from './ui/TrustNotice.js';
export { renderProductContent, getLayout, buildHead } from './ui/SitePage.js';
export { SurfaceDesktop } from './ui/SurfaceDesktop.js';
export { SurfaceTaskbar } from './ui/SurfaceTaskbar.js';
export { SurfaceTabs } from './ui/SurfaceTabs.js';
export { SurfaceLauncher } from './ui/SurfaceLauncher.js';
export { SurfaceFallback } from './ui/SurfaceFallback.js';
export { SurfaceMetadata } from './ui/SurfaceMetadata.js';

// Command layer
export { route } from './command/commandRouter.js';
export { execute } from './command/commandActions.js';
export { search } from './command/commandSearch.js';
export { AGENTS, PRODUCT_ALIASES, AGENT_ALIASES } from './command/commandRegistry.js';
export { addToHistory, getHistory, clearHistory } from './command/commandHistory.js';
export { getSuggestions } from './command/commandSuggestions.js';

// Surface runtime
export { SURFACE_KINDS, OPEN_MODES, FALLBACK_MODES } from './surfaces/surfaceTypes.js';
export { ALL_SURFACES, getSurface, getProductSurface, getAgentSurface, SURFACE_COUNTS } from './surfaces/surfaceRegistry.js';
export { openSurface, closeSurface, focusSurface, getActiveSurfaces, getFocusedSurface, openFromCommandResult } from './surfaces/surfaceRuntime.js';
export { routeFromUrl, routeFromCommand, routeToProduct, routeToAgent } from './surfaces/surfaceRouter.js';
export { adaptSurface } from './surfaces/surfaceAdapters.js';
export { requiresPermission, checkPermissions } from './surfaces/surfacePermissions.js';
