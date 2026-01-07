"use client";

import { useState } from "react";
import { motion } from "motion/react";


export default function SearchBar() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search query:", query);
    // Handle search logic here
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <form onSubmit={handleSearch} className="flex items-center w-full max-w-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Pokémon..."
          className="w-full p-2 pr-0 border border-gray-300 shadow-sm rounded-tl-full rounded-bl-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="font-pocket-monk ml-2 px-4 py-2 text-white bg-blue-900 rounded-tr-full rounded-br-full hover:bg-blue-600 focus:outline-none"
        >
          Search
        </button>
      </form>
    </motion.div>
  );
}
