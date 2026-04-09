export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "theme";

const getStoredTheme = (): Theme | null => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return null;
};

const getSystemTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

const setStoredTheme = (theme: Theme) => {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

export const toggleTheme = () => {
  const theme: Theme = getStoredTheme() ?? getSystemTheme();
  const nextTheme: Theme = theme === "dark" ? "light" : "dark";

  applyTheme(nextTheme);
  setStoredTheme(nextTheme);
};

export const initializeTheme = (): Theme => {
  const storedTheme = getStoredTheme();
  const theme = storedTheme ?? getSystemTheme();

  applyTheme(theme);

  if (!storedTheme) {
    setStoredTheme(theme);
  }

  return theme;
};
