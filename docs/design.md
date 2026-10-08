# RouteLab implementation brief
Approved: single-robot warehouse path planning, React/TypeScript/Canvas, A* and Dijkstra, no paid service.
Use a fixed 24 × 16 four-neighbor unit-cost grid. Separate pure search/model functions from React state and Canvas rendering. Manhattan A* tie-breaks by lower h then insertion order; Dijkstra uses distance then insertion order. Report popped unique cells, cost in steps, and path; no claimed wall-clock benchmark.
UI: paper/forest palette, orange route, editable canvas with keyboard cursor and labeled toolbar. Shelf/erase/start/goal tools, warehouse/open/divider presets, play/pause/step/replay, speed control, two result cards. Edits cancel playback and recompute immediately; endpoints cannot become obstacles. Respect reduced-motion preference.
Verification: independent BFS oracle over deterministic random maps, path validity, endpoint and unreachable edge cases, actual browser interactions and responsive screenshots. Publish branch/PR without merge.
Plan: tests first → pure engine → interface and canvas → build/browser verification → independent review → fixes → GitHub delivery. User requested autonomous completion; no additional design gate.
