# Git Model

> Every layer permanently references the layer above it. A merge request is a promotion.

## The Hierarchy

```
Enterprise (BlackRoad OS, Inc.)
  --> Org (44 GitHub organizations)
       --> User / Agent (27 agents + founder)
            --> Repo (services, products, knowledge)
                 --> Merge Request = promote to level above
                      --> Pull Request = permanent numbered reference
                           --> Branch = permanent section reference
                                --> Issue = permanent reference to branch
                                     --> Comment = reference to issue
```

## Merge as Promotion

A merge request does not mean "merge branch to main." It means "promote this thing to the scope above me."

- A repo merging to a user = shipping personal work
- A user merging to an org = contributing to a division
- An org merging to the enterprise = institutional adoption

The direction is always up.

## The 5-Layer Promotion Chain

| Layer | Location | Role |
|-------|----------|------|
| 0 | /Applications/BlackRoad/Index.md.rtf | Source of truth (17,290 sections) |
| 1 | Private Working Version | Dev / experiments |
| 2 | Private Monorepo | Consolidated internal |
| 3 | Public Monorepo | Consolidated external |
| 4 | Public Working Version | Production |

```
Layer 0 (Index.md.rtf -- the constitution)
  --> Layer 1 (Private Working -- codify into repo)
       --> Layer 2 (Private Mono -- stabilize)
            --> Layer 3 (Public Mono -- publish)
                 --> Layer 4 (Public Working -- ship)
                      --> Edge (CF Workers --> what users see)
```

## Permanent References

- Section 252 is always "Institute For Convoy Intelligence"
- Section 46 is always "Agents As Faculty"
- Section 1 is always "BlackRoad OS, Inc."
- PR numbers map to section numbers. They never close.
- Nothing gets deleted. Everything is an address in the tree.

## GitHub Repos

| Repo | Visibility | Branch Equivalent |
|------|-----------|-------------------|
| BlackRoad-OS-Live-Working-Version-Private | Private | dev |
| BlackRoad-OS-Live-Monorepo-Private | Private | staging |
| BlackRoad-OS-Live-Monorepo-Public | Public | release |
| BlackRoad-OS-Live-Working-Version-Public | Public | main / production |

## 44 Orgs = 44 Divisions

Each GitHub org is a school, institute, or lab from the Index. The repos inside each org are the departments. The agents are the faculty.

## Tools as Transport

| Tool | Role |
|------|------|
| Tailscale | Mesh between all compute nodes |
| Termius | SSH management across the mesh |
| GitHub | The permanent reference chain |
| CF Workers | Edge gateway (500 routing rules) |
| HF Spaces | Free compute tier |
| Pis | Origin compute |
