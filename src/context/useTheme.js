import { useContext } from "react";
import { ThemeContext } from "./themeContextInstance.js";

export const useTheme = () => useContext(ThemeContext);
