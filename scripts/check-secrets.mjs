#!/usr/bin/env node

/**
 * Secret Scanner for PantryChef
 *
 * Verifies that:
 * 1. No Google API key (e.g. "AIza...") is present anywhere in source code or client build artifacts.
 * 2. The string "GEMINI_API_KEY" is NEVER present in client source or client build artifacts.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();

// Patterns to identify secrets
const GOOGLE_API_KEY_REGEX = /AIza[0-9A-Za-z\-_]{35}/;
const CLIENT_GEMINI_KEY_NAME = "GEMINI_API_KEY";

// Directories/files to ignore during scanning
const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  ".vscode",
  "cutie_pie_birthday",
  "cutie_pie_birthday_new",
  "Cutie_Pie_Birthday_New_Website",
  "GIFT",
  "Melodify",
  "PrismMusic",
  "shelter-allocation",
]);

const IGNORED_FILES = new Set([
  ".env.example",
  "package-lock.json",
  "check-secrets.mjs",
]);

let violations = [];
let scannedCount = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        walk(fullPath);
      }
    } else if (entry.isFile()) {
      if (IGNORED_FILES.has(entry.name)) {
        continue;
      }

      // Only check text / code / bundle files
      if (
        /\.(ts|tsx|js|jsx|mjs|cjs|html|css|json|md|txt|env)$/i.test(entry.name)
      ) {
        scannedCount++;
        checkFile(fullPath, relPath);
      }
    }
  }
}

function checkFile(fullPath, relPath) {
  const content = fs.readFileSync(fullPath, "utf-8");

  // Check 1: Google API key pattern
  if (GOOGLE_API_KEY_REGEX.test(content)) {
    violations.push({
      file: relPath,
      reason: "Potential Google API key detected (AIza... pattern)",
    });
  }

  // Check 2: GEMINI_API_KEY referenced in client code or client dist
  const isClientFile =
    relPath.startsWith("client/src/") ||
    relPath.startsWith("client/dist/") ||
    relPath.startsWith("client/index.html");

  if (isClientFile && content.includes(CLIENT_GEMINI_KEY_NAME)) {
    violations.push({
      file: relPath,
      reason: `Client code contains "${CLIENT_GEMINI_KEY_NAME}". Client must never reference or use GEMINI_API_KEY.`,
    });
  }
}

console.log("Scanning repository for secret leaks and client key references...");
walk(ROOT_DIR);

console.log(`Scanned ${scannedCount} files.`);

if (violations.length > 0) {
  console.error("\n[SECURITY AUDIT FAILED] Secret violations detected:");
  for (const v of violations) {
    console.error(` - ${v.file}: ${v.reason}`);
  }
  process.exit(1);
} else {
  console.log("[SECURITY AUDIT PASSED] No API keys or client key references found.");
  process.exit(0);
}
