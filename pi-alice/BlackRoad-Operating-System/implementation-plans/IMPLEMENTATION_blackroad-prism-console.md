# 🚀 IMPLEMENTATION PLAN: blackroad-prism-console
## Admin Dashboard for Observability & Job Management

**Repo**: `blackboxprogramming/blackroad-prism-console`
**Purpose**: Web UI for Prism job queue, system metrics, audit logs
**Phase**: **Phase 2 (Months 14-18)**

---

## PURPOSE

**blackroad-prism-console** is the **admin dashboard** for monitoring and managing the BlackRoad OS ecosystem:
- Visualize Prism job queue
- Monitor agent execution
- View system metrics (Prometheus)
- Audit logs (Vault)
- User management
- Configuration management

**Role in Architecture**: **Layer 6** (Application Layer) - Admin UI

**Domain**: `prism.blackroad.systems`

---

## TECHNOLOGY STACK

**Option A** (Recommended): React + TypeScript
- Modern, scalable
- Rich ecosystem (React Query, Recharts, Ant Design)
- TypeScript for type safety

**Option B**: Vanilla JS (consistent with OS aesthetic)
- Zero dependencies
- Windows 95 theme
- Simple, fast

**Recommendation**: **React + TypeScript** (professional admin tool, different audience than OS)

---

## KEY FEATURES

### 1. Job Queue Dashboard

**Components**:
- Job list (filterable by status, type, date)
- Job details (logs, timeline, metadata)
- Real-time updates (WebSocket)
- Job actions (cancel, retry, clone)

**Example**:
```typescript
// src/components/JobQueue.tsx
import { useQuery } from 'react-query'
import { Table, Badge } from 'antd'

export function JobQueue() {
  const { data: jobs } = useQuery('jobs', fetchJobs, {
    refetchInterval: 5000  // Poll every 5 seconds
  })

  return (
    <Table
      dataSource={jobs}
      columns={[
        { title: 'ID', dataIndex: 'id' },
        { title: 'Type', dataIndex: 'type' },
        { title: 'Status', dataIndex: 'status', render: (status) => (
          <Badge
            status={status === 'running' ? 'processing' : 'default'}
            text={status}
          />
        )},
        { title: 'Created', dataIndex: 'created_at' },
      ]}
    />
  )
}
```

### 2. System Metrics

**Metrics Sources**:
- Prometheus (backend metrics)
- PostgreSQL (database stats)
- Redis (cache hit rate)
- Railway (infrastructure stats)

**Dashboards**:
- API Performance (latency, throughput, errors)
- Database Performance (queries, connections, slow queries)
- Agent Execution (success rate, duration)
- User Activity (active users, sessions)

### 3. Audit Logs (Vault)

**Features**:
- Search logs by user, action, date
- Export logs (CSV, JSON)
- Compliance reports (SOX, GDPR)
- Immutable log viewer

---

## REPOSITORY STRUCTURE

```
blackroad-prism-console/
├── src/
│   ├── components/
│   │   ├── JobQueue.tsx
│   │   ├── Metrics.tsx
│   │   ├── AuditLogs.tsx
│   │   └── UserManagement.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Jobs.tsx
│   │   ├── Metrics.tsx
│   │   └── Settings.tsx
│   ├── api/
│   │   └── client.ts  # API client for blackroad-api
│   ├── hooks/
│   │   └── useWebSocket.ts  # Real-time updates
│   └── App.tsx
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts  # Build tool (Vite)
└── README.md
```

---

## REQUIRED WORKFLOWS

1. **CI/CD** - Build, test, deploy to Vercel/Railway
2. **Type Check** - TypeScript type checking
3. **E2E Tests** - Playwright for UI tests
4. **Lighthouse** - Performance audits

---

## CLOUDFLARE & DOMAINS

**DNS Records** (`blackroad.systems` zone):

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | prism | `blackroad-prism-console.vercel.app` | ✅ |

**Deployment**: Vercel (recommended for React SPAs)

---

## MIGRATION NOTES

**New Repo** (not migrated from monolith)

**Bootstrap**:
```bash
# Create React app with TypeScript
npm create vite@latest blackroad-prism-console -- --template react-ts

# Install dependencies
cd blackroad-prism-console
npm install react-query axios antd recharts

# Connect to blackroad-api
# Create .env.production
VITE_API_URL=https://api.blackroad.systems
VITE_WS_URL=wss://api.blackroad.systems/ws
```

**Effort**: 4-6 weeks (full dashboard build)

---

## PHASE 2 MILESTONES

**Month 14-15**: Repo setup, basic job queue UI
**Month 16-17**: Metrics dashboards, audit logs
**Month 18**: User management, production deployment

**Success Criteria**:
- ✅ Real-time job queue updates
- ✅ <1s dashboard load time
- ✅ 100% mobile responsive
- ✅ Used daily by team

---

**Last Updated**: 2025-11-18
