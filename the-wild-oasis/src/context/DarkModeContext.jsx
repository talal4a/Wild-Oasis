import { createContext, useContext } from "react";
import { useLocalStorageState } from "./../hooks/useLocalStorageState";
const DarkModeContext = createContext();
function DarkModeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useLocalStorageState(false, "isDarkMode");
  function toggleDarkMode() {
    setIsDarkMode((isDarkMode) => !isDarkMode);
  }
  return (
    <DarkModeContext.Provider value={toggleDarkMode}>
      {children}
    </DarkModeContext.Provider>
  );
}
function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined)
    throw new Error("DarkMode was used outside of DarkModeProvider");
  return context;
}
export { DarkModeProvider, useDarkMode };
