import { test, expect } from './support/fixtures.js';

const creditsSelector = '#map .leaflet-control-attribution';

async function expectUsableCredits(page) {
  await page.locator('#cardPanel').evaluate((el) =>
    Promise.all(el.getAnimations().map((animation) => animation.finished)),
  );
  const credits = page.locator(creditsSelector);
  await expect(credits).toBeVisible();
  await expect.poll(() => credits.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const bar = document.querySelector('#topBar').getBoundingClientRect();
    const header = document.querySelector('#headerContainer').getBoundingClientRect();
    return rect.top >= Math.max(bar.bottom, header.bottom) + 3 &&
      rect.left >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight;
  })).toBe(true);

  for (const [name, href] of [
    ['OpenStreetMap', 'https://www.openstreetmap.org/copyright'],
    ['CARTO', 'https://carto.com/attributions'],
  ]) {
    const link = credits.getByRole('link', { name, exact: true });
    await expect(link).toHaveAttribute('href', href);
    // Test every wrapped fragment, not only a bounding box that might span empty space.
    await expect.poll(() => link.evaluate((el) => [...el.getClientRects()].every((r) => {
      const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return hit === el || el.contains(hit);
    }))).toBe(true);
    await link.click({ trial: true });
  }
}

for (const width of [280, 320, 390, 719, 720, 721, 1280]) {
  test(`main-map credits clear controls and cards at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expectUsableCredits(page);
    if (width >= 720) await expect(page.locator('#headerContainer')).toBeVisible();

    for (const clustered of [false, true]) {
      const pin = page.locator('#map .leaflet-marker-icon').filter({
        has: page.locator(clustered ? '.mpin-cluster-num' : '.mpin:not(:has(.mpin-cluster-num))'),
      }).first();
      await pin.locator('.mpin-circle').click();
      await expect(page.locator('#cardPanel')).toHaveClass(/visible/);
      await expectUsableCredits(page);
      await page.screenshot({ path: testInfo.outputPath(`credits-${clustered ? 'cluster' : 'single'}.png`) });
      await page.locator('#closeCardBtn').click();
      await expect(page.locator('#cardPanel')).not.toHaveClass(/visible/);
      await expectUsableCredits(page);
    }
  });
}

test('short landscapes keep wrapped credits above open clustered cards', async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 900 });
  await page.goto('/');
  await page.locator('#map .leaflet-marker-icon:has(.mpin-cluster-num) .mpin-circle').click();
  for (const width of [720, 900, 390, 200]) {
    await page.setViewportSize({ width, height: 320 });
    await expectUsableCredits(page);
    await expect.poll(async () => {
      const credits = await page.locator(creditsSelector).boundingBox();
      const panel = await page.locator('#cardPanel').boundingBox();
      return panel.y >= credits.y + credits.height + 7;
    }).toBe(true);
    await expect(page.locator('#closeCardBtn')).toBeInViewport({ ratio: 1 });
  }
  // A larger credit font changes wrapping without a window resize.
  await page.locator(creditsSelector).evaluate((el) => { el.style.fontSize = '16px'; });
  await expectUsableCredits(page);
  await page.locator('#closeCardBtn').click();
  await expectUsableCredits(page);
});

test('credits wrap within a very narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 200, height: 900 });
  await page.goto('/');
  await expectUsableCredits(page);
  await expect.poll(() => page.locator(creditsSelector).evaluate((el) =>
    el.getBoundingClientRect().height > parseFloat(getComputedStyle(el).lineHeight) * 1.5,
  )).toBe(true);
});

test('safe-top clearance is shared by header, controls and credits', async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 900 });
  await page.goto('/');
  // Desktop browsers have zero env(safe-area-inset-top); exercise the shared geometry explicitly.
  await page.locator('#app').evaluate((el) => el.style.setProperty('--map-safe-top', '44px'));
  await expectUsableCredits(page);
  const header = await page.locator('#headerContainer').boundingBox();
  const bar = await page.locator('#topBar').boundingBox();
  expect(header.height).toBe(124);
  expect(bar.y).toBe(header.y + header.height);
});

test('detail mini-map keeps its bottom-right provider credits', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/');
  await page.locator('#map .leaflet-marker-icon').filter({
    has: page.locator('.mpin:not(:has(.mpin-cluster-num))'),
  }).first().locator('.mpin-circle').click();
  await page.locator('#cardScroll [data-action="detail"]').first().click();
  const credits = page.locator('#detMapEl .leaflet-bottom.leaflet-right .leaflet-control-attribution');
  await expect(credits.getByRole('link', { name: 'OpenStreetMap', exact: true })).toHaveAttribute('href', 'https://www.openstreetmap.org/copyright');
  await expect(credits.getByRole('link', { name: 'CARTO', exact: true })).toHaveAttribute('href', 'https://carto.com/attributions');
  await expect(credits).toHaveCSS('margin-top', '0px');
});
