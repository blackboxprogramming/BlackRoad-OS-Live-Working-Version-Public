# RoadPad

Terminal-native plain-text editor for BlackRoad OS.

## Startup Surface

RoadPad renders this fixed startup shell:

```text
▗ ▗   ▖ ▖  RoadPad v0.1.0
           Lucidia · BlackRoad OS
  ▘▘ ▝▝    ~

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
>  describe a task to get started
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  ⏵⏵ accept edits on (shift+tab to cycle)                                                                                                                               editor mode
```

## Behavior

- The `>` line is the active input line.
- Typing replaces the placeholder text.
- `Enter` commits the input line into the plain-text editor buffer.
- `Shift+Tab` cycles accept-edits mode labels (`on`, `review`, `off`).
- No chat workflow, no assistant overlays, no token counters.

## File Support

- `.txt`
- `.md`
- `.road`

## Keybindings

- `Ctrl+S`: Save
- `Ctrl+Q` or `Ctrl+C`: Quit
- `Shift+Tab`: Cycle accept-edits mode
- `Backspace`: Edit active input line
- `Enter`: Submit active input line to buffer
- `Arrow keys` / `Home` / `End`: Navigate in buffer

## Run

```bash
roadpad
roadpad notes.road
roadpad README.md
```

## Default Surface Setup

```bash
bash ~/roadpad/install-default-surface.sh
source ~/.zshrc
```

This config exports `BLACKROAD_DEFAULT_SURFACE=roadpad`, sets `EDITOR`/`VISUAL`, and installs `roadpad` + `blackroad-surface` launchers in `~/.local/bin`.

## Architecture

```text
~/roadpad/
├── roadpad.py                  # Main input loop
├── renderer.py                 # Deterministic terminal rendering
├── buffer.py                   # Plain-text source of truth
├── config.py                   # Optional local config helpers
├── roadpad                     # Shell launcher
├── roadpad.env                 # Default-surface environment flags
└── install-default-surface.sh  # Default-launch wiring helper
```
