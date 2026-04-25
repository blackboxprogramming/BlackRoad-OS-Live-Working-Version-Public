import { AppRuntimeTemplate } from './_components/blackroad-templates'

export default function HomePage() {
  return (
    <AppRuntimeTemplate
      hero={{
        eyebrow: '01 — Roadie',
        title: 'Guided Learning, Structured Practice, And Tutor Support',
        description:
          'Roadie is the guided learning and tutoring surface for structured sessions, practice flows, and learner support. This root route should feel like an active tutoring product.',
        actions: [
          { label: 'Open guidance', href: '/help' },
          { label: 'Read docs', href: '/docs', secondary: true }
        ]
      }}
      stats={[
        { label: 'Guided learning', value: 'guided', note: 'Turn lessons, tasks, and next steps into structured learning flows instead of loose chat prompts.' },
        { label: 'Tutor support', value: 'guided', note: 'Keep Roadie oriented around explanation, progress, and intervention rather than generic answer generation.' },
        { label: 'Canonical routing', value: 'guided', note: 'Point deeper product and support detail toward the documented docs surface without drifting to duplicate hosts.' }
      ]}
      lanes={[
        { title: 'Learn', items: ['Start guided session', 'Review goals and gaps', 'Choose learning path'] },
        { title: 'Practice', items: ['Open exercises', 'Check progress state', 'Route to help and docs'] },
        { title: 'Support', items: ['Escalate blocker', 'Review learning notes', 'Hand off next action'] }
      ]}
      topics={[
        { title: 'Make tutoring structured instead of generic', body: 'Roadie should guide users through clear learning flows, surface next actions, and preserve progress and context without collapsing into a generic chat interface.' },
        { title: 'Progress should stay visible', body: 'The tutoring product is strongest when lesson goals, practice state, and support signals stay visible in the same runtime.' }
      ]}
    />
  )
}
