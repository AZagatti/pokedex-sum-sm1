import { expect, test } from "@playwright/test";

test.describe("Pokédex list page", () => {
  test("loads and shows the first page of Pokémon", async ({ page }) => {
    await page.goto("./");
    await expect(
      page.getByRole("heading", { name: "Explore the Pokédex" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /bulbasaur/iu })).toBeVisible();
  });

  test("search filters the visible cards", async ({ page }) => {
    await page.goto("./");
    await page
      .getByRole("searchbox", { name: /search pokémon/iu })
      .fill("pikachu");
    await expect(
      page.getByRole("link", { name: /^pikachu/iu }).first()
    ).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole("link", { name: /^bulbasaur/iu })).toHaveCount(
      0
    );
  });

  test("type filter narrows results to the selected type", async ({ page }) => {
    await page.goto("./");
    await page.getByRole("button", { name: "Filters" }).click();
    await page.getByRole("button", { name: "Fire", exact: true }).click();
    await expect(page.getByRole("link", { name: /^charmander/iu })).toBeVisible(
      {
        timeout: 10_000,
      }
    );
    await expect(page.getByRole("link", { name: /^squirtle/iu })).toHaveCount(
      0
    );
  });

  test("clear filters resets search and filter state", async ({ page }) => {
    await page.goto("./");
    await page
      .getByRole("searchbox", { name: /search pokémon/iu })
      .fill("pikachu");
    await expect(page.getByRole("button", { name: "Clear" })).toBeVisible();
    await page.getByRole("button", { name: "Clear" }).click();
    await expect(
      page.getByRole("searchbox", { name: /search pokémon/iu })
    ).toHaveValue("");
    await expect(
      page.getByRole("link", { name: /^bulbasaur/iu })
    ).toBeVisible();
  });

  test("navigating to a detail page and back works", async ({ page }) => {
    await page.goto("./");
    await page.getByRole("link", { name: /^bulbasaur/iu }).click();
    await expect(page).toHaveURL(/\/pokemon\/bulbasaur$/u);
    await expect(
      page.getByRole("heading", { name: "Bulbasaur" })
    ).toBeVisible();
    await page.getByRole("link", { name: /back to pokédex/iu }).click();
    await expect(page).toHaveURL(/\/$/u);
  });
});

test.describe("Theme toggle", () => {
  test("persists the selected theme across reload", async ({ page }) => {
    await page.goto("./");
    const toggle = page.getByRole("button", {
      name: /switch to (?<theme>dark|light) theme/iu,
    });
    await toggle.click();
    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );

    await page.reload();
    const stillDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(stillDark).toBe(isDark);
  });
});

test.describe("Favorites", () => {
  test("adding a favorite shows it on the favorites page and persists after reload", async ({
    page,
  }) => {
    await page.goto("./");
    await page
      .getByRole("link", { name: /^bulbasaur/iu })
      .getByRole("button")
      .click();

    await page.getByRole("link", { name: "Favorites", exact: true }).click();
    await expect(page).toHaveURL(/\/favorites$/u);
    await expect(
      page.getByRole("link", { name: /^bulbasaur/iu })
    ).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("link", { name: /^bulbasaur/iu })
    ).toBeVisible();
  });

  test("shows an empty state when there are no favorites", async ({ page }) => {
    await page.goto("./favorites");
    await expect(page.getByText("No favorites yet")).toBeVisible();
  });
});

test.describe("Berries", () => {
  test("lists berries and navigates to a detail page", async ({ page }) => {
    await page.goto("./berries");
    await expect(page.getByRole("heading", { name: "Berries" })).toBeVisible();
    const cheri = page.getByRole("link", { name: /cheri berry/iu });
    await expect(cheri).toBeVisible({ timeout: 10_000 });
    await cheri.click();
    await expect(page).toHaveURL(/\/berries\/cheri$/u);
    await expect(
      page.getByRole("heading", { name: "Cheri Berry" })
    ).toBeVisible();
  });
});

test.describe("404 page", () => {
  test("shows a friendly not-found page for unknown routes", async ({
    page,
  }) => {
    await page.goto("./this-route-does-not-exist");
    await expect(page.getByText("This Pokémon fled the area!")).toBeVisible();
    await page.getByRole("link", { name: /back to pokédex/iu }).click();
    await expect(page).toHaveURL(/\/$/u);
  });
});
