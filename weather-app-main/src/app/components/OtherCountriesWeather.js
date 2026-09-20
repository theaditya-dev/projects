"use client";
import React, { useState } from "react";
import { FaTimes, FaPlus } from "react-icons/fa";
import { convertTemperature, formatTemperature } from "../utils/temperature";

const LoadingState = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-gray-700 rounded-lg p-4 h-24"></div>
      ))}
    </div>
  </div>
);

const CityWeatherCard = ({ city, unit, onRemove }) => {
  const temp = convertTemperature(city.main.temp, unit);
  const weatherIcon = city.weather?.[0].icon;
  const description = city.weather?.[0].description;

  return (
    <div className="glass-card glass-card-premium p-5 relative group hover:shadow-xl hover:shadow-blue-500/10 transform hover:-translate-y-1 transition-all duration-300">
      <button
        onClick={() => onRemove(city.id)}
        className="absolute top-3 right-3 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10 p-1 rounded-full hover:bg-red-500/20"
        aria-label={`Remove ${city.name}`}
      >
        <FaTimes className="text-sm" />
      </button>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{city.name}</h3>
          <p className="text-sm text-gray-300 font-medium">
            {city.sys.country}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <img
            src={`https://openweathermap.org/img/wn/${weatherIcon}@2x.png`}
            alt={description}
            className="w-12 h-12 drop-shadow-lg"
          />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatTemperature(temp, unit)}
          </div>
          <div className="text-sm text-gray-300 capitalize font-medium">
            {description}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400 mb-1">Feels like</div>
          <div className="text-sm text-gray-300 font-semibold">
            {formatTemperature(
              convertTemperature(city.main.feels_like, unit),
              unit
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AddCityModal = ({ isOpen, onClose, onAdd, isLoading }) => {
  const [cityName, setCityName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cityName.trim()) return;
    onAdd(cityName);
    setCityName("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card glass-card-premium p-6 w-full max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-300">
        <h2 className="text-xl font-semibold mb-6 text-white">Add New City</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            placeholder="Enter city name..."
            className="w-full py-3 px-4 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 mb-6 placeholder-gray-300 backdrop-blur-sm"
            disabled={isLoading}
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg hover:shadow-blue-500/25"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add City"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OtherCountriesWeather = ({
  citiesWeather,
  loading,
  unit,
  onAddCity,
  onRemoveCity,
  isAddingCity,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex-1 glass-card glass-card-weather p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Other Cities</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2.5 rounded-lg bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/10"
            aria-label="Add new city"
            disabled={isAddingCity}
          >
            <FaPlus className="text-sm" />
          </button>
        </div>
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="flex-1 glass-card glass-card-weather p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Other Cities</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-2.5 rounded-lg bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/10"
          aria-label="Add new city"
          disabled={isAddingCity}
        >
          <FaPlus className="text-sm" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {citiesWeather.map((city) => (
          <CityWeatherCard
            key={city.id}
            city={city}
            unit={unit}
            onRemove={onRemoveCity}
          />
        ))}
      </div>

      <AddCityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={onAddCity}
        isLoading={isAddingCity}
      />
    </div>
  );
};
export default OtherCountriesWeather;
