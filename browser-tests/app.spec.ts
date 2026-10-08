import { test, expect } from "@playwright/test";
test("map presets, search playback, keyboard edit and algorithm selection", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Find a way through." }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Route found");
  await page.getByRole("button", { name: "Show route" }).click();
  await expect(page.getByRole("button", { name: "↻ Replay" })).toBeVisible();
  await page.getByLabel("Map preset").selectOption("divider");
  await expect(page.getByRole("status")).toContainText("No route");
  await page.getByLabel("Map preset").selectOption("open");
  await expect(page.getByRole("status")).toContainText("Route found");
  await page.getByRole("button", { name: "Dijkstra", exact: false }).click();
  await expect(
    page.getByRole("button", { name: "Dijkstra", exact: false }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "G Goal" }).click();
  const canvas = page.locator("canvas");
  await canvas.focus();
  await canvas.press("Enter");
  await expect(page.getByLabel("Map preset")).toHaveValue("custom");
  await page.getByRole("button", { name: "S Start" }).click();
  await canvas.focus();
  await canvas.press("Enter");
  await expect(page.getByRole("status")).toContainText("0 steps");
  await page.getByRole("button", { name: "▶ Run search" }).click();
  await expect(page.getByRole("button", { name: "↻ Replay" })).toBeVisible();
  expect(errors).toEqual([]);
});
test("pointer edit resets playback and mobile fits viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const c = page.locator("canvas");
  await page.getByRole("button", { name: "Show route" }).click();
  const box = (await c.boundingBox())!;
  await c.click({ position: { x: box.width * 0.3, y: box.height * 0.2 } });
  await expect(page.getByLabel("Map preset")).toHaveValue("custom");
  await expect(
    page.getByRole("button", { name: "▶ Run search" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "/tmp/route-mobile.png", fullPage: true });
});
test("desktop screenshot and reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "▶ Run search" }).click();
  await expect(page.getByRole("button", { name: "↻ Replay" })).toBeVisible();
  await page.screenshot({ path: "/tmp/route-desktop.png", fullPage: true });
});
test("dragging outside grid keeps keyboard cursor valid", async ({ page }) => {
  await page.goto("/");
  const box = (await page.locator("canvas").boundingBox())!;
  await page.mouse.move(box.x + 10, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x - 20, box.y - 20);
  await page.mouse.up();
  await expect(page.getByText("Selected cell: row 1, column 1.")).toBeVisible();
});
