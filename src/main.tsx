import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  search,
  preset,
  editGrid,
  type Algorithm,
  type Tool,
  type Preset,
} from "./search";
import "./style.css";
function App() {
  const [grid, setGrid] = useState(() => preset("warehouse"));
  const [algorithm, setAlgorithm] = useState<Algorithm>("astar"),
    [tool, setTool] = useState<Tool>("wall");
  const [frame, setFrame] = useState(0),
    [playing, setPlaying] = useState(false),
    [speed, setSpeed] = useState(3),
    [map, setMap] = useState("warehouse");
  const [cursor, setCursor] = useState(0),
    [focused, setFocused] = useState(false);
  const reduced = useRef(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const canvas = useRef<HTMLCanvasElement>(null),
    dragging = useRef(false);
  const results = useMemo(
    () => ({
      astar: search(grid, "astar"),
      dijkstra: search(grid, "dijkstra"),
    }),
    [grid],
  );
  const result = results[algorithm],
    total = result.visited.length + result.path.length;
  const edit = (n: number) => {
    if (!Number.isInteger(n) || n < 0 || n >= grid.width * grid.height) return;
    setPlaying(false);
    setFrame(0);
    setMap("custom");
    setGrid((g) => editGrid(g, n, tool));
    setCursor(n);
  };
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setFrame((f) => Math.min(total, f + speed)),
      35,
    );
    return () => clearInterval(timer);
  }, [playing, speed, total]);
  useEffect(() => {
    if (frame >= total) setPlaying(false);
  }, [frame, total]);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const cell = 32;
    el.width = grid.width * cell * 2;
    el.height = grid.height * cell * 2;
    ctx.scale(2, 2);
    ctx.fillStyle = "#f0f3e9";
    ctx.fillRect(0, 0, grid.width * cell, grid.height * cell);
    const seen = new Set(result.visited.slice(0, frame));
    for (let n = 0; n < grid.width * grid.height; n++) {
      const x = (n % grid.width) * cell,
        y = Math.floor(n / grid.width) * cell;
      ctx.fillStyle = grid.walls.has(n)
        ? "#4c6455"
        : seen.has(n)
          ? "#d4e4bc"
          : "#f5f7ef";
      ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      if (grid.walls.has(n)) {
        ctx.fillStyle = "#617867";
        ctx.fillRect(x + 5, y + 5, cell - 10, 3);
      }
    }
    const route = result.path.slice(
      0,
      Math.max(0, frame - result.visited.length),
    );
    if (route.length) {
      ctx.strokeStyle = "#d5783d";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      route.forEach((n, i) => {
        const x = (n % grid.width) * cell + 16,
          y = Math.floor(n / grid.width) * cell + 16;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      });
      ctx.stroke();
      const n = route.at(-1)!;
      ctx.fillStyle = "#d5783d";
      ctx.beginPath();
      ctx.arc(
        (n % grid.width) * cell + 16,
        Math.floor(n / grid.width) * cell + 16,
        6,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    for (const [n, color, label] of [
      [grid.start, "#2c5945", "S"],
      [grid.goal, "#cf753c", "G"],
    ] as const) {
      const x = (n % grid.width) * cell + 16,
        y = Math.floor(n / grid.width) * cell + 16;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(grid.start === grid.goal ? "S/G" : label, x, y);
    }
    if (focused) {
      ctx.strokeStyle = "#cf753c";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        (cursor % grid.width) * cell + 3,
        Math.floor(cursor / grid.width) * cell + 3,
        cell - 6,
        cell - 6,
      );
    }
  }, [grid, result, frame, cursor, focused]);
  const cellAt = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * grid.width),
      y = Math.floor(((e.clientY - r.top) / r.height) * grid.height);
    return x >= 0 && x < grid.width && y >= 0 && y < grid.height
      ? y * grid.width + x
      : -1;
  };
  const switchAlgorithm = (a: Algorithm) => {
    setPlaying(false);
    setFrame(0);
    setAlgorithm(a);
  };
  const chooseMap = (name: Preset) => {
    setPlaying(false);
    setFrame(0);
    setMap(name);
    setGrid(preset(name));
  };
  const play = () => {
    if (reduced.current) {
      setFrame(total);
      return;
    }
    if (frame >= total) setFrame(0);
    setPlaying((p) => !p);
  };
  const status =
    result.cost === null
      ? "No route — open a gap in the shelves."
      : `Route found · ${result.cost} steps · ${result.visited.length} cells explored`;
  return (
    <>
      <header>
        <div className="brand">
          <span className="mark">↳</span>RouteLab
        </div>
        <span className="top-note">A small laboratory for better paths.</span>
        <span className="badge">Pathfinding / 001</span>
      </header>
      <main>
        <section className="intro">
          <div>
            <div className="eyebrow">Warehouse navigation studio</div>
            <h1>Find a way through.</h1>
            <p>
              Build a floor plan. Trace the search. See how two algorithms
              navigate the same space.
            </p>
          </div>
          <div className="status">
            <span className="dot" />
            Local simulation · no hardware
          </div>
        </section>
        <div className="layout">
          <section className="board" aria-label="Pathfinding workspace">
            <div className="board-head">
              <strong>
                Floor plan{" "}
                <span className="muted">
                  {" "}
                  /{" "}
                  {map === "custom"
                    ? "Custom layout"
                    : map === "warehouse"
                      ? "Warehouse A"
                      : map === "open"
                        ? "Open floor"
                        : "Blocked aisle"}
                </span>
              </strong>
              <span className="muted">24 × 16 cells</span>
            </div>
            <div className="toolbar">
              <span>Edit map</span>
              {(["wall", "erase", "start", "goal"] as Tool[]).map((t) => (
                <button
                  key={t}
                  aria-pressed={tool === t}
                  onClick={() => setTool(t)}
                >
                  {
                    {
                      wall: "▦ Shelves",
                      erase: "− Erase",
                      start: "S Start",
                      goal: "G Goal",
                    }[t]
                  }
                </button>
              ))}
            </div>
            <div className="canvas-wrap">
              <canvas
                ref={canvas}
                tabIndex={0}
                aria-label="Warehouse grid. Use arrow keys to move and Enter or Space to apply the selected tool."
                aria-describedby="grid-help"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => {
                  const { width: w, height: h } = grid;
                  const keys: Record<string, number> = {
                    ArrowLeft: cursor % w > 0 ? cursor - 1 : cursor,
                    ArrowRight: cursor % w < w - 1 ? cursor + 1 : cursor,
                    ArrowUp: cursor >= w ? cursor - w : cursor,
                    ArrowDown: cursor < w * (h - 1) ? cursor + w : cursor,
                  };
                  if (e.key in keys) {
                    e.preventDefault();
                    setCursor(keys[e.key]);
                  } else if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    edit(cursor);
                  }
                }}
                onPointerDown={(e) => {
                  dragging.current = true;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  edit(cellAt(e));
                }}
                onPointerMove={(e) => {
                  if (dragging.current) edit(cellAt(e));
                }}
                onPointerUp={() => {
                  dragging.current = false;
                }}
                onPointerCancel={() => {
                  dragging.current = false;
                }}
              >
                Interactive warehouse map. Use the keyboard controls to edit
                cells.
              </canvas>
            </div>
            <div className="legend">
              {[
                ["#4c6455", "Shelf"],
                ["#d4e4bc", "Explored"],
                ["#d5783d", "Route"],
                ["#2c5945", "S · Start"],
                ["#cf753c", "G · Goal"],
              ].map(([c, l]) => (
                <span key={l}>
                  <i className="swatch" style={{ background: c }} />
                  {l}
                </span>
              ))}
            </div>
            <div className="playback">
              <button className="primary" onClick={play}>
                {playing
                  ? "Ⅱ Pause"
                  : frame >= total
                    ? "↻ Replay"
                    : "▶ Run search"}
              </button>
              <button
                onClick={() => {
                  setPlaying(false);
                  setFrame((f) => Math.min(f + 1, total));
                }}
                disabled={frame >= total}
              >
                Step
              </button>
              <button
                onClick={() => {
                  setPlaying(false);
                  setFrame(total);
                }}
              >
                Show route
              </button>
              <label className="speed">
                Speed
                <input
                  aria-label="Animation speed"
                  type="range"
                  min="1"
                  max="10"
                  value={speed}
                  onChange={(e) => setSpeed(+e.target.value)}
                />
                {speed}×
              </label>
            </div>
          </section>
          <aside className="side">
            <section className="panel">
              <h2>Compare the search</h2>
              {(["astar", "dijkstra"] as Algorithm[]).map((a) => (
                <button
                  className="alg"
                  key={a}
                  aria-pressed={algorithm === a}
                  onClick={() => switchAlgorithm(a)}
                >
                  <span className="alg-title">
                    {a === "astar" ? "A* search" : "Dijkstra"}
                    {algorithm === a && <span className="pill">VIEWING</span>}
                  </span>
                  <small>
                    {a === "astar"
                      ? "Guided by distance to the goal"
                      : "Explores by distance travelled"}
                  </small>
                  <span className="metric">
                    <span>
                      <strong>{results[a].cost ?? "—"}</strong>
                      <label>Path steps</label>
                    </span>
                    <span>
                      <strong>{results[a].visited.length}</strong>
                      <label>Explored</label>
                    </span>
                  </span>
                </button>
              ))}
              <div className="result" role="status">
                {status}
              </div>
            </section>
            <section className="panel">
              <h2>Try a different layout</h2>
              <select
                aria-label="Map preset"
                value={map}
                onChange={(e) => chooseMap(e.target.value as Preset)}
              >
                {map === "custom" && (
                  <option value="custom">Custom layout</option>
                )}
                <option value="warehouse">Warehouse A</option>
                <option value="open">Open floor</option>
                <option value="divider">Blocked aisle</option>
              </select>
              <p className="help">
                Edit any cell to recalculate both routes. Start and goal cells
                stay clear.
              </p>
            </section>
            <section className="panel explain">
              <h2>Same destination. Different search.</h2>
              <p>
                Both find a shortest path on this grid. A* uses Manhattan
                distance to guide its search. Watch the explored cells to see
                the difference.
              </p>
            </section>
          </aside>
        </div>
        <p id="grid-help" className="help">
          Click or drag to edit. Keyboard: focus the map, use arrow keys, then
          Enter to apply a tool.{" "}
          <span aria-live="polite">
            Selected cell: row {Math.floor(cursor / grid.width) + 1}, column{" "}
            {(cursor % grid.width) + 1}.
          </span>
        </p>
        <footer className="footer">
          <span>FOUR DIRECTIONS · ONE STEP PER CELL · ONE SIMULATED ROBOT</span>
          <span>Built to explore, not to control real equipment.</span>
        </footer>
      </main>
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
