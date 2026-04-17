import { test, expect } from "@playwright/test";

test.describe("cv-victoria smoke", () => {
  test("home renders identity, works, and contact CTA", async ({ page }) => {
    await page.goto("/");

    /* Identity — artist name is the h1 */
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Victoria/,
    );

    /* Works section — at least one gallery card is present */
    const gallery = page.getByRole("region", {
      name: /horizontal gallery/i,
    });
    await expect(gallery).toBeVisible();

    /* Begin a conversation CTA links to /contact */
    await expect(
      page.getByRole("link", { name: /begin a conversation/i }),
    ).toBeVisible();
  });

  test("gallery lightbox opens on click, closes on Escape", async ({
    page,
  }) => {
    await page.goto("/");

    const firstCard = page
      .getByRole("region", { name: /horizontal gallery/i })
      .getByRole("button")
      .first();
    await firstCard.click();

    /* Lightbox caption region should be visible. Look for the close-hint
       copy — it's the most stable anchor on the overlay. */
    await expect(page.getByText(/tap outside to close/i)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByText(/tap outside to close/i)).not.toBeVisible();
  });

  test("/contact loads the form and honeypot stays hidden", async ({
    page,
  }) => {
    await page.goto("/contact");

    /* Form inputs are behind a scroll-driven entry animation; scroll to
       reveal them before asserting. */
    await page.mouse.wheel(0, 4000);

    await expect(page.getByLabel(/your name/i)).toBeVisible();
    await expect(page.getByLabel(/your email/i)).toBeVisible();
    await expect(page.getByLabel(/what brings you here/i)).toBeVisible();

    /* Honeypot field exists in the DOM but must be aria-hidden. */
    const honeypot = page.locator("#contact-website");
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).toBeHidden();
  });
});
