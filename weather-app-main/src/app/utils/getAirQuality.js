import axios from "axios";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export const getAirQuality = async (lat, lon) => {
  if (!lat || !lon || !API_KEY) {
    throw new Error("Missing latitude, longitude, or API key");
  }

  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/air_pollution",
      {
        params: {
          lat,
          lon,
          appid: API_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Air quality fetch error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch air quality");
  }
};
