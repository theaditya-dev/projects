import { useState, useEffect } from "react";
import weatherApi from "./weatherApi";
import { getAirQuality } from "./getAirQuality";

export const useWeather = (initialLocation = "New York") => {
  const [weather, setWeather] = useState(null);
  const [highlights, setHighlights] = useState(null);
  const [airQuality, setAirQuality] = useState(null);

  const [location, setLocation] = useState(initialLocation);
  const [forecast, setForecast] = useState(null);
  const [citiesWeather, setCitiesWeather] = useState([]);
  const [temperatureUnit, setTemperatureUnit] = useState("C");
  const [loading, setLoading] = useState({
    weather: true,
    forecast: true,
    cities: true,
  });
  const [error, setError] = useState(null);
  const [cityError, setCityError] = useState(null);
  const [cities, setCities] = useState(["London", "Tokyo"]);

  const processHighlights = (weatherData) => {
    const { wind, main, visibility, sys } = weatherData;

    return {
      wind: `${wind?.speed || 0} m/s`,
      humidity: `${main?.humidity || 0}%`,
      uv: 0,
      pressure: `${main?.pressure || 0} hPa`,
      visibility: `${((visibility || 0) / 1000).toFixed(1)} km`,
      sunrise: sys?.sunrise
        ? new Date(sys.sunrise * 1000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A",
      sunset: sys?.sunset
        ? new Date(sys.sunset * 1000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A",
    };
  };

  const fetchWeather = async (loc = location) => {
    if (!loc) {
      console.log("No location provided");
      return;
    }

    setLoading((prev) => ({ ...prev, weather: true }));
    setError(null);
    setCityError(null);

    try {
      const weatherData = await weatherApi.getCurrentWeather(loc);
      setWeather(weatherData);
      setHighlights(processHighlights(weatherData));

      // Get air quality using lat/lon
      const { coord } = weatherData;
      const airQualityData = await getAirQuality(
        coord.lat,
        coord.lon,
        process.env.NEXT_PUBLIC_API_KEY
      );

      setWeather({ ...weatherData, airQuality: airQualityData });
      console.log("Weather data received:", weatherData);
    } catch (err) {
      console.error("Error fetching weather:", err);
      setError(err.message || "Failed to fetch weather data");
    } finally {
      setLoading((prev) => ({ ...prev, weather: false }));
    }
  };

  const fetchForecast = async () => {
    if (!location) {
      console.log("No location for forecast");
      return;
    }

    setLoading((prev) => ({ ...prev, forecast: true }));
    setError(null);

    try {
      const forecastData = await weatherApi.getForecast(location);
      const dailyForecast = forecastData.list
        .filter((item, index) => index % 8 === 0)
        .slice(0, 8);
      setForecast(dailyForecast);
      console.log("Forecast data received:", dailyForecast);
    } catch (err) {
      console.error("Error fetching forecast:", err);
      setError(err.message || "Failed to fetch forecast data");
    } finally {
      setLoading((prev) => ({ ...prev, forecast: false }));
    }
  };

  const fetchCitiesWeather = async () => {
    if (cities.length === 0) return;

    setLoading((prev) => ({ ...prev, cities: true }));
    setCityError(null);
    setError(null);

    try {
      const promises = cities.map((city) => weatherApi.getCurrentWeather(city));
      const results = await Promise.allSettled(promises);

      const successfulWeather = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      setCitiesWeather(successfulWeather);
    } catch (err) {
      console.error("Error fetching cities weather:", err);
      setError(err.message || "Failed to fetch cities weather");
    } finally {
      setLoading((prev) => ({ ...prev, cities: false }));
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWeather(location);
      fetchForecast();
    }, 500);

    return () => clearTimeout(timer);
  }, [location]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCitiesWeather();
    }, 500);

    return () => clearTimeout(timer);
  }, [cities]);

  const addCity = async (cityName) => {
    try {
      const newCityWeather = await weatherApi.getWeather(cityName);
      setCities((prev) => [...prev, cityName]);
      setCitiesWeather((prev) => [...prev, newCityWeather]);
    } catch (error) {
      console.error("Error adding city:", error);
      throw error;
    }
  };

  const removeCity = (cityName) => {
    setCities((prev) => prev.filter((city) => city !== cityName));
    setCitiesWeather((prev) => prev.filter((city) => city.name !== cityName));
  };

  return {
    weather,
    highlights,
    airQuality,
    setAirQuality,
    location,
    setLocation,
    forecast,
    citiesWeather,
    setCitiesWeather,
    cityError,
    setCityError,
    cities,
    setCities,
    temperatureUnit,
    setTemperatureUnit,
    loading,
    error,
    addCity,
    removeCity,
  };
};

export default useWeather;
