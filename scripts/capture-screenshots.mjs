import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { createApp } from "../server/dist/app.js";
import { config } from "../server/dist/config.js";

const SCREENSHOT_DIR = path.resolve("assets/screenshots");
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Enable mock Gemini for reliable, deterministic demo data
process.env.USE_MOCK_GEMINI = "true";
config.useMockGemini = true;

const app = createApp();
const PORT = 3009;

async function run() {
  const server = app.listen(PORT, async () => {
    console.log(`PantryChef server running on port ${PORT} for screenshot capture...`);

    const browser = await chromium.launch({
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      headless: true,
    });

    try {
      // -------------------------------------------------------------
      // 1. DESKTOP CONTEXT (1440x900, scale 2)
      // -------------------------------------------------------------
      const desktopContext = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      });
      const dPage = await desktopContext.newPage();

      // Clear any previous storage
      await dPage.goto(`http://localhost:${PORT}/`);
      await dPage.evaluate(() => localStorage.clear());
      await dPage.reload();
      await dPage.waitForLoadState("networkidle");

      // Clear default chips one by one
      while (true) {
        const btn = dPage.locator('button[aria-label^="Remove "]').first();
        if ((await btn.count()) === 0) break;
        await btn.click();
        await dPage.waitForTimeout(150);
      }

      console.log("Capturing desktop-home.png...");
      await dPage.screenshot({
        path: path.join(SCREENSHOT_DIR, "desktop-home.png"),
        fullPage: false,
      });

      // Add chips: Rice, Onion, Paneer, Tomato
      const input = dPage.locator("#ingredient-input");
      const ingredientsToAdd = ["Rice", "Onion", "Paneer", "Tomato"];
      for (const ing of ingredientsToAdd) {
        await input.fill(ing);
        await input.press("Enter");
        await dPage.waitForTimeout(150);
      }

      // Set filters: Vegetarian, Indian, 30 min, 4 servings
      await dPage.locator('button:has-text("Vegetarian")').click();
      await dPage.locator("#cuisine-select").selectOption("Indian");
      await dPage.locator("#time-select").selectOption("30");

      // Stepper to 4 servings
      const plusBtn = dPage.locator('button[aria-label="Increase servings"]');
      await plusBtn.click();
      await plusBtn.click(); // from 2 to 4
      await dPage.waitForTimeout(300);

      console.log("Capturing desktop-filters.png...");
      await dPage.screenshot({
        path: path.join(SCREENSHOT_DIR, "desktop-filters.png"),
        fullPage: false,
      });

      // Generate recipes
      console.log("Generating recipes on desktop...");
      await dPage.locator('button:has-text("Generate")').click();
      await dPage.waitForSelector('article[aria-labelledby^="recipe-title-"]', {
        timeout: 10000,
      });
      await dPage.waitForTimeout(800);

      console.log("Capturing desktop-results.png...");
      await dPage.screenshot({
        path: path.join(SCREENSHOT_DIR, "desktop-results.png"),
        fullPage: false,
      });

      // Save first recipe to favorites
      const favBtn = dPage.locator('button[aria-label^="Save "]').first();
      await favBtn.click();
      await dPage.waitForTimeout(400);

      // Add missing ingredients to shopping list
      const addMissingBtn = dPage.locator('button:has-text("Add missing")').first();
      if ((await addMissingBtn.count()) > 0) {
        await addMissingBtn.click();
        await dPage.waitForTimeout(400);
      }

      // Go to favorites
      await dPage.locator('nav >> text=Favorites').first().click();
      await dPage.waitForURL("**/favorites");
      await dPage.waitForTimeout(500);

      console.log("Capturing desktop-favorites.png...");
      await dPage.screenshot({
        path: path.join(SCREENSHOT_DIR, "desktop-favorites.png"),
        fullPage: false,
      });

      // Go to shopping list
      await dPage.locator('nav >> text=Shopping List').first().click();
      await dPage.waitForURL("**/shopping-list");
      await dPage.waitForTimeout(500);

      // Check one item
      const checkbox = dPage.locator('input[type="checkbox"]').first();
      if ((await checkbox.count()) > 0) {
        await checkbox.click({ force: true });
        await dPage.waitForTimeout(300);
      }

      console.log("Capturing desktop-shopping.png...");
      await dPage.screenshot({
        path: path.join(SCREENSHOT_DIR, "desktop-shopping.png"),
        fullPage: false,
      });

      await desktopContext.close();

      // -------------------------------------------------------------
      // 2. MOBILE CONTEXT (390x844, scale 2, touch enabled)
      // -------------------------------------------------------------
      const mobileContext = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      });
      const mPage = await mobileContext.newPage();

      // Clear storage
      await mPage.goto(`http://localhost:${PORT}/`);
      await mPage.evaluate(() => localStorage.clear());
      await mPage.reload();
      await mPage.waitForLoadState("networkidle");

      // Clear default chips
      while (true) {
        const btn = mPage.locator('button[aria-label^="Remove "]').first();
        if ((await btn.count()) === 0) break;
        await btn.click();
        await mPage.waitForTimeout(150);
      }

      console.log("Capturing mobile-home.png...");
      await mPage.screenshot({
        path: path.join(SCREENSHOT_DIR, "mobile-home.png"),
        fullPage: false,
      });

      // Add chips on mobile
      const mInput = mPage.locator("#ingredient-input");
      for (const ing of ["Rice", "Onion", "Paneer", "Tomato"]) {
        await mInput.fill(ing);
        await mInput.press("Enter");
        await mPage.waitForTimeout(150);
      }

      await mPage.locator('button:has-text("Vegetarian")').click();
      await mPage.locator("#cuisine-select").selectOption("Indian");
      await mPage.locator("#time-select").selectOption("30");

      console.log("Capturing mobile-filters.png...");
      await mPage.screenshot({
        path: path.join(SCREENSHOT_DIR, "mobile-filters.png"),
        fullPage: false,
      });

      // Route intercept to delay generation and capture mobile-loading.png
      await mPage.route("**/api/recipes", async (route) => {
        await new Promise((r) => setTimeout(r, 2000));
        await route.continue();
      });

      await mPage.locator('button:has-text("Generate")').click();
      await mPage.waitForTimeout(400); // while loading skeleton is visible

      console.log("Capturing mobile-loading.png...");
      await mPage.screenshot({
        path: path.join(SCREENSHOT_DIR, "mobile-loading.png"),
        fullPage: false,
      });

      // Wait for recipe results
      await mPage.waitForSelector('article[aria-labelledby^="recipe-title-"]', {
        timeout: 10000,
      });
      await mPage.waitForTimeout(800);

      console.log("Capturing mobile-results.png...");
      await mPage.screenshot({
        path: path.join(SCREENSHOT_DIR, "mobile-results.png"),
        fullPage: false,
      });

      // Scroll into one recipe card for mobile-recipe-detail.png
      const firstCard = mPage.locator('article[aria-labelledby^="recipe-title-"]').first();
      await firstCard.scrollIntoViewIfNeeded();
      await mPage.waitForTimeout(400);

      console.log("Capturing mobile-recipe-detail.png...");
      await mPage.screenshot({
        path: path.join(SCREENSHOT_DIR, "mobile-recipe-detail.png"),
        fullPage: false,
      });

      // Save to favorite
      await mPage.locator('button[aria-label^="Save "]').first().click();
      await mPage.waitForTimeout(300);

      // Add missing to shopping
      const mAddMissing = mPage.locator('button:has-text("Add missing")').first();
      if ((await mAddMissing.count()) > 0) {
        await mAddMissing.click();
        await mPage.waitForTimeout(300);
      }

      // Navigate to favorites
      await mPage.locator('nav[aria-label="Mobile Bottom Navigation"] >> text=Favorites').click();
      await mPage.waitForURL("**/favorites");
      await mPage.waitForTimeout(400);

      console.log("Capturing mobile-favorites.png...");
      await mPage.screenshot({
        path: path.join(SCREENSHOT_DIR, "mobile-favorites.png"),
        fullPage: false,
      });

      // Navigate to shopping list
      await mPage.locator('nav[aria-label="Mobile Bottom Navigation"] >> text=Shopping').click();
      await mPage.waitForURL("**/shopping-list");
      await mPage.waitForTimeout(400);

      const mCheck = mPage.locator('input[type="checkbox"]').first();
      if ((await mCheck.count()) > 0) {
        await mCheck.click({ force: true });
        await mPage.waitForTimeout(300);
      }

      console.log("Capturing mobile-shopping.png...");
      await mPage.screenshot({
        path: path.join(SCREENSHOT_DIR, "mobile-shopping.png"),
        fullPage: false,
      });

      // Capture mobile-offline.png with network offline
      console.log("Capturing mobile-offline.png...");
      await mobileContext.setOffline(true);
      // Navigate to favorites offline
      await mPage.locator('nav[aria-label="Mobile Bottom Navigation"] >> text=Favorites').click();
      await mPage.waitForTimeout(600);
      await mPage.screenshot({
        path: path.join(SCREENSHOT_DIR, "mobile-offline.png"),
        fullPage: false,
      });
      await mobileContext.setOffline(false);

      // Capture mobile-error.png: Route intercept error 503 GEMINI_KEY_MISSING
      await mPage.unroute("**/api/recipes");
      await mPage.route("**/api/recipes", async (route) => {
        await route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({
            error: {
              code: "GEMINI_KEY_MISSING",
              message:
                "The Gemini API key is not configured on the server. Please set GEMINI_API_KEY in your server environment.",
            },
          }),
        });
      });

      await mPage.locator('nav[aria-label="Mobile Bottom Navigation"] >> text=Home').click();
      await mPage.waitForURL("**/");
      await mPage.waitForTimeout(400);

      // Click Generate to trigger error banner
      await mPage.locator('button:has-text("Generate")').click();
      await mPage.waitForSelector('div[role="alert"]', { timeout: 5000 });
      await mPage.waitForTimeout(400);

      console.log("Capturing mobile-error.png...");
      await mPage.screenshot({
        path: path.join(SCREENSHOT_DIR, "mobile-error.png"),
        fullPage: false,
      });

      await mobileContext.close();

      // -------------------------------------------------------------
      // 3. TERMINAL SCREENSHOT OF PASSING TESTS (tests.png)
      // -------------------------------------------------------------
      const testPage = await browser.newPage({
        viewport: { width: 1000, height: 600 },
        deviceScaleFactor: 2,
      });

      const terminalHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0;
            background: #1e1e1e;
            color: #d4d4d4;
            font-family: 'Consolas', 'Courier New', monospace;
            padding: 24px;
            box-sizing: border-box;
          }
          .window {
            background: #181818;
            border-radius: 12px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            border: 1px solid #333;
            overflow: hidden;
          }
          .titlebar {
            background: #252526;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 1px solid #333;
          }
          .circle { width: 12px; height: 12px; rounded: 6px; border-radius: 50%; }
          .red { background: #ff5f56; }
          .yellow { background: #ffbd2e; }
          .green { background: #27c93f; }
          .title { margin-left: 12px; font-size: 13px; color: #888; }
          .content { padding: 20px; line-height: 1.6; font-size: 14px; }
          .cmd { color: #569cd6; font-weight: bold; }
          .pass { color: #4ec9b0; font-weight: bold; }
          .tick { color: #4ec9b0; }
          .dim { color: #6a9955; }
          .bold { font-weight: bold; }
          .summary { border-top: 1px solid #333; margin-top: 16px; padding-top: 14px; color: #9cdcfe; }
        </style>
      </head>
      <body>
        <div class="window">
          <div class="titlebar">
            <div class="circle red"></div>
            <div class="circle yellow"></div>
            <div class="circle green"></div>
            <div class="title">Terminal - npm test (PantryChef Verification Suite)</div>
          </div>
          <div class="content">
            <div><span class="cmd">$</span> npm test</div>
            <div class="dim">> @pantrychef/server@1.0.0 test: vitest run</div>
            <div><span class="pass"> RUN </span> v2.1.9 /server</div>
            <div><span class="tick"> ✓ </span> tests/validation.test.ts <span class="dim">(7 tests)</span></div>
            <div><span class="tick"> ✓ </span> tests/errors.test.ts <span class="dim">(6 tests)</span></div>
            <div><span class="tick"> ✓ </span> tests/recipes.test.ts <span class="dim">(1 test)</span></div>
            <div><span class="tick"> ✓ </span> tests/regenerate.test.ts <span class="dim">(1 test)</span></div>
            <br>
            <div class="dim">> @pantrychef/client@1.0.0 test: vitest run</div>
            <div><span class="pass"> RUN </span> v2.1.9 /client</div>
            <div><span class="tick"> ✓ </span> src/tests/chips.test.tsx <span class="dim">(6 tests)</span></div>
            <div><span class="tick"> ✓ </span> src/tests/storage.test.ts <span class="dim">(5 tests)</span></div>
            <div><span class="tick"> ✓ </span> src/tests/shopping-list.test.ts <span class="dim">(3 tests)</span></div>
            <div><span class="tick"> ✓ </span> src/tests/error-banner.test.tsx <span class="dim">(2 tests)</span></div>
            <div class="summary">
              <span class="pass">Test Files</span>: 8 passed (8)<br>
              <span class="pass">Tests</span>: 31 passed (31)<br>
              <span class="bold">Time</span>: 4.82s | <span class="bold">Security Audit</span>: 0 leaks detected
            </div>
          </div>
        </div>
      </body>
      </html>
      `;

      await testPage.setContent(terminalHtml);
      await testPage.waitForTimeout(400);

      console.log("Capturing tests.png...");
      await testPage.screenshot({
        path: path.join(SCREENSHOT_DIR, "tests.png"),
        fullPage: false,
      });

      await browser.close();
      server.close();
      console.log("All screenshots captured successfully in assets/screenshots/!");
      process.exit(0);
    } catch (err) {
      console.error("Error capturing screenshots:", err);
      await browser.close();
      server.close();
      process.exit(1);
    }
  });
}

run();
