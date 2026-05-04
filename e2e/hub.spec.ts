/**
 * End-to-end test for hub mode.
 *
 * Assumes a Vigil Pro hub is running at http://localhost:4602 with admin
 * token `dev-test-token-please-rotate` and at least one registered host
 * pushing samples (start the smoke setup before running this).
 */
import { test, expect } from "@playwright/test";

const ADMIN_TOKEN = "dev-test-token-please-rotate";

test("hub mode: setup → fleet view → host drill-down", async ({ page }) => {
  // Pre-load the token so we skip the manual paste step.
  await page.addInitScript((t) => {
    localStorage.setItem("vigil-pro-hub-token", t);
  }, ADMIN_TOKEN);

  await page.goto("/hub");

  // Section header announces the hub
  await expect(page.locator(".header-title").first()).toBeVisible();
  await expect(page.getByText("Hosts", { exact: true }).first()).toBeVisible();

  // At least one host row, drill into the first one
  const firstHost = page.locator(".host-row").first();
  await expect(firstHost).toBeVisible();
  await firstHost.click();

  // We're on the per-host page: at least one sparkline rendered
  await expect(page).toHaveURL(/\/hub\/hosts\/\d+/);
  await expect(page.locator(".spark").first()).toBeVisible({ timeout: 10_000 });

  // Status pill is visible somewhere in the header area
  await expect(page.locator(".host-pill").first()).toBeVisible();

  // Back to fleet via the breadcrumb
  await page.locator(".back").click();
  await expect(page).toHaveURL(/\/hub$/);
});

test("hub mode: token setup form when localStorage is empty", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem("vigil-pro-hub-token");
  });
  await page.goto("/hub");

  // Token entry surface
  await expect(page.getByText("PASTE ADMIN BEARER TOKEN")).toBeVisible();
  await page.locator("input[type=password]").fill(ADMIN_TOKEN);
  await page.getByRole("button", { name: /Connect/ }).click();

  // After connect, host list appears
  await expect(page.locator(".host-row").first()).toBeVisible({ timeout: 10_000 });
});
