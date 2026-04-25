# BlackRoad OS Research Lab Pack

Mathematical research, quantum computing experiments, and computational proof systems for the BlackRoad OS ecosystem.

## Overview

The Research Lab pack provides a unified home for all mathematical and computational research within BlackRoad OS. It parallels and integrates with the `blackboxprogramming/blackroad-prism-console` math modules.

## Structure

```
research-lab/
├── math/                      # Mathematical modules
│   ├── hilbert_core.py        # Hilbert space symbolic reasoning
│   ├── collatz/               # Collatz conjecture verification
│   ├── linmath/               # Linear mathematics (C library)
│   ├── lucidia_math_forge/    # Symbolic proof engine
│   └── lucidia_math_lab/      # Experimental mathematics
├── quantum/                   # Quantum computing
│   ├── lucidia_quantum/       # Quantum core
│   └── quantum_engine/        # Circuit simulation
├── experiments/               # Research experiments
│   └── br_math/               # Mathematical experiments
├── docs/                      # Documentation
├── pack.yaml                  # Pack manifest
└── README.md                  # This file
```

## Modules

### Hilbert Core (`hilbert_core.py`)
Quantum-inspired symbolic reasoning using density matrices and projectors.

```python
from hilbert_core import pure_state, truth_degree, projector_from_basis

# Create a pure state
psi = pure_state([1, 0, 0])

# Measure truth degree
P = projector_from_basis([[1], [0], [0]])
degree = truth_degree(psi, P)  # Returns 1.0
```

### Collatz Verification (`collatz/`)
Distributed Collatz conjecture verification system.

```bash
# Start orchestrator
python -m collatz.orchestrator --start 1 --end 1000000000 --db ./campaign.sqlite

# Run workers on devices
python -m collatz.worker --db ./campaign.sqlite
```

### Lucidia Math Forge (`lucidia_math_forge/`)
Symbolic proof engine with contradiction detection.

- `proofs.py` - Lightweight symbolic proof engine
- `operators.py` - Mathematical operators
- `numbers.py` - Number theory
- `fractals.py` - Fractal generation
- `dimensions.py` - Dimensional analysis

### Lucidia Math Lab (`lucidia_math_lab/`)
Interactive mathematical exploration.

- `prime_explorer.py` - Prime analysis with Ulam spirals
- `trinary_logic.py` - Ternary logic systems
- `quantum_finance.py` - Quantum-inspired financial math
- `iterative_math_build.py` - Iterative construction

### Linear Math (`linmath/`)
C header library for vectors, matrices, and transformations.

```c
#include "linmath.h"

vec3 v = {1.0f, 2.0f, 3.0f};
mat4x4 m;
mat4x4_identity(m);
mat4x4_rotate_Z(m, m, 0.5f);
```

## Research Areas

| Area | Description | Modules |
|------|-------------|---------|
| Number Theory | Primes, Collatz, Riemann | collatz, prime_explorer |
| Proof Systems | Symbolic proofs, contradictions | lucidia_math_forge, hilbert_core |
| Quantum Computing | Circuits, simulation | lucidia_quantum, quantum_engine |
| Computational Geometry | Linear algebra, transforms | linmath, hilbert_core |
| Logic Systems | Trinary, fuzzy, non-classical | lucidia_math_lab |

## Integration

### With QLM Lab
```python
# The pack integrates with /qlm_lab
from qlm_lab import api as qlm
from packs.research_lab.math import hilbert_core
```

### With Agent System
Research agents from the agent registry can interact with these modules:
- `agent.lucidia.core` - Core Lucidia intelligence
- `agent.lucidia.math` - Mathematical operations
- `agent.research.assistant` - Research coordination

## Source Repositories

This pack parallels content from:
- `blackboxprogramming/blackroad-prism-console` (source)
- `BlackRoad-OS/blackroad-os-prism-console` (target)

Maintained sync ensures mathematical research is available across the ecosystem.

## Contributing

1. Add new experiments to `experiments/`
2. Extend math modules in `math/`
3. Update `pack.yaml` with new modules
4. Run verification tests before committing

## License

Apache 2.0 - See LICENSE file
