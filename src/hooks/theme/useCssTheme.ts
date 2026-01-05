import { useTheme } from './usetheme';
import type{ Theme } from '../../types/theme';

export const useCssTheme = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  // This function now properly handles the Theme type
  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return {
    theme,
    resolvedTheme,
    setTheme: handleSetTheme, // Use the typed function
    // Helper to check current theme
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'dark',
    
    // CSS variable classes
    classes: {
      bg: {
        primary: 'theme-bg-primary',
        secondary: 'theme-bg-secondary',
        card: 'theme-bg-card',
      },
      text: {
        primary: 'theme-text-primary',
        secondary: 'theme-text-secondary',
        muted: 'theme-text-muted',
      },
      border: 'theme-border',
      shadow: 'theme-shadow',
      card: 'theme-card',
      input: 'theme-input',
      button: {
        primary: 'theme-button-primary',
        secondary: 'theme-button-secondary',
      },
    },
  };
};