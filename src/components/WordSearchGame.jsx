import React, { useEffect, useMemo, useState } from "react";
import { generateGrid } from "../utils/generateGrid";
import GameBoard from "../components/GameBoard";
import WordList from "../components/WordList";
import Timer from "../components/Timer";
import { playDing } from "../utils/sound";

export default function WordSearchGame() {
  const baseWords = useMemo(
    () => ["REACT", "TAILWIND", "GRID", "CODE", "SEARCH", "HOOKS", "STATE", "ROUTER"],
    []
  );
  const size = 12;

  const [grid, setGrid] = useState([]);
  const [words, setWords] = useState(baseWords.slice(0, 6));
  const [foundWords, setFoundWords] = useState([]);
  const [foundPaths, setFoundPaths] = useState([]);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);

  useEffect(() => {
    resetPuzzle();
  }, []);

  const resetPuzzle = () => {
    const pick = shuffle([...baseWords]).slice(0, 6);
    setWords(pick);
    setGrid(generateGrid(pick, size));
    setFoundWords([]);
    setFoundPaths([]);
    setRunning(true);
    setScore(0);
  };

  const onWordFound = (word, path) => {
    setFoundWords((prev) => [...prev, word]);
    setFoundPaths((prev) => [...prev, path]);
    setScore((prev) => prev + 10); // +10 points per word
    playDing();
  };

  const allFound = foundWords.length === words.length;
  useEffect(() => {
    if (allFound) setRunning(false);
  }, [allFound]);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-700 p-6 rounded-3xl shadow-2xl overflow-hidden flex flex-col mt-20 items-center">
      <header className="w-full max-w-5xl flex items-center justify-center space-x-8 mb-6">
        <h1 className="text-4xl font-extrabold text-white animate-glow hover:scale-110 transition-transform duration-500">
          🔎 Word Search
        </h1>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-lg bg-white/20 text-white font-bold shadow">
            🏆 Score: {score}
          </div>
          <Timer running={running && !allFound} />
          <button
            onClick={resetPuzzle}
            className="px-3 py-2 rounded-xl bg-white text-indigo-700 font-bold shadow hover:shadow-md active:scale-[.98] transition"
          >
            New Puzzle
          </button>
        </div>
      </header>

      <main className="flex gap-6">
        <GameBoard
          grid={grid}
          words={words}
          foundWords={foundWords}
          foundPaths={foundPaths}
          onWordFound={onWordFound}
        />
        <WordList words={words} foundWords={foundWords} />
      </main>

      {allFound && (
        <div className="mt-6 px-4 py-3 rounded-2xl bg-white/20 text-white font-semibold backdrop-blur shadow animate-bounce">
          🎉 Nice! You found all words. Final Score: {score} 🎯
        </div>
      )}
    </div>
  );
}

// simple shuffle helper
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}