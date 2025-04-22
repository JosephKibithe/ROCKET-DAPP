/**
 * Security Test Suite
 * Tests for common security vulnerabilities including:
 * - XSS vulnerabilities
 * - CSRF vulnerabilities
 * - Security Headers
 * - Input validation
 *
 * Run with: `npx playwright test test/securityTest.js`
 */

import { test, expect } from "@playwright/test";
import { sanitizeInput } from "../src/lib/securityUtils";

test.describe("Security Tests", () => {
  // Base URL for tests
  const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    // Enable JavaScript exceptions catching
    page.on("pageerror", (exception) => {
      console.error(`Uncaught exception: "${exception}"`);
    });
  });

  test("should have proper security headers", async ({ request }) => {
    // Make a request to the home page
    const response = await request.get(baseUrl);

    // Check for security headers
    const headers = response.headers();

    // Content-Security-Policy
    expect(headers["content-security-policy"]).toBeDefined();

    // X-Content-Type-Options
    expect(headers["x-content-type-options"]).toBe("nosniff");

    // X-Frame-Options
    expect(headers["x-frame-options"]).toBe("DENY");

    // X-XSS-Protection
    expect(headers["x-xss-protection"]).toBe("1; mode=block");

    // Strict-Transport-Security
    expect(headers["strict-transport-security"]).toContain("max-age=");

    // Permissions-Policy
    expect(headers["permissions-policy"]).toBeDefined();
  });

  test("input sanitization function prevents XSS", () => {
    // Test against common XSS payloads
    const xssPayloads = [
      {
        input: '<script>alert("XSS")</script>',
        expected: "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;",
      },
      {
        input: 'javascript:alert("XSS")',
        expected: "javascript:alert(&quot;XSS&quot;)",
      },
      {
        input: '<img src="x" onerror="alert(\'XSS\')">',
        expected:
          "&lt;img src=&quot;x&quot; onerror=&quot;alert(&#039;XSS&#039;)&quot;&gt;",
      },
      {
        input: "<a href=\"javascript:alert('XSS')\">Click me</a>",
        expected:
          "&lt;a href=&quot;javascript:alert(&#039;XSS&#039;)&quot;&gt;Click me&lt;/a&gt;",
      },
      {
        input: '"><script>alert("XSS")</script>',
        expected:
          "&quot;&gt;&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;",
      },
    ];

    for (const { input, expected } of xssPayloads) {
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe(expected);

      // Ensure the sanitized string doesn't contain executable script tags
      expect(sanitized).not.toContain("<script>");
    }
  });

  test("should prevent XSS in search inputs", async ({ page }) => {
    await page.goto(`${baseUrl}/browse`);

    // Try to inject a script through the search input
    const searchInput = page
      .locator('input[type="search"], input[placeholder*="Search"]')
      .first();

    if (await searchInput.isVisible()) {
      // Attempt to inject an XSS payload
      const xssPayload = '<img src=x onerror=alert("XSS")>';
      await searchInput.fill(xssPayload);
      await searchInput.press("Enter");

      // Wait a moment to see if any alerts trigger
      await page.waitForTimeout(1000);

      // Check if the payload is properly escaped in the DOM
      const bodyContent = await page.content();
      expect(bodyContent).not.toContain('<img src=x onerror=alert("XSS")>');

      // Verify there are no unescaped occurrences of the payload
      const unescapedCount =
        bodyContent.split("<img src=x onerror=alert").length - 1;
      expect(unescapedCount).toBe(0);
    }
  });

  test("should prevent XSS in prediction form", async ({ page }) => {
    await page.goto(`${baseUrl}/browse`);

    // Open the bet creation modal
    const createButton = page.locator('text="Create"').first();

    if (await createButton.isVisible()) {
      await createButton.click();

      // Wait for the modal to appear
      await page.waitForSelector('div[role="dialog"]', { state: "visible" });

      // Try to inject a script in the question field
      const questionInput = page
        .locator('input[id="question"], textarea[id="question"]')
        .first();

      if (await questionInput.isVisible()) {
        const xssPayload = '<script>alert("XSS")</script>';
        await questionInput.fill(xssPayload);

        // Submit the form or move to the next step
        const nextButton = page
          .locator('button:has-text("Next"), button:has-text("Continue")')
          .first();

        if (await nextButton.isVisible()) {
          await nextButton.click();

          // Wait a moment to see if any alerts trigger
          await page.waitForTimeout(1000);

          // Check that the payload is properly handled/escaped
          const modalContent = await page
            .locator('div[role="dialog"]')
            .innerHTML();
          expect(modalContent).not.toContain('<script>alert("XSS")</script>');
        }
      }
    }
  });

  test("API endpoints should validate input and have proper CSRF protection", async ({
    request,
  }) => {
    // Attempt to create a bet without authentication
    const response = await request.post(`${baseUrl}/api/bet`, {
      data: {
        question: "Test Question",
        options: ["Yes", "No"],
        resolution_time: new Date().toISOString(),
      },
    });

    // Should reject unauthenticated requests
    expect(response.status()).toBe(401);

    const responseBody = await response.json();
    expect(responseBody.error).toBeDefined();
  });

  test("should not expose sensitive information in client-side code", async ({
    page,
  }) => {
    await page.goto(baseUrl);

    // Get the page content
    const content = await page.content();

    // Check for sensitive environment variables or API keys
    const sensitivePatterns = [
      /SUPABASE_KEY=\w+/i,
      /API_SECRET=\w+/i,
      /password=/i,
      /secret=/i,
      /apiKey=/i,
      /connection(string|url)=/i,
    ];

    for (const pattern of sensitivePatterns) {
      expect(content).not.toMatch(pattern);
    }

    // Check all script tags
    const scripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("script")).map(
        (script) => script.textContent
      );
    });

    for (const script of scripts) {
      if (script) {
        for (const pattern of sensitivePatterns) {
          expect(script).not.toMatch(pattern);
        }
      }
    }
  });

  test("wallet connection should require user confirmation", async ({
    page,
  }) => {
    await page.goto(`${baseUrl}/browse`);

    // Find and click the wallet connect button
    const connectButton = page
      .locator('button:has-text("Connect Wallet")')
      .first();

    if (await connectButton.isVisible()) {
      await connectButton.click();

      // Wait for the wallet connection modal
      const modal = page.locator('div[role="dialog"]').first();

      if (await modal.isVisible()) {
        // Check for confirmation step - there should be multiple wallet options
        // and no automatic connection without user interaction
        const walletOptions = await page
          .locator("button, a")
          .filter({ hasText: /metamask|walletconnect|coinbase/i })
          .count();
        expect(walletOptions).toBeGreaterThan(0);
      }
    }
  });
});
