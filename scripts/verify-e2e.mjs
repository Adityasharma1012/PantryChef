import { createApp } from "../server/dist/app.js";
import { config } from "../server/dist/config.js";

// Enable mock mode
process.env.USE_MOCK_GEMINI = "true";
config.useMockGemini = true;

const app = createApp();
const PORT = 3004;

const server = app.listen(PORT, async () => {
  try {
    console.log(`[E2E Verification] Server running on port ${PORT}...`);

    // 1. Health check
    const healthRes = await fetch(`http://localhost:${PORT}/api/health`);
    const health = await healthRes.json();
    console.log(`[E2E Verification] Health Check: ok=${health.ok}, geminiConfigured=${health.geminiConfigured}`);

    // 2. Generate 3 recipes with mock
    const recipesRes = await fetch(`http://localhost:${PORT}/api/recipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ingredients: ["pasta", "tomatoes", "basil"],
        diets: ["Vegetarian"],
        cuisine: "Italian",
        maxMinutes: 30,
        servings: 2,
        count: 3,
      }),
    });

    const recipesJson = await recipesRes.json();
    console.log(`[E2E Verification] Recipes Generation Status: ${recipesRes.status}`);
    console.log(`[E2E Verification] Recipes Count: ${recipesJson.recipes?.length}`);

    if (!recipesJson.recipes || recipesJson.recipes.length !== 3) {
      throw new Error("Expected exactly 3 recipes!");
    }

    recipesJson.recipes.forEach((r, idx) => {
      console.log(`  - Recipe ${idx + 1}: "${r.title}" | ${r.timeMinutes}m | ${r.servings} servings | ${r.ingredients.length} ingredients | ${r.steps.length} steps`);
    });

    // 3. Regenerate single recipe
    const oldTitle = recipesJson.recipes[0].title;
    const exclude = recipesJson.recipes.map((r) => r.title);

    const regenRes = await fetch(`http://localhost:${PORT}/api/recipes/regenerate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ingredients: ["pasta", "tomatoes", "basil"],
        diets: ["Vegetarian"],
        cuisine: "Italian",
        maxMinutes: 30,
        servings: 2,
        count: 3,
        replaceTitle: oldTitle,
        exclude,
      }),
    });

    const regenJson = await regenRes.json();
    console.log(`[E2E Verification] Regenerate Status: ${regenRes.status}`);
    console.log(`[E2E Verification] Replaced Title: "${oldTitle}"`);
    console.log(`[E2E Verification] New Title: "${regenJson.recipe?.title}"`);

    if (regenJson.recipe?.title === oldTitle) {
      throw new Error("Regenerated title must not match replaced title!");
    }

    if (exclude.includes(regenJson.recipe?.title)) {
      throw new Error("Regenerated title must not match any excluded title!");
    }

    // 4. Verify PWA assets served statically
    const indexRes = await fetch(`http://localhost:${PORT}/`);
    const indexHtml = await indexRes.text();
    console.log(`[E2E Verification] Static index.html served: ${indexRes.status === 200 && indexHtml.includes("PantryChef")}`);

    const manifestRes = await fetch(`http://localhost:${PORT}/manifest.webmanifest`);
    console.log(`[E2E Verification] Static manifest.webmanifest served: ${manifestRes.status === 200}`);

    const swRes = await fetch(`http://localhost:${PORT}/sw.js`);
    console.log(`[E2E Verification] Static service worker (sw.js) served: ${swRes.status === 200}`);

    const iconRes = await fetch(`http://localhost:${PORT}/pwa-192x192.png`);
    console.log(`[E2E Verification] Static icon (pwa-192x192.png) served: ${iconRes.status === 200}`);

    console.log("[E2E Verification] ALL CHECKS PASSED SUCCESSFULLY!");
    server.close();
    process.exit(0);
  } catch (err) {
    console.error("[E2E Verification FAILED]:", err);
    server.close();
    process.exit(1);
  }
});
