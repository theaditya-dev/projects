import axios from "axios";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
// Note: In a real application, this should be stored in an environment variable and not hardcoded
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const weatherApi = {
  // get current weather for a city
  getCurrentWeather: async (city) => {
    try {
      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          q: city,
          appid: API_KEY,
          units: "metric", // or "imperial" for Fahrenheit
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error fetching current weather data"
      );
    }
  },

  // Alternative method name to match useWeather.js usage

  // get 5 day forecast for a city
  getForecast: async (city) => {
    try {
      const response = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          q: city,
          appid: API_KEY,
          units: "metric",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error fetching forecast data"
      );
    }
  },

  // get weather for multiple cities
  getMultipleCitiesWeather: async (cities) => {
    try {
      const promises = cities.map((city) =>
        axios.get(`${BASE_URL}/forecast`, {
          params: {
            q: city,
            appid: API_KEY,
            units: "metric",
          },
        })
      );
      const responses = await Promise.all(promises);
      return responses.map((response) => response.data);
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error fetching multiple city data"
      );
    }
  },
  getWeather: async (city) => {
    return weatherApi.getCurrentWeather(city);
  },
};

export default weatherApi;
