import { AppRuntimeTemplate } from './_components/blackroad-templates'

export default function HomePage() {
  return (
    <AppRuntimeTemplate
      hero={{
        eyebrow: '01 — RoadCode',
        title: 'Agentic Coding, Repo Execution, And MCP-Aware Development',
        description:
          'RoadCode is the app-at-root coding surface for engineering work. It should feel like the live development environment, not a marketing placeholder.',
        actions: [
          { label: 'Open studio unlock flow', href: '/product/studio' },
          { label: 'Open docs', href: '/docs' },
          { label: 'Workspace settings', href: '/settings', secondary: true },
          { label: 'Founder auth/payment spec', href: '/docs', secondary: true }
        ]
      }}
      stats={[
        { label: 'Agent workspace', value: 'live', note: 'Coordinate coding agents, runtime jobs, and repo operations from one surface.' },
        { label: 'MCP routing', value: 'visible', note: 'Track tool surfaces, model routing, and connector availability without leaving the app.' },
        { label: 'Execution state', value: 'live', note: 'Keep build, deploy, and recovery work visible instead of buried in shell history.' }
      ]}
      lanes={[
        { title: 'Code', items: ['Open active repos', 'Watch implementation queues', 'Review generated app shells'] },
        { title: 'Ops', items: ['Check API health', 'Confirm routing ownership', 'Prepare deploy handoff'] },
        { title: 'Docs', items: ['Read operating model', 'Update product docs', 'Sync canonical registry intent'] }
      ]}
      topics={[
        { title: 'RoadCode proves the app-at-root pattern', body: 'BlackRoad OS already proved the split model. RoadCode should be the reference for a product whose runtime begins immediately at `/`.' },
        { title: 'Coding surfaces need execution visibility', body: 'Repo activity, MCP routing, and deployment state should be visible in the same app instead of scattered across terminals and stale notes.' }
      ]}
    />
  )
}
