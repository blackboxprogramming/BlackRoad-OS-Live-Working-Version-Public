import { AppRuntimeTemplate } from './_components/blackroad-templates'

export default function HomePage() {
  return (
    <AppRuntimeTemplate
      hero={{
        eyebrow: '01 — RoadWork',
        title: 'Business Controls, Launch Readiness, And Change Governance',
        description:
          'RoadWork is the operating surface for business controls, launch readiness, compliance review, and cross-product change governance. This root route should act like a working operations console.',
        actions: [
          { label: 'Open controls', href: '/settings' },
          { label: 'Operator guidance', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Policy lanes', value: 'active', note: 'Keep compliance, contracts, reviews, and operational controls visible instead of spread across separate tools.' },
        { label: 'Approval flow', value: 'active', note: 'Track what is waiting on legal, finance, or operator sign-off before it blocks launches and migrations.' },
        { label: 'Evidence trail', value: 'active', note: 'Tie decisions, exports, and change history back to the canonical product and domain system.' }
      ]}
      lanes={[
        { title: 'Compliance', items: ['Policies and controls', 'Vendor reviews', 'Launch readiness checks'] },
        { title: 'Operations', items: ['Change requests', 'Host ownership', 'Runtime escalation routing'] },
        { title: 'Data and audit', items: ['Export packages', 'Decision records', 'Retention and archive plans'] }
      ]}
      topics={[
        { title: 'Make business operations visible early', body: 'RoadWork should give BlackRoad a canonical place to review launch readiness, route approvals, and keep policy decisions attached to the products and domains they affect.' },
        { title: 'Governance needs product context', body: 'Compliance and launch-control work are strongest when they stay tied to the products, hosts, and changes they actually govern.' }
      ]}
    />
  )
}
