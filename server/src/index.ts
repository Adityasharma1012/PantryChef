import { createApp } from "./app.js";
import { config } from "./config.js";

const app = createApp();

app.listen(config.port, () => {
  console.log(`[PantryChef Server] Listening on port ${config.port}`);
  console.log(`[PantryChef Server] Model configured: ${config.geminiModel}`);
  console.log(
    `[PantryChef Server] Mock mode: ${config.useMockGemini ? "ENABLED" : "DISABLED"}`
  );
});
