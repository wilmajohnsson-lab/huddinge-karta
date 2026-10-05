import { test, expect, selectors } from './support/fixtures.js';
import items from './fixtures/items.json';

async function openArt(page, overrides = {}, clustered = false) {
  const art = {
    id: 'fixture-art', cat: 'konst', name: 'Väggkonst', artist: 'Okänd',
    lat: 59.218, lng: 17.975, loc: 'Fixture Hall', area: 'huddinge',
    img: '/e2e-fixture.svg', utomhus: true, ...overrides,
  };
  await page.route('**/data/items-combined.json', (route) => route.fulfill({
    json: { ...items, konst: clustered ? [art, { ...art, id: 'fixture-art-2' }] : [art] },
  }));
  await page.goto('/');
  await expect(page.locator(selectors.singleMarker).first()).toBeVisible();
  await page.locator('[data-tab="platser"]').click();
  const marker = page.locator(clustered ? selectors.clusterMarker : selectors.singleMarker).first();
  await marker.locator('.mpin-circle').click();
  await expect(page.locator('#closeCardBtn')).toBeFocused();
  await page.locator('#cardPanel').evaluate((panel) =>
    Promise.all(panel.getAnimations().map((animation) => animation.finished)),
  );
  await page.evaluate(() => document.fonts.ready);
  return page.locator('#cardScroll .ev-card').first();
}

async function expectArtLayout(card, outdoors = true) {
  const badge = card.locator('.ev-tag-utomhus');
  if (outdoors) {
    await expect(badge).toHaveText('Utomhus');
    const heading = await card.locator('.ev-card-name').boundingBox();
    const artist = await card.locator('.ev-card-desc').boundingBox();
    const tag = await badge.boundingBox();
    expect(tag.x).toBeGreaterThanOrEqual(heading.x + heading.width + 7);
    expect(tag.x).toBeGreaterThanOrEqual(artist.x + artist.width + 7);
    expect(Math.abs(tag.y - heading.y)).toBeLessThan(1);
  } else {
    await expect(badge).toHaveCount(0);
  }
  // Being "visible" alone doesn't detect clipping by the fixed-height card.
  expect(await card.evaluate((el) => {
    const card = el.getBoundingClientRect();
    const top = el.querySelector('.ev-card-top').getBoundingClientRect();
    const button = el.querySelector('[data-action="detail"]').getBoundingClientRect();
    return button.top >= top.bottom && button.bottom <= card.bottom - 8 &&
      button.left >= card.left + 8 && button.right <= card.right - 8;
  })).toBe(true);
}

async function expectButtonHitTarget(card) {
  const button = card.getByRole('button', { name: 'Mer info', exact: true });
  await expect(button).toBeInViewport({ ratio: 1 });
  expect(await button.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return [0.15, 0.5, 0.85].every((y) => {
      const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height * y);
      return hit === el || el.contains(hit);
    });
  })).toBe(true);
  await button.click({ trial: true });
}

for (const width of [280, 320, 390, 719, 720, 721, 1280]) {
  test(`outdoor badge shares the heading row and Mer info fits at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const card = await openArt(page);
    await expectArtLayout(card);
    await expectButtonHitTarget(card);
    await page.screenshot({ path: testInfo.outputPath('art-card.png') });
    await card.getByRole('button', { name: 'Mer info' }).click();
    await expect(page.locator('#detailScreen')).toHaveClass(/visible/);
    await expect(page.locator('#detailScreen .det-title')).toHaveText('Väggkonst');
    await page.locator('#detBackBtn').click();
    await page.locator('#closeCardBtn').click();
    await expect(page.locator('#cardPanel')).toHaveJSProperty('inert', true);
    await expect(card.getByRole('button', { name: 'Mer info' })).toBeHidden();
  });
}

for (const outdoors of [true, false]) {
  test(`long art titles and artists keep the button reachable (outdoors: ${outdoors})`, async ({ page }) => {
    await page.setViewportSize({ width: 280, height: 900 });
    const card = await openArt(page, {
      name: 'Ett konstverk med en mycket lång titel',
      artist: 'Konstnärsnamnutsanmellanslagförattprovatradbrytning',
      utomhus: outdoors,
    });
    await expectArtLayout(card, outdoors);
    await expectButtonHitTarget(card);
    // Close gets focus on opening; Tab must reach the real detail button.
    await page.keyboard.press('Tab');
    await expect(card.getByRole('button', { name: 'Mer info' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#detailScreen')).toHaveClass(/visible/);
  });
}

test('clustered art cards survive breakpoint and short-landscape resizing', async ({ page }) => {
  await page.setViewportSize({ width: 721, height: 900 });
  const card = await openArt(page, {}, true);
  await expect(page.locator('#cardScroll .ev-card')).toHaveCount(2);
  await expectArtLayout(card);
  await expectButtonHitTarget(card);
  for (const width of [719, 720, 721, 390, 900]) {
    await page.setViewportSize({ width, height: 320 });
    await expectArtLayout(card);
    // The panel intentionally scrolls vertically on short screens.
    await card.getByRole('button', { name: 'Mer info' }).scrollIntoViewIfNeeded();
    await expectButtonHitTarget(card);
    await expect(page.locator('#closeCardBtn')).toBeInViewport({ ratio: 1 });
  }
  await card.getByRole('button', { name: 'Mer info' }).click();
  await expect(page.locator('#detailScreen')).toHaveClass(/visible/);
});
