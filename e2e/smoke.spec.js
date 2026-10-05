import { test, expect, selectors } from './support/fixtures.js';

for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
  test(`offline map supports single and clustered cards at ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await expect(page.locator('#map.leaflet-container')).toBeVisible();
    await expect(page.locator('#loadErrorBanner')).toHaveCount(0);
    await expect(page.locator(selectors.singleMarker)).toHaveCount(1);
    await expect(page.locator(selectors.clusterMarker)).toHaveCount(1);
    await expect(page.locator('.leaflet-tile-loaded').first()).toBeVisible();

    await page.locator(selectors.singleMarker).click();
    await expect(page.locator('#cardPanel')).toHaveClass(/visible/);
    await expect(page.locator('#cardScroll')).toContainText('Fixture Solo Concert');
    await page.locator('#closeCardBtn').click();
    await expect(page.locator('#cardPanel')).not.toHaveClass(/visible/);

    await page.locator(selectors.clusterMarker).click();
    await expect(page.locator('#cardPanel')).toHaveClass(/multi-cards/);
    await expect(page.locator('#cardScroll')).toContainText('Fixture Cluster Theatre');
    await expect(page.locator('#cardScroll')).toContainText('Fixture Cluster Workshop');
    await expect(page.locator('.leaflet-control-attribution')).toContainText('OpenStreetMap');
    expect(errors).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath('cluster.png') });
  });
}
