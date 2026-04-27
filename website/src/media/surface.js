const DEFAULTS = {
  subtitle: '',
  kind: 'embed',
  provider: 'unknown',
  url: '',
  embedUrl: '',
  thumbnail: null,
  status: 'ready',
  rights: 'unknown',
  captureable: false,
  tags: [],
  notes: '',
  rail: 'none',
  order: 0,
};

function normalizeSurface(surface) {
  const now = new Date().toISOString();
  return {
    ...DEFAULTS,
    ...surface,
    createdAt: surface.createdAt || now,
    updatedAt: surface.updatedAt || now,
    tags: Array.isArray(surface.tags) ? [...surface.tags] : [],
  };
}

function matchesQuery(surface, query) {
  if (!query) return true;
  const haystack = [
    surface.id,
    surface.title,
    surface.subtitle,
    surface.kind,
    surface.provider,
    surface.rights,
    surface.notes,
    ...surface.tags,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export class SurfaceRegistry {
  constructor({ surfaces = [], adapters = [] } = {}) {
    this.surfaces = new Map();
    this.adapters = adapters;
    surfaces.forEach((surface) => this.add(surface));
  }

  add(surface) {
    const normalized = normalizeSurface(surface);
    this.surfaces.set(normalized.id, normalized);
    return normalized;
  }

  get(id) {
    return this.surfaces.get(id) || null;
  }

  update(id, patch) {
    const current = this.get(id);
    if (!current) return null;
    const updated = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.surfaces.set(id, updated);
    return updated;
  }

  list() {
    return [...this.surfaces.values()].sort((a, b) => a.title.localeCompare(b.title));
  }

  listByRail(rail) {
    return this.list()
      .filter((surface) => surface.rail === rail)
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  }

  listByKind(kind) {
    return this.list().filter((surface) => surface.kind === kind);
  }

  listByProvider(provider) {
    return this.list().filter((surface) => surface.provider === provider);
  }

  search(query) {
    return this.list().filter((surface) => matchesQuery(surface, query));
  }

  findByIdOrTitle(query) {
    const lower = String(query || '').trim().toLowerCase();
    if (!lower) return null;
    return (
      this.list().find((surface) => surface.id.toLowerCase() === lower) ||
      this.list().find((surface) => surface.title.toLowerCase() === lower)
    );
  }

  resolveAdapter(surface) {
    return (
      this.adapters.find((adapter) => {
        try {
          return adapter.canHandle(surface);
        } catch {
          return false;
        }
      }) || null
    );
  }
}

