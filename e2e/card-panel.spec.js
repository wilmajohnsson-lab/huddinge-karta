import { test, expect, selectors } from './support/fixtures.js';

const singleMarker = (page) => page.locator(selectors.singleMarker).first();
const clusteredMarker = (page) => page.locator(selectors.clusterMarker).first();

async function expectClosed(page) {
  await expect(page.locator('#cardPanel')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#cardPanel')).toHaveJSProperty('inert', true);
  await expect(page.locator('#closeCardBtn')).toBeHidden();
  await expect(page.locator('#tabBar')).not.toHaveClass(/hidden/);
  await expect(page.locator('#tabBar')).toHaveCSS('opacity', '1');
  await expect(page.locator('#tabBar')).toHaveJSProperty('inert', false);
  // Even programmatic focus must not enter an inert panel.
  await page.locator('#closeCardBtn').evaluate((button) => button.focus());
  await expect(page.locator('#closeCardBtn')).not.toBeFocused();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    expect(await page.locator('#cardPanel').evaluate((panel) => panel.contains(document.activeElement))).toBe(false);
  }
}

async function expectOpen(page) {
  await expect(page.locator('#closeCardBtn')).toBeVisible();
  await expect(page.locator('#tabBar')).toHaveClass(/hidden/);
  await expect(page.locator('#tabBar')).toHaveCSS('opacity', '0');
  await expect(page.locator('#tabBar')).toHaveJSProperty('inert', true);
  await expect(page.locator('#cardPanel')).toHaveAttribute('aria-hidden', 'false');
  // Wait for opening animation, then check the close control is inside the panel and viewport.
  await expect.poll(async () => page.locator('#closeCardBtn').evaluate((button) => {
    const b = button.getBoundingClientRect();
    const p = button.closest('#cardPanel').getBoundingClientRect();
    return b.top >= 0 && b.bottom <= innerHeight && b.top >= p.top && b.bottom <= p.bottom;
  })).toBe(true);
}

for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
  test(`card close state, single and carousel at ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(singleMarker(page)).toBeVisible();
    await expectClosed(page);
    await singleMarker(page).focus();
    await page.keyboard.press('Enter');
    await expectOpen(page);
    await expect(page.locator('#cardScroll .ev-card')).toHaveCount(1);
    await expect(page.locator('#cardScroll')).toContainText('Fixture Solo Concert');
    await expect(page.locator('#closeCardBtn')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('.leaflet-marker-icon:focus')).toHaveCount(1);
    await expectClosed(page);

    await clusteredMarker(page).click();
    await expectOpen(page);
    expect(await page.locator('#cardScroll .ev-card').count()).toBeGreaterThan(1);
    await page.screenshot({ path: testInfo.outputPath('cluster-open.png') });
    await page.locator('#closeCardBtn').click();
    await expectClosed(page);
    await page.screenshot({ path: testInfo.outputPath('cards-closed.png') });
  });
}

test('resize and short landscape keep controls reachable; rapid close/reopen is safe', async ({ page }) => {
  await page.setViewportSize({ width: 719, height: 600 });
  await page.goto('/');
  await clusteredMarker(page).click();
  await expectOpen(page);
  await expect(page.locator('#cardNextBtn')).toBeHidden();
  await page.setViewportSize({ width: 900, height: 320 });
  await expectOpen(page);
  await expect(page.locator('#cardNextBtn')).toBeVisible();
  await page.locator('#cardNextBtn').click();
  await expect(page.locator('#cardPrevBtn')).toBeVisible();
  await page.locator('#closeCardBtn').evaluate((button) => button.click());
  // Resizing can place this fixed map coordinate behind the header; use keyboard activation.
  await clusteredMarker(page).focus();
  await page.keyboard.press('Space');
  await expectOpen(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 320 });
  await expectOpen(page);
  await expect(page.locator('#cardNextBtn')).toBeHidden();
  await page.locator('#closeCardBtn').click();
  await expectClosed(page);
});
