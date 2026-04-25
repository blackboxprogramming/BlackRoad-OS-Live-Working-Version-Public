---
name: New Agent Proposal
about: Propose a new agent for the finance pack
title: '[AGENT] '
labels: ['type:agent', 'pack:finance', 'status:ready']
assignees: ''

---

## Agent Name
<!-- Proposed agent name (e.g., agent.tax-calculator) -->

## Agent Role
<!-- What is the primary role/responsibility of this agent? -->

## Skills
<!-- List the key skills/capabilities this agent will have -->
- 
- 
- 

## Use Cases
<!-- Describe the main use cases for this agent -->

## Dependencies
<!-- External services or APIs this agent will integrate with -->
- [ ] Stripe
- [ ] QuickBooks
- [ ] Plaid
- [ ] Other (specify):

## Permissions Required
<!-- What permissions does this agent need? -->
- [ ] read:financial_data
- [ ] write:reports
- [ ] admin:budgets
- [ ] Other (specify):

## Integration Points
<!-- Which repos/packs will this agent integrate with? -->

## Implementation Notes
<!-- Technical details, architecture considerations, etc. -->

## Registry Entry
<!-- Proposed agents.json entry -->
```json
{
  "id": "agent.",
  "display_name": "",
  "pack_id": "pack.finance",
  "role": "",
  "skills": [],
  "repos": ["blackroad-os-pack-finance"],
  "environments": ["railway"],
  "permissions": {
    "github": "read",
    "railway": "read"
  },
  "status": "active"
}
```
