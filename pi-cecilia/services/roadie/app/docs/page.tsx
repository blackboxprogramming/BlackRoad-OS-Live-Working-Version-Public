import { DocsTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <DocsTemplate
      hero={{
        eyebrow: '01 — Docs',
        title: 'Roadie Documentation',
        description:
          'Use this surface for tutoring flows, prompt conventions, lesson checkpoints, and the safety policy that should govern Roadie sessions.',
        actions: [
          { label: 'Read lesson flow', href: '/docs/lessons' },
          { label: 'Open runtime', href: '/', secondary: true }
        ]
      }}
      stats={[
        { label: 'Learning tracks', value: '3', note: 'Onboarding, active tutoring, and review need different documentation paths.' },
        { label: 'Safety posture', value: 'explicit', note: 'Escalation, age-appropriateness, and human review should always be easy to audit.' },
        { label: 'Completion model', value: 'guided', note: 'Document what counts as lesson completion instead of leaving tutoring sessions open-ended.' }
      ]}
      lanes={[
        { title: 'Learn', items: ['Onboarding', 'Lesson structure', 'Checkpoints'] },
        { title: 'Safeguard', items: ['Prompt policy', 'Escalation', 'Operator review'] },
        { title: 'Operate', items: ['Runtime support', 'Docs links', 'Quality checks'] }
      ]}
      topics={[
        { title: 'Tutoring docs must be practical', body: 'A strong docs surface helps tutors and operators run the same lesson flow consistently.' },
        { title: 'Safety is part of the runtime', body: 'Do not bury safety rules in separate notes; they belong directly in the Roadie documentation path.' }
      ]}
    />
  )
}
