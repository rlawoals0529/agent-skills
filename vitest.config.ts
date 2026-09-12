import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    /* Named, not left to the default glob: that also matches *.spec.ts and would collect the
       Playwright suite in e2e/, failing it with "Playwright Test did not expect test() to be
       called here". The vendored helpers in site/lib carry their own tests, and a vendored
       file whose tests nobody runs has stopped being checked. */
    include: ["site/**/*.test.ts", "scripts/**/*.test.ts"],
  },
});
