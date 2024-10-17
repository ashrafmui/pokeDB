"use client";

import Link from "next/link";

export default function GenerationButtons() {
  const generations = Array.from({ length: 7 }, (_, index) => `Gen ${index + 1}`);

  return (
    <div className="flex gap-4 justify-center my-4">
      {generations.map((gen, index) => (
        <Link
          key={index}
          href={`/generation/${index + 1}`} // Adjust the URL path as needed
          passHref
        >
          <button
          className="font-pocket-monk  ml-2 px-4 py-2 bg-white text-black rounded-3xl hover:bg-blue-600 hover:text-white focus:outline-none"
          >
            {gen}
          </button>
        </Link>
      ))}
    </div>
  );
}



