import React from "react";
import {
  FaMapMarkedAlt,
  FaWind,
  FaTint,
  FaCompass,
  FaEye,
} from "react-icons/fa";
import moment from "moment-timezone";
import { convertTemperature, formatTemperature } from "../utils/temperature";
import TemperatureToggle from "./TemperatureToggle";

const LocationHeader = ({ name, country }) => (
  <div className="glass-card p-4 mb-4">
    <div className="flex items-center">
      <FaMapMarkedAlt className="text-lg mr-3 text-blue-400" />
      <div>
        <h2 className="heading-md text-white">{name}</h2>
        <p className="text-small text-gray-300">{country}</p>
      </div>
    </div>
  </div>
);

const DateDisplay = ({ date }) => (
  <div className="text-left mb-4">
    <h3 className="md:text-3xl text-xl font-semibold">{date.format("dddd")}</h3>
    <h3 className="md:text-xl text-md mt-2 text-gray-300">
      {date.format("DD MMM YYYY")}
    </h3>
  </div>
);

const WeatherIconComponent = ({ icon, description }) => (
  <div>
    <img
      src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
      alt={description}
      className="w-24 h-24 md:w-36 md:h-36 mb-4"
    />
  </div>
);

const WeatherDetails = ({ humidity, windSpeed, pressure, visibility }) => (
  <div className="grid grid-cols-2 gap-4 mt-6">
    <div className="glass-card p-4 hover:bg-white/5 transition-all duration-200">
      <div className="flex items-center gap-3">
        <FaTint className="text-cyan-400 text-lg" />
        <div>
          <p className="text-small text-gray-400">Humidity</p>
          <p className="text-body font-semibold text-white">{humidity}%</p>
        </div>
      </div>
    </div>
    <div className="glass-card p-4 hover:bg-white/5 transition-all duration-200">
      <div className="flex items-center gap-3">
        <FaWind className="text-blue-400 text-lg" />
        <div>
          <p className="text-small text-gray-400">Wind Speed</p>
          <p className="text-body font-semibold text-white">
            {windSpeed || 0} m/s
          </p>
        </div>
      </div>
    </div>
    <div className="glass-card p-4 hover:bg-white/5 transition-all duration-200">
      <div className="flex items-center gap-3">
        <FaCompass className="text-purple-400 text-lg" />
        <div>
          <p className="text-small text-gray-400">Pressure</p>
          <p className="text-body font-semibold text-white">{pressure} hPa</p>
        </div>
      </div>
    </div>
    <div className="glass-card p-4 hover:bg-white/5 transition-all duration-200">
      <div className="flex items-center gap-3">
        <FaEye className="text-green-400 text-lg" />
        <div>
          <p className="text-small text-gray-400">Visibility</p>
          <p className="text-body font-semibold text-white">
            {(visibility / 1000).toFixed(1)} km
          </p>
        </div>
      </div>
    </div>
  </div>
);

const TemperatureDisplay = ({ temp, feelsLike, description, unit }) => (
  <div className="text-center">
    <div className="md:text-6xl text-4xl text-right font-bold">
      {formatTemperature(temp, unit)}
    </div>
    <div className="text-2xl text-right text-gray-200">
      {formatTemperature(feelsLike, unit)}
    </div>
    <div className="md:text-2xl text-xl capitalize mt-2 text-right">
      {description}
    </div>
    <div className="mt-2 text-right text-gray-200">
      Feels like: {formatTemperature(feelsLike, unit)}
    </div>
  </div>
);

const WeatherCard = ({ weather, unit, onToggleUnit }) => {
  if (!weather) return null;

  const {
    main,
    weather: WeatherData,
    name,
    sys,
    timezone,
    wind,
    visibility,
  } = weather;

  const iconCode = WeatherData[0]?.icon;
  const description = WeatherData[0]?.description;

  const timeZoneName = moment.tz.guess();
  const date = moment().tz(timeZoneName);

  const temp = convertTemperature(main.temp, unit);
  const feelsLike = convertTemperature(main.feels_like, unit);

  return (
    <div className="glass-card-weather p-6 animate-fade-in-up">
      <LocationHeader name={name} country={sys.country} />

      <div className="flex justify-between items-center mb-6">
        <DateDisplay date={date} />
        <TemperatureToggle unit={unit} onToggle={onToggleUnit} />
      </div>

      <TemperatureDisplay
        temp={temp}
        feelsLike={feelsLike}
        description={description}
        unit={unit}
      />

      <div className="flex justify-center mb-6">
        <WeatherIconComponent icon={iconCode} description={description} />
      </div>

      <WeatherDetails
        humidity={main?.humidity || 0}
        windSpeed={wind?.speed || 0}
        pressure={main?.pressure || 0}
        visibility={visibility || 0}
      />
    </div>
  );
};

export default WeatherCard;
