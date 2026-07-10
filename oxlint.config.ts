import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";

export default defineConfig({
  extends: [core],
  ignorePatterns: core.ignorePatterns,
  rules: {
    // Oxlint only analyzes the <script> block of .svelte files, so it can't see
    // `$state` variables reassigned from template event handlers and flags them
    // as unused `let`. Also disable a few overly-opinionated style rules that
    // don't fit this codebase.
    "eslint/prefer-const": "off",
    "eslint/func-style": "off",
    "eslint/sort-keys": "off",
    "unicorn/filename-case": "off",
    // `$effect` bodies intentionally reference reactive state for dependency
    // tracking without using the value, which this rule can't distinguish
    // from a genuine no-op expression statement.
    "eslint/no-unused-expressions": "off",
    // .then() is used deliberately for fire-and-forget async work in
    // effects/handlers where introducing an async IIFE would add noise.
    "promise/prefer-await-to-then": "off",
    // Intentional worker-pool pattern in mapWithConcurrency: each worker
    // awaits sequentially by design to bound concurrency.
    "eslint/no-await-in-loop": "off",
  },
});
