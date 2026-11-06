import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isNervTheme, NERV_THEMES } from '../src/utils/constants';
import en from '../src/i18n/locales/en.json';

const nervScss = readFileSync(join(import.meta.dir, '../src/styles/nerv.scss'), 'utf8');

describe('NERV theme family', () => {
  test('recognises only family members', () => {
    for (const id of NERV_THEMES) expect(isNervTheme(id)).toBe(true);
    for (const id of ['auto', 'light', 'white', 'dark', 'eva04'])
      expect(isNervTheme(id)).toBe(false);
  });

  test('every member has a palette and a menu label', () => {
    const labels = (en as { theme: Record<string, string> }).theme;
    for (const id of NERV_THEMES) {
      expect(nervScss).toMatch(new RegExp(`\\n  ${id}: \\(`));
      expect(labels[id]).toBeTruthy();
    }
  });

  test('effects are disabled for reduced motion', () => {
    expect(nervScss).toContain('@media (prefers-reduced-motion: reduce)');
  });

  test('stays calm: no looping animations', () => {
    expect(nervScss).not.toMatch(/infinite/);
    expect(nervScss).not.toMatch(/@keyframes/);
  });

  test('palettes key off the unit attribute so dark module overrides still apply', () => {
    expect(nervScss).toContain("[data-theme-family='nerv'][data-nerv-unit='#{$id}']");
    const store = readFileSync(join(import.meta.dir, '../src/stores/useThemeStore.ts'), 'utf8');
    expect(store).toContain("root.setAttribute('data-theme', 'dark')");
    expect(store).toContain("theme: 'nerv'");
  });
});
