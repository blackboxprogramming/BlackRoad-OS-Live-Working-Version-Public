import { HelpTemplate } from '../../_components/blackroad-templates'

export default function HelpTemplatePage() {
  return (
    <HelpTemplate
      hero={{
        eyebrow: '01 — Help',
        title: 'Guided Support Surface',
        description: 'Use this for product help routes that need to orient users quickly, surface the common fixes, and route deeper issues into docs or escalation.',
        actions: [
          { label: 'Open docs', href: '/docs' },
          { label: 'Open runtime', href: '/app', secondary: true }
        ]
      }}
      stats={[
        { label: 'Common paths', value: '3', note: 'Show the shortest guidance paths first: start, fix, escalate.' },
        { label: 'Escalation', value: 'clear', note: 'Users should know where to go when the quick path fails.' },
        { label: 'Runtime link', value: 'present', note: 'Help should lead back into the product, not strand the user.' }
      ]}
      lanes={[
        { title: 'Start', items: ['Bootstrap', 'Open the right route', 'Confirm canonical host'] },
        { title: 'Fix', items: ['Check health', 'Use settings', 'Read docs pointers'] },
        { title: 'Escalate', items: ['Identify owner', 'Capture blockers', 'Hand off clearly'] }
      ]}
      topics={[
        { title: 'Help is directional', body: 'The page should quickly route the reader toward the next action instead of trying to be the full documentation site.' },
        { title: 'Keep escalation explicit', body: 'When the fast fix fails, the reader should immediately know which owner or support surface comes next.' }
      ]}
    />
  )
}
