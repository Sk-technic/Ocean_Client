import { useEffect } from "react";
import { setTheme, updateResolvedTheme } from "../../store/slices/themeSlice";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { Theme } from "../../types/theme";

export const useTheme = () => {
  const dispatch = useDispatch();
  const themeState = useSelector((state: RootState) => state.theme);

  const changeTheme = (theme: Theme) => {
    dispatch(setTheme(theme));
  };

  const refreshSystemTheme = () => {
    dispatch(updateResolvedTheme());
  };

  // FIX: Sync CSS with Redux theme
  useEffect(() => {
    const appliedTheme = themeState.resolvedTheme;
    document.documentElement.setAttribute("data-theme", appliedTheme);
  }, [themeState.resolvedTheme]);

  return {
    theme: themeState.theme,
    resolvedTheme: themeState.resolvedTheme,
    setTheme: changeTheme,
    refreshSystemTheme,
  };
};
