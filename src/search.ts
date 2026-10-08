export type Algorithm = "astar" | "dijkstra";
export type Tool = "wall" | "erase" | "start" | "goal";
export type Preset = "warehouse" | "open" | "divider";
export interface Grid {
  width: number;
  height: number;
  walls: Set<number>;
  start: number;
  goal: number;
}
export interface Result {
  path: number[];
  visited: number[];
  cost: number | null;
}
export function search(g: Grid, algorithm: Algorithm): Result {
  const { width: w, height: h, start, goal, walls } = g;
  if (
    !Number.isInteger(w) ||
    !Number.isInteger(h) ||
    w < 1 ||
    h < 1 ||
    w * h > 10000
  )
    throw new Error("Invalid grid dimensions");
  const valid = (n: number) => Number.isInteger(n) && n >= 0 && n < w * h;
  if (
    !valid(start) ||
    !valid(goal) ||
    walls.has(start) ||
    walls.has(goal) ||
    [...walls].some((n) => !valid(n))
  )
    throw new Error("Invalid endpoints or walls");
  const heuristic = (n: number) =>
    algorithm === "astar"
      ? Math.abs((n % w) - (goal % w)) +
        Math.abs(Math.floor(n / w) - Math.floor(goal / w))
      : 0;
  const distance = new Map([[start, 0]]),
    parent = new Map<number, number>(),
    closed = new Set<number>(),
    visited: number[] = [];
  let order = 0;
  const open = [
    { n: start, f: heuristic(start), h: heuristic(start), order: order++ },
  ];
  while (open.length) {
    open.sort((a, b) => a.f - b.f || a.h - b.h || a.order - b.order);
    const { n } = open.shift()!;
    if (closed.has(n)) continue;
    closed.add(n);
    visited.push(n);
    if (n === goal) {
      const path = [n];
      while (path[0] !== start) path.unshift(parent.get(path[0])!);
      return { path, visited, cost: distance.get(n)! };
    }
    const adjacent = [
      n % w < w - 1 ? n + 1 : -1,
      n + w,
      n % w ? n - 1 : -1,
      n - w,
    ];
    for (const next of adjacent) {
      if (!valid(next) || walls.has(next) || closed.has(next)) continue;
      const cost = distance.get(n)! + 1;
      if (cost < (distance.get(next) ?? Infinity)) {
        distance.set(next, cost);
        parent.set(next, n);
        const h = heuristic(next);
        open.push({ n: next, f: cost + h, h, order: order++ });
      }
    }
  }
  return { path: [], visited, cost: null };
}
export function preset(name: Preset): Grid {
  const width = 24,
    height = 16,
    walls = new Set<number>();
  if (name === "warehouse")
    for (const x of [4, 8, 12, 16, 20])
      for (let y = 3; y < 13; y++)
        if (y !== 7 && y !== 8) {
          walls.add(y * width + x);
          walls.add(y * width + x + 1);
        }
  if (name === "divider")
    for (let y = 0; y < height; y++) walls.add(y * width + 12);
  return { width, height, walls, start: width * 8 + 1, goal: width * 6 + 22 };
}
export function editGrid(g: Grid, n: number, tool: Tool): Grid {
  if (!Number.isInteger(n) || n < 0 || n >= g.width * g.height) return g;
  const next = { ...g, walls: new Set(g.walls) };
  if (tool === "start" || tool === "goal") {
    next[tool] = n;
    next.walls.delete(n);
  } else if (tool === "erase") next.walls.delete(n);
  else if (n !== g.start && n !== g.goal) next.walls.add(n);
  return next;
}
