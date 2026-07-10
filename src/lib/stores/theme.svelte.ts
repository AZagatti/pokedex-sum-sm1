const THEME_KEY = "pokedex-theme";
type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof localStorage === "undefined") {
    return "light";
  }
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  if (
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

function persistTheme(theme: Theme): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(THEME_KEY, theme);
}

function createThemeStore() {
  let theme = $state<Theme>("light");

  return {
    init() {
      theme = getInitialTheme();
      applyTheme(theme);
    },
    set(next: Theme) {
      theme = next;
      persistTheme(theme);
      applyTheme(theme);
    },
    toggle() {
      theme = theme === "light" ? "dark" : "light";
      persistTheme(theme);
      applyTheme(theme);
    },
    get value() {
      return theme;
    },
  };
}

export const themeStore = createThemeStore();
