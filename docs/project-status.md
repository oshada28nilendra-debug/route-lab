# Project queue

Project #2: RouteLab. Approved by the user on 2026-10-07 for oshada28nilendra-debug/route-lab.
Implementation branch: feat/route-lab-mvp. Inspect its PR before making another build.
MVP: 24x16 warehouse editing, A*/Dijkstra, search replay, cost/explored comparison,
keyboard controls, three presets, responsive interface, tests and CI.
No project #3 has been approved. Next work is maintenance or a new shortlist for approval.
This project is a portfolio learning demo, not a novel research contribution.

Validation: 8 Vitest cases (including 100 seeded maps versus BFS), 4 real Chromium browser tests, TypeScript and production build passed locally. Independent review findings were fixed: separated Vitest/Playwright discovery and ignored out-of-bounds pointer edits. Hosted CI is tracked in the PR.
