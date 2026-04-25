import { HelpTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <HelpTemplate
      hero={{
        eyebrow: '01 — Help',
        title: 'OneWay Help',
        description:
          'OneWay help should teach operators how to move data safely between BlackRoad runtimes without losing provenance, ownership, or canonical alignment.',
        actions: [
          { label: 'Open runtime', href: '/' },
          { label: 'Open settings', href: '/settings', secondary: true }
        ]
      }}
      stats={[
        { label: 'Migration model', value: 'traceable', note: 'Exports, imports, and handoffs should preserve provenance and ownership context.' },
        { label: 'Canonical host', value: 'oneway.blackroad.io', note: 'Use OneWay as the portability and migration control surface.' },
        { label: 'Close the loop', value: 'required', note: 'Every transfer should leave behind an auditable trail of what moved and why.' }
      ]}
      lanes={[
        { title: 'Prepare', items: ['Confirm source product', 'Confirm target runtime', 'Verify ownership and canonical host'] },
        { title: 'Validate', items: ['Check schema version', 'Check redaction policy', 'Check destination ownership'] },
        { title: 'Close', items: ['Record what moved', 'Record where it landed', 'Record doc or registry changes'] }
      ]}
      topics={[
        {
          title: 'Prepare a migration package carefully',
          body: 'Confirm the source product, canonical host, ownership, and target runtime before exporting files, records, or metadata.'
        },
        {
          title: 'Treat handoff evidence as part of the product',
          body: 'The value of OneWay is not only the transfer itself but the fact that a later agent can audit the path cleanly.'
        }
      ]}
    />
  )
}
