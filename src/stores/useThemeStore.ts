/**
 * 主题状态管理
 * 从原项目 src/modules/theme.js 迁移
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NervTheme, Theme } from '@/types';
import { isNervTheme, STORAGE_KEY_THEME } from '@/utils/constants';

type ResolvedTheme = 'light' | 'dark';
type AppliedTheme = ResolvedTheme | 'white' | NervTheme;

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  initializeTheme: () => () => void;
}

const getSystemTheme = (): ResolvedTheme => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const resolveAutoTheme = (): AppliedTheme => {
  return getSystemTheme() === 'dark' ? 'dark' : 'white';
};

const normalizeResolvedTheme = (theme: AppliedTheme): ResolvedTheme => {
  // The NERV family is dark-based: icons and charts use their dark variants.
  return theme === 'dark' || isNervTheme(theme) ? 'dark' : 'light';
};

const resolveTheme = (theme: Theme): AppliedTheme => {
  if (theme === 'auto') {
    return resolveAutoTheme();
  }
  if (theme === 'white') {
    return 'white';
  }
  return theme;
};

const applyTheme = (resolved: AppliedTheme) => {
  const root = document.documentElement;
  // The NERV family is dark-based: data-theme='dark' keeps every module's dark override
  // working, the family attribute carries the shared structure and the unit swaps the palette.
  if (isNervTheme(resolved)) {
    root.setAttribute('data-theme', 'dark');
    root.setAttribute('data-theme-family', 'nerv');
    root.setAttribute('data-nerv-unit', resolved);
    return;
  }
  root.removeAttribute('data-theme-family');
  root.removeAttribute('data-nerv-unit');

  if (resolved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    return;
  }

  if (resolved === 'white') {
    document.documentElement.setAttribute('data-theme', 'white');
    return;
  }

  document.documentElement.removeAttribute('data-theme');
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // NERV is the default console look.
      theme: 'nerv',
      resolvedTheme: 'dark',

      setTheme: (theme) => {
        const resolved = resolveTheme(theme);
        applyTheme(resolved);
        set({
          theme,
          resolvedTheme: normalizeResolvedTheme(resolved),
        });
      },

      initializeTheme: () => {
        const { theme, setTheme } = get();

        // 应用已保存的主题
        setTheme(theme);

        // 监听系统主题变化（仅在 auto 模式下生效）
        if (!window.matchMedia) {
          return () => {};
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = () => {
          const { theme: currentTheme } = get();
          if (currentTheme === 'auto') {
            const resolved = resolveAutoTheme();
            applyTheme(resolved);
            set({ resolvedTheme: normalizeResolvedTheme(resolved) });
          }
        };

        mediaQuery.addEventListener('change', listener);

        return () => mediaQuery.removeEventListener('change', listener);
      },
    }),
    {
      name: STORAGE_KEY_THEME,
      // v1 made NERV the default: a choice saved before it moves to NERV once,
      // unless it already was a NERV unit.
      version: 1,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<ThemeState>;
        if (version < 1 && !(state.theme && isNervTheme(state.theme))) {
          return { ...state, theme: 'nerv' } as ThemeState;
        }
        return state as ThemeState;
      },
    }
  )
);
