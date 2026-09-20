"use client";
import React, { useEffect, useState } from "react";
import { getAirQuality } from "../utils/getAirQuality";

const getAQIDescription = (aqi) => {
  return ["Good", "Fair", "Moderate", "Poor", "Very Poor"][aqi - 1];
};

const getAQIColor = (aqi) => {
  return ["#00e400", "#9cff00", "#ffcf00", "#ff7e00", "#ff0000"][aqi - 1];
};

const AirQuality = ({ lat, lon }) => {
  const [aqiData, setAqiData] = useState(null);
  const [error, setError] = useState(null);
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

  useEffect(() => {
    if (lat && lon) {
      getAirQuality(lat, lon, apiKey)
        .then(setAqiData)
        .catch((err) => setError(err.message));
    }
  }, [lat, lon]);

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!aqiData) return <div>Loading Air Quality...</div>;

  const { main, components } = aqiData;

  return (
    <div
      className="p-4 rounded-xl shadow-lg"
      style={{ backgroundColor: getAQIColor(main.aqi) }}
    >
      <h2 className="text-xl font-bold mb-2 text-black">
        🌫️ Air Quality Index
      </h2>
      <p>
        <strong>AQI:</strong> {main.aqi} ({getAQIDescription(main.aqi)})
      </p>
      <p>
        <strong>PM2.5:</strong> {components.pm2_5} μg/m³
      </p>
      <p>
        <strong>PM10:</strong> {components.pm10} μg/m³
      </p>
      <p>
        <strong>O₃:</strong> {components.o3} μg/m³
      </p>
    </div>
  );
};

export default AirQuality;
