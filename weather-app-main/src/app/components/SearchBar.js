"use client";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ location, setLocation }) => {
  const [SearchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!SearchTerm.trim()) return;
    setIsLoading(true);
    try {
      await setLocation(SearchTerm.trim());
      setSearchTerm("");
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative" role="search">
      <label htmlFor="city-search" className="sr-only">
        Search for a city
      </label>
      <input
        id="city-search"
        type="text"
        value={SearchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for a city..."
        disabled={isLoading}
        className="w-64 py-2 pl-4 pr-10 rounded-lg bg-[#1e1e1e] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 disabled:opacity-50"
        disabled={isLoading}
        aria-label="Search"
      >
        <FaSearch className={isLoading ? "animate-spin" : ""} />
      </button>
    </form>
  );
};
export default SearchBar;
