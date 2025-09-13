import React from "react";

const Navbar = ({ game, setGame }) => {
  return (
    <div className="flex justify-center gap-4 p-4 bg-gray-100 shadow-md">
      <button
        onClick={() => setGame("flappy")}
        className={`px-4 py-2 rounded ${
          game === "flappy" ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
        }`}
      >
        Flappy Bird
      </button>
      <button
        onClick={() => setGame("block")}
        className={`px-4 py-2 rounded ${
          game === "block" ? "bg-green-600 text-white" : "bg-green-500 text-white"
        }`}
      >
        Block Puzzle
      </button>
      <button
        onClick={() => setGame("word")}
        className={`px-4 py-2 rounded ${
          game === "word" ? "bg-purple-600 text-white" : "bg-purple-500 text-white"
        }`}
      >
        Word Search
      </button>
    </div>
  );
};

export default Navbar;
