import type { ColorMap } from "@/interfaces/ColorMap";

export const mapTextContrast = <ColorMap>{
  dark: "white",
  success: "white",
  warning: "white",
  danger: "white",
  info: "dark",
  light: "dark",
};

export const mapTemperatureColor = (value: number) => {
  let color = "#41B883"; // green
  if (value > 50 && value <= 70) {
    color = "#ffda6b"; // orange
  } else if (value > 70) {
    color = "#ff4136"; // red
  }

  return color;
};

export const mapUsageColor = (value: number) => {
  let color = "#41B883"; // green
  if (value > 50 && value <= 70) {
    color = "#ffda6b"; // orange
  } else if (value > 70) {
    color = "#ff4136"; // red
  }

  return color;
};
