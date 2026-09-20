import React from "react";
import {
  FaWind,
  FaTint,
  FaSun,
  FaMoon,
  FaEye,
  FaTemperatureHigh,
  FaSmog,
} from "react-icons/fa";

const HighlightCard = ({
  icon: Icon,
  title,
  value,
  unit = "",
  badge = null,
  iconColor = "text-blue-400",
}) => (
  <div className="glass-card-highlight glass-card-interactive p-5 hover:scale-105 transition-all duration-300">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <Icon className={`text-xl ${iconColor}`} />
        <span className="text-small font-medium text-gray-300">{title}</span>
      </div>
    </div>
    <div className="flex items-end justify-between">
      <div className="text-2xl font-bold text-white">
        {value}
        {unit && <span className="text-base text-gray-400 ml-1">{unit}</span>}
      </div>
      {badge && <div className="ml-2">{badge}</div>}
    </div>
  </div>
);

const Highlights = ({ highlights, airQuality }) => {
  if (!highlights) return null;

  const { wind, humidity, visibility, sunrise, sunset, uv } = highlights;
  const aqi = airQuality?.list?.[0]?.main?.aqi;

  const components = airQuality?.list?.[0]?.components || {};

  const getAQILabel = (aqi) => {
    switch (aqi) {
      case 1:
        return { label: "Good", color: "bg-green-500 text-white" };
      case 2:
        return { label: "Fair", color: "bg-yellow-400 text-black" };
      case 3:
        return { label: "Moderate", color: "bg-orange-400 text-white" };
      case 4:
        return { label: "Poor", color: "bg-red-500 text-white" };
      case 5:
        return { label: "Very Poor", color: "bg-purple-600 text-white" };
      default:
        return { label: "Unknown", color: "bg-gray-400 text-white" };
    }
  };

  const { label: aqiLabel, color: aqiColor } = getAQILabel(aqi);

  const AQIBadge = () => (
    <span
      className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${aqiColor}`}
    >
      {aqiLabel} ({aqi})
    </span>
  );

  return (
    <div className="glass-card-premium p-6 animate-fade-in-up">
      <div className="mb-6">
        <h2 className="heading-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
          Today&apos;s Highlights
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <HighlightCard
          icon={FaWind}
          title="Wind Speed"
          value={wind}
          unit="m/s"
          iconColor="text-blue-400"
        />
        <HighlightCard
          icon={FaTint}
          title="Humidity"
          value={humidity}
          unit="%"
          iconColor="text-cyan-400"
        />
        <HighlightCard
          icon={FaEye}
          title="Visibility"
          value={visibility}
          unit="km"
          iconColor="text-green-400"
        />
        <HighlightCard
          icon={FaTemperatureHigh}
          title="UV Index"
          value={uv}
          iconColor="text-yellow-400"
        />
        <HighlightCard
          icon={FaSun}
          title="Sunrise"
          value={sunrise}
          iconColor="text-orange-400"
        />
        <HighlightCard
          icon={FaMoon}
          title="Sunset"
          value={sunset}
          iconColor="text-purple-400"
        />

        {airQuality && (
          <>
            <HighlightCard
              icon={FaSmog}
              title="Air Quality Index"
              value=""
              badge={<AQIBadge />}
            />

            <HighlightCard
              icon={FaSmog}
              title="CO"
              value={components.co}
              unit="μg/m³"
            />
            <HighlightCard
              icon={FaSmog}
              title="NO₂"
              value={components.no2}
              unit="μg/m³"
            />

            <HighlightCard
              icon={FaSmog}
              title="O₃"
              value={components.o3}
              unit="μg/m³"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Highlights;
