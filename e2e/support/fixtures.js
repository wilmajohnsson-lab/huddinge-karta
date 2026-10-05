import { test as base, expect } from '@playwright/test';
import items from '../fixtures/items.json';
const image = '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#e4e9e3"/></svg>';

export const selectors = {
  singleMarker: '.leaflet-marker-icon:has(.mpin):not(:has(.mpin-cluster-num))',
  clusterMarker: '.leaflet-marker-icon:has(.mpin-cluster-num)',
};

export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    // Freeze dates, not timers: Leaflet transitions and browser layout stay real.
    await page.clock.setFixedTime(new Date('2026-06-15T10:00:00Z'));
    const origin = new URL(baseURL).origin;
    await page.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin) {
        if (request.resourceType() === 'image') {
          return route.fulfill({ contentType: 'image/svg+xml', body: image });
        }
        // Analytics and any unexpected remote API never reach the network.
        return route.fulfill({ status: 204, body: '' });
      }
      if (url.pathname === '/data/items-combined.json') return route.fulfill({ json: items });
      if (url.pathname === '/data/aktorlista_updated.json') return route.fulfill({ json: [] });
      if (url.pathname === '/e2e-fixture.svg') {
        return route.fulfill({ contentType: 'image/svg+xml', body: image });
      }
      return route.continue();
    });
    await use(page);
  },
});

export { expect };
