# RouteLab

An interactive warehouse pathfinding studio. Draw shelves, move the start and goal,
and compare A* with Dijkstra on the same floor plan. React, TypeScript and Canvas;
all computation stays in your browser. No API keys, accounts or physical robot.

## Run

Use Node.js 24 LTS and npm:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To verify or build:

```sh
npm test
npm run build
npm run preview
npx playwright install chromium --only-shell
npm run test:browser
```

`npm ci` downloads dependencies. Once installed, the application needs no backend
or external requests. `dist/` is a static build suitable for hosting; this repository
does not automatically deploy it. The default server listens on localhost.

## Explore

1. Start with Warehouse A. Choose **Run search** to animate explored cells and route.
2. Select **Dijkstra** to compare how many cells it settles with A*.
3. Use **Shelves**, **Erase**, **Start** or **Goal**, then click/drag on the map.
4. **Blocked aisle** demonstrates an unreachable goal. Erase a gap to restore a path.
5. Use **Step**, **Pause**, **Replay**, **Show route** and speed to inspect progress.

Keyboard: Tab to the map, arrow keys move the selection, Enter/Space applies the
selected tool. The selected row/column is announced. Endpoints cannot be painted
as shelves; moving an endpoint onto a shelf clears it. Start and goal may overlap.
Reduced-motion users get the final result when pressing Run.

## Algorithms and metrics

- Fixed 24 × 16 grid, four neighbors, unit cost per move. No diagonals.
- Dijkstra prioritizes distance travelled. A* prioritizes `g + Manhattan distance`.
- Manhattan distance never overestimates under these movement rules.
- Both return a shortest path, but ties can produce different equally short paths.
- **Path steps** counts edges, not cells. Start = goal costs zero.
- **Explored** counts unique cells popped/settled, including start and goal when reachable.
- A* breaks equal f by lower heuristic, then insertion order; Dijkstra uses insertion
  order for equal distance. These choices affect the number of explored cells.
- Results are calculated immediately. Animation replays that trace; metrics show the
  completed search, not a live timing benchmark. An edit stops playback and recomputes.

The frontier uses a sorted array for clarity at this grid size. A heap would scale
better. No claim of universal A* speedup, production robotics readiness, or research
novelty is made.

## Structure

- `src/search.ts`: pure model, presets, editing and search.
- `src/main.tsx`: controls, playback state and Canvas rendering.
- `src/style.css`: responsive paper/forest interface.
- `tests/search.test.ts`: path correctness, independent BFS oracle over 100 seeded
  maps, unreachable/start=goal, mutation and editing checks.
- `browser-tests/app.spec.ts`: real Chromium UI interactions and responsive checks.
- `.github/workflows/ci.yml`: clean installation, tests, type check/build and browser tests.

## Limits

Single point-sized simulated robot, static obstacles, no real movement physics,
collision margins, dynamic obstacles, multi-robot coordination, saved layouts or
map import. Refresh resets your edits. Canvas has keyboard editing and textual
status but is not a full screen-reader representation of every map cell.

Interview explanation: “I implemented two shortest-path algorithms, verified them
against an independent BFS oracle, and separated their deterministic search trace
from animation so editing cannot leave stale routes on screen.”
