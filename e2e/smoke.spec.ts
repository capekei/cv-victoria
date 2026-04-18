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

  test("portrait is the optimized JPEG, not the 3.4MB PNG", async ({
    page,
  }) => {
    await page.goto("/");

    /* Next/Image rewrites the src to /_next/image?url=...&q=...; check the
       underlying url param references the .jpg source, not the removed .png. */
    const portrait = page.getByRole("img", { name: /victoria/i }).first();
    const src = await portrait.getAttribute("src");
    expect(src).toBeTruthy();
    const decoded = decodeURIComponent(src ?? "");
    expect(decoded).toMatch(/victoria-portrait\.jpg/);
    expect(decoded).not.toMatch(/victoria-portrait\.png/);
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

  test("home page exposes structured data for SEO", async ({ page }) => {
    await page.goto("/");

    /* JSON-LD script block is server-rendered with buildPersonGraph output.
       Confirm it loads, parses, and points at the .jpg portrait. */
    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    expect(jsonLd).toBeTruthy();
    const parsed = JSON.parse(jsonLd!);
    expect(parsed).toBeTruthy();
    /* The graph contains a Person node with image pointing at the JPEG. */
    const serialized = JSON.stringify(parsed);
    expect(serialized).toMatch(/victoria-portrait\.jpg/);
    expect(serialized).not.toMatch(/victoria-portrait\.png/);
  });

  test("/contact loads the form with accessible bot trap", async ({
    page,
  }) => {
    await page.goto("/contact");

    /* Form inputs are behind a scroll-driven entry animation; scroll to
       reveal them before asserting. */
    await page.mouse.wheel(0, 4000);

    await expect(page.getByLabel(/your name/i)).toBeVisible();
    await expect(page.getByLabel(/your email/i)).toBeVisible();
    await expect(page.getByLabel(/what brings you here/i)).toBeVisible();

    /* Honeypot contract: in the DOM, not keyboard-reachable, not
       announced to screen readers, positioned off-screen. Playwright's
       toBeHidden() is a poor fit here (1×1 element has non-zero box);
       instead assert the actual bot-trap properties. */
    const honeypot = page.locator("#contact-website");
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
    await expect(honeypot).toHaveAttribute("autocomplete", "off");

    const honeypotContainer = honeypot.locator("xpath=..");
    await expect(honeypotContainer).toHaveAttribute("aria-hidden", "true");

    /* Bounding box is off-screen to the left. */
    const box = await honeypot.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.x).toBeLessThan(-1000);
  });

  test("contact form client-side validation triggers on empty submit", async ({
    page,
  }) => {
    await page.goto("/contact");
    await page.mouse.wheel(0, 4000);

    await expect(page.getByLabel(/your name/i)).toBeVisible();

    /* Submit with empty fields — Zod resolver should populate error messages
       without hitting the Server Action. Force-click is intentional: the
       ContactExperience multi-phase transition overlay briefly intercepts
       pointer events during the reveal, but the underlying button is
       reachable and wired correctly. We're exercising validation wiring,
       not overlay timing. */
    await page
      .getByRole("button", { name: /submit contact form/i })
      .click({ force: true });

    /* At least one validation message appears (role="alert" is live). */
    await expect(page.getByRole("alert").first()).toBeVisible();
  });

  test("migrated sections render on the home page", async ({ page }) => {
    await page.goto("/");

    /* Post-Tailwind-migration sanity: each major section's heading resolves
       via accessible name, proving classes compiled and layout didn't nuke
       semantics. */
    await expect(
      page.getByRole("heading", { level: 2, name: /statement/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: /^works$/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: /process/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: /exhibitions/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: /education/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: /contact/i }),
    ).toBeVisible();
  });

  test("api/contact route is gone — Server Action only", async ({
    request,
  }) => {
    /* After the Server Action migration, the /api/contact POST route was
       removed. A stray POST should 404, confirming there's no shadow route. */
    const res = await request.post("/api/contact", {
      data: { name: "Test", email: "t@example.com", message: "hello world" },
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(404);
  });
});
