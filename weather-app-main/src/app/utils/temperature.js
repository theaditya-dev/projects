export const convertTemperature = (temp, unit = "C") => {
  if (temp === undefined || temp === null || isNaN(temp)) return null;

  const temperature = parseFloat(temp);

  if (unit === "C") {
    return temperature;
  } else if (unit === "F") {
    return (temperature * 9) / 5 + 32;
  }

  console.warn(`Unknown temperature unit: ${unit}. Using Celsius as fallback.`);
  return temperature;
};

export const formatTemperature = (temp, unit = "C") => {
  if (temp === undefined || temp === null || isNaN(temp)) return "--";

  const temperature = parseFloat(temp);
  if (isNaN(temperature)) return "--";

  // Handle extreme temperatures with scientific notation
  if (Math.abs(temperature) >= 1e6) {
    return `${temperature.toExponential(1)}°${unit}`;
  }

  return `${Math.round(temperature)}°${unit}`;
};
