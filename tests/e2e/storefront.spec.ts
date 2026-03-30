import { expect, test } from "@playwright/test";

test("redirects root to the default tenant and locale", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/urban-bites\/en$/);
});
