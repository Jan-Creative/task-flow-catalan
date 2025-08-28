import { useState } from "react";

export type CircularMenuMode = "arc" | "sphere";

export const useCircularMenuMode = (defaultMode: CircularMenuMode = "sphere") => {
  const [mode, setMode] = useState<CircularMenuMode>(defaultMode);

  const toggleMode = () => {
    setMode(prev => prev === "arc" ? "sphere" : "arc");
  };

  const setArcMode = () => setMode("arc");
  const setSphereMode = () => setMode("sphere");

  return {
    mode,
    isArcMode: mode === "arc",
    isSphereMode: mode === "sphere",
    toggleMode,
    setArcMode,
    setSphereMode
  };
};