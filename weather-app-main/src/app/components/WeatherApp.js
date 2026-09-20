"use client";

import React from "react";
import { FaWind } from "react-icons/fa";
import moment from "moment-timezone";
import { convertTemperature, formatTemperature } from "../utils/temperature";

const LoadingState = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-gray-700 rounded-lg p-4 h-32"></div>
      ))}
    </div>
  </div>
);

const ForecastCard = ({ day, unit, index = 0 }) => {
  const date = moment(day.dt * 1000);
  const temp = convertTemperature(day.main.temp, unit);
  const minTemp = convertTemperature(day.main.temp_min, unit);
  const maxTemp = convertTemperature(day.main.temp_max, unit);
  const weatherIcon = day.weather[0]?.icon;
  const description = day.weather[0]?.description;

  const isToday = index === 0;

  return (
    <div
      className={`
      glass-card-forecast glass-card-interactive p-4 flex flex-col items-center hover:bg-white/5 transition-all duration-300 group relative
      ${isToday ? "glass-card-active" : ""}
    `}
    >
      {isToday && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
          Today
        </div>
      )}

      <div className="text-center mb-3">
        <div
          className={`text-small font-semibold ${
            isToday ? "text-blue-300" : "text-gray-200"
          }`}
        >
          {date.format("ddd")}
        </div>
        <div className="text-xs text-gray-400">{date.format("MMM D")}</div>
      </div>

      <div className="relative mb-3">
        <img
          src={`https://openweathermap.org/img/wn/${weatherIcon}@2x.png`}
          alt={description}
          className="w-16 h-16 group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      <div className="text-center mb-3">
        <div className="heading-md text-white mb-1">
          {formatTemperature(temp, unit)}
        </div>
        <div className="text-small text-gray-300">
          {formatTemperature(maxTemp, unit)} /{" "}
          {formatTemperature(minTemp, unit)}
        </div>
      </div>

      <div className="text-xs text-center text-gray-300 capitalize mb-3">
        {description}
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-400">
        <FaWind className="text-blue-400" />
        <span>{day.wind?.speed?.toFixed(1) || 0} m/s</span>
      </div>
    </div>
  );
};

const WeatherApp = ({ forecast, loading, unit }) => {
  if (loading) return <LoadingState />;
  if (!forecast) return null;

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="heading-lg text-white mb-1">5-Day Forecast</h3>
          <p className="text-small text-gray-400">Weather outlook ahead</p>
        </div>
        <div className="text-2xl opacity-60">📅</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        {forecast.map((day, index) => (
          <ForecastCard key={day.dt} day={day} unit={unit} index={index} />
        ))}
      </div>
    </div>
  );
};
export default WeatherApp;
