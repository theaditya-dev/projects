import React from "react";

const TemperatureButton = ({ unit, currentUnit, onClick }) => {
  return (
    <button
      onClick={() => onClick(unit)}
      aria-pressed={currentUnit === unit}
      aria-label={`switch to ${unit}°`}
      className={`px-3 py-1 rounded transition-all duration-200 ${
        currentUnit === unit
          ? "bg-[#4e4e4e] text-white shadow-md"
          : "text-gray-400 hover:text-gray-300 hover:bg-[#2a2a2a]"
      }`}
    >
      {unit}°
    </button>
  );
};

const TemperatureToggle = ({ unit, onToggle }) => {
  return (
    <div
      className="flex items-center bg-[#363636] rounded-lg p-1"
      role="radiogroup"
      aria-label="Temperature unit"
    >
      <TemperatureButton unit="F" currentUnit={unit} onClick={onToggle} />
      <TemperatureButton unit="C" currentUnit={unit} onClick={onToggle} />
    </div>
  );
};

export default TemperatureToggle;
