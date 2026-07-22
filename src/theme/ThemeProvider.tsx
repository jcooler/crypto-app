import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "qv-theme";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

const currentTheme = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // the no-flash script in index.html has already set the class
  const [theme, setTheme] = useState<Theme>(currentTheme);

  const apply = useCallback((next: Theme, persist: boolean) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    if (persist) localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
  }, []);

  const toggle = useCallback(() => {
    apply(currentTheme() === "dark" ? "light" : "dark", true);
  }, [apply]);

  // follow OS preference while the user hasn't chosen explicitly
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (!localStorage.getItem(STORAGE_KEY)) apply(mq.matches ? "light" : "dark", false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [apply]);

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
