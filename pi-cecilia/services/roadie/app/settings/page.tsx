import { SettingsTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <SettingsTemplate
      hero={{
        eyebrow: '01 — Settings',
        title: 'Roadie Settings',
        description:
          'Roadie settings should control learning flow, tutoring support, and how progress and session context are tracked across guided interactions.',
        actions: [
          { label: 'Open runtime', href: '/' },
          { label: 'Open help', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Learning flow', value: 'paced', note: 'Session structure, pacing, and progress checkpoints should remain visible together.' },
        { label: 'Support', value: 'guided', note: 'Escalation triggers and tutor handoff defaults should keep the learning flow intact.' },
        { label: 'Tracking', value: 'retained', note: 'Learner state, note retention, and completion summaries should stay auditable.' }
      ]}
      lanes={[
        { title: 'Learning flow', items: ['Default session structure', 'Lesson pacing', 'Progress checkpoint policy'] },
        { title: 'Support', items: ['Escalation trigger rules', 'Tutor handoff defaults', 'Docs destination priority'] },
        { title: 'Tracking', items: ['Session note retention', 'Learner state visibility', 'Completion summary defaults'] }
      ]}
      topics={[
        {
          title: 'Treat pacing as a runtime control',
          body: 'Roadie settings should shape how guided learning unfolds instead of leaving every session to operator improvisation.'
        },
        {
          title: 'Keep learner state legible',
          body: 'Tutoring systems degrade quickly when session notes and progress summaries stop being easy to resume and audit.'
        }
      ]}
    />
  )
}
