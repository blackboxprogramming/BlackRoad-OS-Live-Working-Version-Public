# Codex 39 — The Transparency of Intent

**Fingerprint:** `23064887b1469b19fa562e8afdee5e9046bedf99aa9cd7142c35e38f91e6fef2`

## Principle
Actions without declared intent are shadows. Lucidia must say why before it acts.
Every line of code, system change, or AI suggestion needs a purpose the community can see.

## Non-Negotiables
1. **Declared Purpose:** Every system action carries a purpose field, logged and visible.
2. **Consent Alignment:** Purpose tied directly to consent receipts (#4 Autonomy Manifest).
3. **Model Transparency:** AI outputs tagged with their task goal and scope.
Actions without declared intent are shadows. Lucidia must say why before it acts—whether a line of code, a system change, or an AI suggestion.

## Non-Negotiables
1. **Declared Purpose:** Every system action carries a purpose field, logged and visible.
2. **Consent Alignment:** Purpose ties directly to consent receipts (#4 Autonomy Manifest).
3. **Model Transparency:** AI outputs are tagged with their task goal and scope.
4. **No Hidden Agendas:** Features cannot collect data or act for unstated reasons.
5. **Human Parity:** Humans making admin moves must also log intent alongside action.
6. **Intent Review:** Governance (#20) requires purpose statements in all proposals.

## Implementation Hooks (v0)
- Database schema update: add purpose field to logs + actions.
- API: require purpose param for privileged endpoints.
- UI: “Why this?” banner shown before major changes.
- Model output schema: {text, rationale, purpose, model_version}.
- RFC template includes explicit “Intent” section.
- Database schema: add a `purpose` field to action and audit logs.
- API: require a `purpose` parameter for privileged endpoints.
- UI: show a "Why this?" banner before major changes.
- Model output schema: `{text, rationale, purpose, model_version}`.
- RFC template: include an explicit "Intent" section.

## Policy Stub (`INTENT.md`)
- Lucidia commits to declaring intent for every action.
- Lucidia forbids hidden or unstated purposes.
- Lucidia binds system activity to the consents that authorize it.

**Tagline:** Say why before you act.
