"use client";
import React, { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import { useWeather } from "./utils/useWeather";
import WeatherApp from "./components/WeatherApp";
import Highlights from "./components/Highlights";
import OtherCountriesWeather from "./components/OtherCountriesWeather";
import AirQuality from "./components/AirQuality";
import { getAirQuality } from "./utils/getAirQuality";

// Dynamic background component
const WeatherBackground = ({ weather }) => {
  const [backgroundClass, setBackgroundClass] = useState("weather-background");

  useEffect(() => {
    if (!weather) {
      setBackgroundClass("weather-background");
      return;
    }

    const weatherCondition = weather.weather?.[0]?.main?.toLowerCase();
    const isNight = new Date().getHours() >= 18 || new Date().getHours() <= 6;

    let bgClass = "weather-background";

    if (isNight) {
      bgClass += " weather-night";
    } else {
      switch (weatherCondition) {
        case "clear":
          bgClass += " weather-clear";
          break;
        case "clouds":
          bgClass += " weather-cloudy";
          break;
        case "rain":
        case "drizzle":
          bgClass += " weather-rainy";
          break;
        case "snow":
          bgClass += " weather-snowy";
          break;
        default:
          bgClass += "";
      }
    }

    setBackgroundClass(bgClass);
  }, [weather]);

  return <div className={backgroundClass}></div>;
};

export default function Home() {
  const {
    weather,
    highlights,
    location,
    setLocation,
    forecast,
    temperatureUnit,
    setTemperatureUnit,
    citiesWeather,
    setCitiesWeather,
    cityError,
    loading,
    error,
  } = useWeather();

  const handleAddCity = async (cityName) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error("City not found or API error");
      }

      const newCityWeather = await response.json();

      if (citiesWeather.some((city) => city.id === newCityWeather.id)) {
        throw new Error("City already in list");
      }

      setCitiesWeather((prev) => [...prev, newCityWeather]);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const handleRemoveCity = (cityId) => {
    setCitiesWeather((prev) => prev.filter((city) => city.id !== cityId));
  };

  return (
    <div className="min-h-screen text-white">
      {/* Dynamic Weather Background */}
      <WeatherBackground weather={weather} />

      <div className="container-custom py-6 lg:py-8">
        {/* Header Section */}
        <header className="glass-card p-6 lg:p-8 mb-8 animate-fade-in-up">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <h1 className="heading-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                WeatherVue
              </h1>
              <p className="text-body text-gray-300 mb-4">
                Your intelligent weather companion for global forecasts
              </p>
              <div className="flex flex-col sm:flex-row gap-2 text-small text-gray-400">
                <span>Created by Sayan Adhikary</span>
                <span className="hidden sm:inline">•</span>
                <a
                  href="https://www.linkedin.com/in/sayan-adhikary-13077a1ab/"
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-200 underline decoration-2 underline-offset-2"
                >
                  Connect on LinkedIn
                </a>
              </div>
            </div>
            <div className="w-full lg:w-auto lg:min-w-[300px]">
              <SearchBar location={location} setLocation={setLocation} />
            </div>
          </div>
        </header>

        {/* Error Messages */}
        {error && (
          <div className="glass-card border-red-400/30 bg-red-500/10 text-red-300 p-4 mb-6 animate-slide-in">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-white font-bold">!</span>
              </div>
              <p className="text-body">{error}</p>
            </div>
          </div>
        )}

        {cityError && (
          <div className="glass-card border-orange-400/30 bg-orange-500/10 text-orange-300 p-4 mb-6 animate-slide-in">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-white font-bold">⚠</span>
              </div>
              <p className="text-body">{cityError}</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 mb-8">
          {weather && (
            <div className="xl:col-span-1">
              <WeatherCard
                weather={weather}
                unit={temperatureUnit}
                onToggleUnit={setTemperatureUnit}
              />
            </div>
          )}

          {highlights && (
            <div className="xl:col-span-2">
              <Highlights
                highlights={highlights}
                airQuality={weather?.airQuality}
              />
            </div>
          )}
        </div>

        {/* Secondary Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="order-2 lg:order-1">
            <OtherCountriesWeather
              citiesWeather={citiesWeather}
              loading={loading.cities}
              unit={temperatureUnit}
              onAddCity={handleAddCity}
              onRemoveCity={handleRemoveCity}
              isAddingCity={loading.cities}
            />
          </div>
          <div className="order-1 lg:order-2">
            <WeatherApp
              forecast={forecast}
              loading={loading.forecast}
              unit={temperatureUnit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
