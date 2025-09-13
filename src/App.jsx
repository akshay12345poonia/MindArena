import React, { useState } from "react";
import BlockPuzzleGame from "./BlockPuzzleGame";
import FlappyBird from "./components/FlappyBird";
import WordSearchGame from "./components/WordSearchGame";
import Navbar from "./components/Navbar";

function App() {
  const [game, setGame] = useState("flappy");

  return (
    <div className="w-screen h-screen flex flex-col bg-white">
      {/* Pass props to Navbar */}
      <Navbar game={game} setGame={setGame} />

      <div className="flex-1 flex items-center justify-center overflow-auto bg-white">
        {game === "flappy" && <FlappyBird />}
        {game === "block" && <BlockPuzzleGame />}
        {game === "word" && <WordSearchGame className="mb-20" />}
      </div>
    </div>
  );
}

export default App;
