import { expect, test } from "@playwright/test";

test("redirects root to the default tenant and locale", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/urban-bites\/en$/);
});

test("opens menu with the selected category from the home screen", async ({
  page,
}) => {
  await page.goto("/urban-bites/en");

  await page.getByRole("link", { name: "Sides" }).click();

  await expect(page).toHaveURL(/\/urban-bites\/en\/menu\?category=sides$/);
  await expect(page.getByRole("heading", { name: "Sides" })).toBeVisible();
  await expect(page.getByText("Loaded Citrus Fries")).toBeVisible();
  await expect(page.getByText("City Smash Burger")).not.toBeVisible();
});

test("supports category deeplinks in the menu", async ({ page }) => {
  await page.goto("/urban-bites/en/menu?category=drinks");

  await expect(page.getByRole("heading", { name: "Drinks" })).toBeVisible();
  await expect(page.getByText("Yuzu Mint Fizz")).toBeVisible();
  await expect(page.getByText("Loaded Citrus Fries")).not.toBeVisible();
});
