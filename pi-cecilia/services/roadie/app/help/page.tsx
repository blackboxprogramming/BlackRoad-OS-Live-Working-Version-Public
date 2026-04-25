import { HelpTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <HelpTemplate
      hero={{
        eyebrow: '01 — Help',
        title: 'Roadie Help',
        description:
          'Roadie help should teach learners and operators how to move through guided study, practice, and support without losing the structure of the tutoring flow.',
        actions: [
          { label: 'Open docs', href: '/docs' },
          { label: 'Open settings', href: '/settings', secondary: true }
        ]
      }}
      stats={[
        { label: 'Learning mode', value: 'guided', note: 'Roadie should move learners through structured sessions instead of open-ended confusion.' },
        { label: 'Canonical host', value: 'roadie.blackroad.io', note: 'Use Roadie as the tutoring and guided-learning runtime.' },
        { label: 'Session closure', value: 'required', note: 'Every session should leave behind the next lesson lane or support path.' }
      ]}
      lanes={[
        { title: 'Start', items: ['Identify learning goal', 'Confirm current level', 'Pick the next lesson lane'] },
        { title: 'Support', items: ['Handle learner blocker', 'Escalate to docs or support', 'Preserve guided flow'] },
        { title: 'Close', items: ['Record what was learned', 'Record what remains blocked', 'Record next action'] }
      ]}
      topics={[
        {
          title: 'Handle learner blockers explicitly',
          body: 'Escalate to the right support or documentation path when the learner needs more than the current guided flow can provide.'
        },
        {
          title: 'Close the tutoring loop',
          body: 'Roadie is most useful when another session can resume cleanly later because the previous one recorded progress and the next step.'
        }
      ]}
    />
  )
}
