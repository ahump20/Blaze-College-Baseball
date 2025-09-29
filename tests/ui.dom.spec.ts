// DOM Contract Test - Ensures UI structure remains unchanged
import { test, expect } from "@playwright/test";

test("dashboard sections present", async ({ page }) => {
  await page.goto("https://blazesportsintel.com/");

  // Verify all required sections exist
  for (const id of ["mlb-card", "nfl-card", "nba-card", "ncaa-card", "analytics-card", "live-games-card"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
});

test("API cards have correct structure", async ({ page }) => {
  await page.goto("https://blazesportsintel.com/");

  // MLB Card structure
  const mlbCard = page.locator("#mlb-card");
  await expect(mlbCard.locator(".team-name")).toBeVisible();
  await expect(mlbCard.locator(".division")).toBeVisible();
  await expect(mlbCard.locator(".venue")).toBeVisible();

  // NFL Card structure
  const nflCard = page.locator("#nfl-card");
  await expect(nflCard.locator(".team-name")).toBeVisible();
  await expect(nflCard.locator(".record")).toBeVisible();

  // NBA Card structure
  const nbaCard = page.locator("#nba-card");
  await expect(nbaCard.locator(".team-name")).toBeVisible();
  await expect(nbaCard.locator(".conference")).toBeVisible();

  // NCAA Card structure
  const ncaaCard = page.locator("#ncaa-card");
  await expect(ncaaCard.locator(".team-name")).toBeVisible();
  await expect(ncaaCard.locator(".ranking")).toBeVisible();
});

test("header and branding unchanged", async ({ page }) => {
  await page.goto("https://blazesportsintel.com/");

  // Check header exists with correct title
  await expect(page.locator("h1")).toContainText("Blaze Sports Intel");

  // Verify brand colors are applied (via CSS variables)
  const bodyStyles = await page.locator("body").evaluate((el) => {
    const styles = window.getComputedStyle(el);
    return {
      background: styles.backgroundColor,
      color: styles.color
    };
  });

  // Should have dark background (#1a1a1a) and light text
  expect(bodyStyles.background).toMatch(/rgb\(26, 26, 26\)|#1a1a1a/);
});