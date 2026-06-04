// test/helpers.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import {
  isDesktop,
  getVisible,
  mHtml,
  chipHtml,
  metaHtml,
  eCardHtml,
  spCardHtml,
  searchItems,
  toggleFpChip,
} from '../src/js/test-helpers.js';

describe('test-helpers', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    window.innerWidth = 1024;
  });

  it('isDesktop uses window.innerWidth', () => {
    window.innerWidth = 800;
    expect(isDesktop()).toBe(true);
    window.innerWidth = 400;
    expect(isDesktop()).toBe(false);
  });

  it('getVisible filters by cat, free, orgs and areas', () => {
    const items = [
      { id: 1, cat: 'event', free: true, host: 'A', area: 'x' },
      { id: 2, cat: 'konst', free: false, host: 'B', area: 'y' },
      { id: 3, cat: 'event', free: false, host: 'A', area: 'y' },
    ];
    const fs = { free: false, orgs: new Set(), areas: new Set() };
    expect(getVisible(items, null, fs).length).toBe(3);
    expect(getVisible(items, 'event', fs).map((i) => i.id)).toEqual([1, 3]);
    fs.free = true;
    expect(getVisible(items, 'event', fs).map((i) => i.id)).toEqual([1]);
    fs.free = false;
    fs.orgs.add('A');
    expect(getVisible(items, null, fs).map((i) => i.id)).toEqual([1, 3]);
    fs.orgs.clear();
    fs.areas.add('y');
    expect(getVisible(items, null, fs).map((i) => i.id)).toEqual([2, 3]);
  });

  it('mHtml returns mpin html with color and size', () => {
    const html = mHtml('event', true);
    expect(html).toContain('mpin-lg');
    expect(html).toContain('#a04612');
    const html2 = mHtml('musik', false);
    expect(html2).toContain('mpin-sm');
    expect(html2).toContain('#8a7515');
  });

  it('chipHtml includes chip-on or chip-dim classes', () => {
    expect(chipHtml('event', 'event')).toContain('chip-on');
    expect(chipHtml('konst', 'event')).toContain('chip-dim');
  });

  it('metaHtml includes date/time/loc and Gratis if free', () => {
    const item = { date: '2026-06-01', time: '10–12', loc: 'Centrum', free: true };
    const html = metaHtml(item);
    expect(html).toContain('2026-06-01');
    expect(html).toContain('10');
    expect(html).toContain('Centrum');
    expect(html).toContain('Gratis');
  });

  it('eCardHtml and spCardHtml include ids and images', () => {
    const item = { id: 11, name: 'Namn', desc: 'Desc', img: 'https://example.test/img.png', date: 'd', time: 't', loc: 'L' };
    const e = eCardHtml(item);
    expect(e).toContain('data-item-id="11"');
    expect(e).toContain(item.img);
    expect(e).toContain(item.name);
    const s = spCardHtml(item);
    expect(s).toContain('data-item-id="11"');
  });

  it('searchItems does case-insensitive match on name and loc', () => {
    const items = [
      { id: 1, name: 'Kafé', loc: 'Centrum' },
      { id: 2, name: 'Teater', loc: 'Stadshuset' },
    ];
    expect(searchItems(items, 'kaf').map((i) => i.id)).toEqual([1]);
    expect(searchItems(items, 'stad').map((i) => i.id)).toEqual([2]);
    expect(searchItems(items, '').length).toBe(2);
  });

  it('toggleFpChip toggles Set membership and element class', () => {
    const el = document.createElement('button');
    const s = new Set();
    expect(toggleFpChip(el, s, 'A')).toBe(true);
    expect(s.has('A')).toBe(true);
    expect(el.classList.contains('on')).toBe(true);
    expect(toggleFpChip(el, s, 'A')).toBe(false);
    expect(s.has('A')).toBe(false);
    expect(el.classList.contains('on')).toBe(false);
  });
});
