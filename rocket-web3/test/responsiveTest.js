/**
 * Responsive Design Test
 * Tests mobile responsiveness of key components
 * Run with: `npx playwright test test/responsiveTest.js`
 */

import { test, expect } from "@playwright/test";

// Mobile device dimensions to test
const MOBILE_DIMENSIONS = [
  { width: 375, height: 667, name: "iPhone SE" },
  { width: 390, height: 844, name: "iPhone 12" },
  { width: 360, height: 800, name: "Android Medium" },
];

// Tablet device dimensions to test
const TABLET_DIMENSIONS = [
  { width: 768, height: 1024, name: "iPad" },
  { width: 820, height: 1180, name: "iPad Air" },
];

// Desktop dimensions to test
const DESKTOP_DIMENSIONS = [
  { width: 1280, height: 800, name: "Small Desktop" },
  { width: 1920, height: 1080, name: "Large Desktop" },
];

// URLs to test
const TEST_URLS = [
  { url: "/", name: "Landing Page" },
  { url: "/browse", name: "Browse Page" },
  { url: "/bet/1", name: "Bet Detail Page" },
  { url: "/dashboard", name: "Dashboard Page" },
];

test.describe("Responsive Tests", () => {
  // Test mobile devices
  for (const device of MOBILE_DIMENSIONS) {
    test.describe(`Mobile - ${device.name} (${device.width}x${device.height})`, () => {
      test.beforeEach(async ({ page }) => {
        // Set viewport size to match device
        await page.setViewportSize({
          width: device.width,
          height: device.height,
        });
      });

      for (const { url, name } of TEST_URLS) {
        test(`${name} renders correctly`, async ({ page }) => {
          await page.goto(url);

          // Take a screenshot for visual reference
          await page.screenshot({
            path: `./test-results/mobile-${device.name}-${name.replace(
              /\s+/g,
              "-"
            )}.png`,
            fullPage: true,
          });

          // Check that BottomNav is visible on mobile
          const bottomNav = page.locator('div[class*="fixed bottom-0"]');
          await expect(bottomNav).toBeVisible();

          // Check that CategoriesPanel is collapsed/not visible or in a drawer
          if (url === "/browse") {
            const categoriesPanel = page.locator('text="Categories"');
            const isVisible = await categoriesPanel.isVisible();

            // Either it's hidden or it's in a collapsed state
            if (isVisible) {
              const panelExpanded = page.locator(
                'div[class*="categories-expanded"]'
              );
              await expect(panelExpanded).not.toBeVisible();
            }
          }

          // Verify modal fits on screen when opened (if applicable)
          if (url === "/browse") {
            // Try to open the bet creation modal
            await page.click('text="Create"');

            // Check that modal is fully visible and not overflowing
            const modal = page.locator('div[role="dialog"]');
            if (await modal.isVisible()) {
              const modalBox = await modal.boundingBox();
              expect(modalBox.width).toBeLessThanOrEqual(device.width);

              // Close the modal
              await page.click('button[aria-label="Close"]');
            }
          }
        });
      }
    });
  }

  // Test tablet devices
  for (const device of TABLET_DIMENSIONS) {
    test.describe(`Tablet - ${device.name} (${device.width}x${device.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({
          width: device.width,
          height: device.height,
        });
      });

      for (const { url, name } of TEST_URLS) {
        test(`${name} renders correctly`, async ({ page }) => {
          await page.goto(url);

          await page.screenshot({
            path: `./test-results/tablet-${device.name}-${name.replace(
              /\s+/g,
              "-"
            )}.png`,
            fullPage: true,
          });

          // Check specific tablet layout elements
          // For example, sidebar might be visible but collapsed
          if (url === "/browse") {
            const categoriesPanel = page.locator('text="Categories"');
            await expect(categoriesPanel).toBeVisible();
          }
        });
      }
    });
  }

  // Test desktop devices
  for (const device of DESKTOP_DIMENSIONS) {
    test.describe(`Desktop - ${device.name} (${device.width}x${device.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({
          width: device.width,
          height: device.height,
        });
      });

      for (const { url, name } of TEST_URLS) {
        test(`${name} renders correctly`, async ({ page }) => {
          await page.goto(url);

          await page.screenshot({
            path: `./test-results/desktop-${device.name}-${name.replace(
              /\s+/g,
              "-"
            )}.png`,
            fullPage: true,
          });

          // Bottom nav should not be visible on desktop
          const bottomNav = page.locator('div[class*="fixed bottom-0"]');
          await expect(bottomNav).not.toBeVisible();

          // Categories panel should be fully expanded on desktop
          if (url === "/browse") {
            const categoriesPanel = page.locator('text="Categories"');
            await expect(categoriesPanel).toBeVisible();
          }

          // Wallet panel should be visible on desktop
          if (url === "/dashboard") {
            const walletPanel = page.locator('text="Wallet"');
            await expect(walletPanel).toBeVisible();
          }
        });
      }
    });
  }
});
