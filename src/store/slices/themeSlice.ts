import { createSlice,type PayloadAction } from '@reduxjs/toolkit';
import type{ Theme, ThemeState, ResolvedTheme } from '../../types/theme';

// Helper function to get system theme
const getSystemTheme = (): ResolvedTheme => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// Helper function to apply theme to document
const applyThemeToDocument = (theme: Theme, resolvedTheme: ResolvedTheme) => {
  const documentElement = document.documentElement;
  
  // Remove existing theme attributes
  documentElement.removeAttribute('data-theme');
  documentElement.classList.remove('light', 'dark');
  
  // Set the data-theme attribute based on resolved theme
  const themeToApply = theme === 'system' ? resolvedTheme : theme;
  documentElement.setAttribute('data-theme', themeToApply);
  documentElement.classList.add(themeToApply);
};

// Get initial theme from localStorage
const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'system';
  }
  return 'system';
};

const getInitialResolvedTheme = (theme: Theme): ResolvedTheme => {
  return theme === 'system' ? getSystemTheme() : theme;
};

const initialState: ThemeState = {
  theme: getInitialTheme(),
  resolvedTheme: getInitialResolvedTheme(getInitialTheme()),
};

// Apply initial theme on slice creation
if (typeof window !== 'undefined') {
  applyThemeToDocument(initialState.theme, initialState.resolvedTheme);
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      const newTheme = action.payload;
      state.theme = newTheme;
      
      // Calculate resolved theme
      if (newTheme === 'system') {
        state.resolvedTheme = getSystemTheme();
      } else {
        state.resolvedTheme = newTheme;
      }
      
      // Save to localStorage
      localStorage.setItem('theme', newTheme);
      
      // Apply theme to document
      applyThemeToDocument(state.theme, state.resolvedTheme);
    },
    updateResolvedTheme: (state) => {
      if (state.theme === 'system') {
        state.resolvedTheme = getSystemTheme();
        applyThemeToDocument(state.theme, state.resolvedTheme);
      }
    },
  },
});

export const { setTheme, updateResolvedTheme } = themeSlice.actions;
export default themeSlice.reducer;