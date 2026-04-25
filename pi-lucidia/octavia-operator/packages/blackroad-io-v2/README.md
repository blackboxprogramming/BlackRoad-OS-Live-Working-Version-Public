# BlackRoad State Pipeline

Source of truth lives in JSON.
Derived state is generated deterministically.

Flow:
  repos.json → generate.sh → state files → git commit

Never edit generated files by hand.
