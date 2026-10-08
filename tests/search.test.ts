import { describe, it, expect } from "vitest";
import { search, type Grid, preset, editGrid } from "../src/search";
const grid = (walls: number[] = [], start = 0, goal = 24): Grid => ({
  width: 5,
  height: 5,
  walls: new Set(walls),
  start,
  goal,
});
function bfs(g: Grid) {
  const queue = [g.start],
    d = new Map([[g.start, 0]]);
  for (let i = 0; i < queue.length; i++) {
    const n = queue[i];
    if (n === g.goal) return d.get(n)!;
    for (const m of [
      n % g.width ? n - 1 : -1,
      n % g.width < g.width - 1 ? n + 1 : -1,
      n - g.width,
      n + g.width,
    ])
      if (m >= 0 && m < g.width * g.height && !g.walls.has(m) && !d.has(m)) {
        d.set(m, d.get(n)! + 1);
        queue.push(m);
      }
  }
  return null;
}
describe("search", () => {
  it("finds the optimal open-grid path", () => {
    for (const a of ["astar", "dijkstra"] as const) {
      const r = search(grid(), a);
      expect(r.cost).toBe(8);
      expect(r.path[0]).toBe(0);
      expect(r.path.at(-1)).toBe(24);
    }
  });
  it("reports unreachable", () =>
    expect(search(grid([5, 6, 7, 8, 9]), "astar").cost).toBeNull());
  it("handles start equal goal", () =>
    expect(search(grid([], 0, 0), "astar").path).toEqual([0]));
  it("rejects blocked or invalid endpoints", () => {
    expect(() => search(grid([0]), "astar")).toThrow();
    expect(() => search(grid([], 25), "astar")).toThrow();
  });
  it("agrees with independent BFS across 100 seeded maps", () => {
    let s = 47;
    const random = () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32;
    for (let i = 0; i < 100; i++) {
      const g = grid(
        Array.from({ length: 23 }, (_, n) => n + 1).filter(
          () => random() < 0.3,
        ),
      );
      for (const a of ["astar", "dijkstra"] as const) {
        const r = search(g, a);
        expect(r.cost).toBe(bfs(g));
        expect(new Set(r.visited).size).toBe(r.visited.length);
        r.path.forEach((n, j) => {
          expect(g.walls.has(n)).toBe(false);
          if (j)
            expect(
              Math.abs((n % 5) - (r.path[j - 1] % 5)) +
                Math.abs(Math.floor(n / 5) - Math.floor(r.path[j - 1] / 5)),
            ).toBe(1);
        });
      }
    }
  });
  it("does not mutate input", () => {
    const g = grid([7]);
    search(g, "astar");
    expect([...g.walls]).toEqual([7]);
  });
  it("creates solvable warehouse and blocked divider", () => {
    expect(search(preset("warehouse"), "astar").cost).not.toBeNull();
    expect(search(preset("divider"), "astar").cost).toBeNull();
  });
  it("protects endpoints and clears walls when moving endpoints", () => {
    const g = grid([7]);
    expect(editGrid(g, 0, "wall").walls.has(0)).toBe(false);
    expect(editGrid(g, 7, "start").walls.has(7)).toBe(false);
    expect(editGrid(g, 7, "start").start).toBe(7);
    expect(g.walls.has(7)).toBe(true);
  });
});
