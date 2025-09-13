import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Button from "./components/Button";
import RefreshButton from "./components/RefreshButton";

const GRID_SIZE = 10;
const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"]; 

const BLOCK_SHAPES = [
  {width: 1,height: 1},
  {width: 2,height: 1},
  {width: 1,height: 2 },
  {width: 2,height: 2 },
  {width: 3,height:1},
  {width: 3,height:2},
];

let lastColors = [];
const getSmartColor = () => {
  if (lastColors.length > 0 && Math.random() < 0.8) {
    return lastColors[Math.floor(Math.random() * lastColors.length)];
  }
  const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  lastColors.push(newColor);
  if (lastColors.length > 3) lastColors.shift();
  return newColor;
};

const BlockPuzzleGame = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [grid, setGrid] = useState(() => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill("")));
  const [currentBlocks, setCurrentBlocks] = useState([]);
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [previewPosition, setPreviewPosition] = useState(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });

  const audioRef = useRef(null);
  const gridRef = useRef(null);
  const audioContextRef = useRef(null);

  // Detect mobile device
  useEffect(() => {
    const checkIsMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Init audio context
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.log("AudioContext not supported");
      }
    }
  }, []);

  const playSound = useCallback((frequency, duration = 200, type = "sine", volume = 0.15) => {
    if (!isPlaying || !audioContextRef.current) return;
    try {
      if (audioContextRef.current.state === "suspended") audioContextRef.current.resume();
      const osc = audioContextRef.current.createOscillator();
      const gain = audioContextRef.current.createGain();
      osc.connect(gain);
      gain.connect(audioContextRef.current.destination);
      osc.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      osc.type = type;
      gain.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration / 1000);
      osc.start();
      osc.stop(audioContextRef.current.currentTime + duration / 1000);
    } catch (e) {
      console.log("Audio playback failed:", e);
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.25;
      audio.play().catch(() => setIsPlaying(false));
    }
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => { initAudio(); }, [initAudio]);

  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      playSound(392, 200, "sine", 0.2);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
        playSound(523.25, 300, "sine", 0.2);
      }).catch(() => setIsPlaying(false));
    }
  };

  const generateRandomBlock = () => {
    const shape = BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)];
    const color = getSmartColor();
    return {
      id: Date.now() + Math.random(),
      width: shape.width,
      height: shape.height,
      color,
      cells: Array(shape.height).fill(null).map(() => Array(shape.width).fill(color)),
    };
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill("")));
    lastColors = [];
    setCurrentBlocks([generateRandomBlock(), generateRandomBlock(), generateRandomBlock()]);
    playSound(523.25, 400, "triangle", 0.3);
  };

  const canPlaceBlock = (block, row, col) => {
    if (!block) return false;
    if (row < 0 || col < 0 || row + block.height > GRID_SIZE || col + block.width > GRID_SIZE) return false;
    for (let r = 0; r < block.height; r++) {
      for (let c = 0; c < block.width; c++) {
        if (grid[row + r][col + c] !== "") return false;
      }
    }
    return true;
  };

  const placeBlock = useCallback((block, row, col) => {
    if (!block) return;
    playSound(349.23, 200, "square", 0.2);
    setGrid(prev => {
      const next = prev.map(r => [...r]);
      for (let r = 0; r < block.height; r++) {
        for (let c = 0; c < block.width; c++) {
          next[row + r][col + c] = block.color;
        }
      }
      return next;
    });

    setCurrentBlocks(prev => {
      const remaining = prev.filter(b => b.id !== block.id);
      // always keep 3 choices available
      return [...remaining, generateRandomBlock()];
    });

    setTimeout(() => checkCompletedRows(), 120);
  }, [playSound]);

  const checkCompletedRows = useCallback(() => {
    setGrid(current => {
      let temp = current.map(r => [...r]);
      const completed = [];

      for (let r = 0; r < GRID_SIZE; r++) {
        const row = temp[r];
        const color = row[0];
        if (color !== "" && row.every(cell => cell === color)) {
          completed.push(r);
        }
      }

      if (completed.length > 0) {
        playSound(659.25, 600, "sawtooth", 0.3);
        completed.forEach(idx => { temp[idx] = Array(GRID_SIZE).fill("#ffffff"); });
        setTimeout(() => {
          setGrid(prev => {
            const after = prev.map(r => [...r]);
            completed.sort((a, b) => b - a).forEach(idx => {
              after.splice(idx, 1);
              after.unshift(Array(GRID_SIZE).fill(""));
            });
            return after;
          });
          setScore(s => s + completed.length * 100);
        }, 450);
      }

      return temp;
    });
  }, [playSound]);

  const canPlaceAnyBlock = useCallback(() => {
    for (const block of currentBlocks) {
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (canPlaceBlock(block, r, c)) return true;
        }
      }
    }
    return false;
  }, [currentBlocks, grid]);

  useEffect(() => {
    if (gameStarted && !gameOver && currentBlocks.length > 0) {
      if (!canPlaceAnyBlock()) {
        setGameOver(true);
        playSound(220, 1200, "sawtooth", 0.35);
        if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
      }
    }
  }, [currentBlocks, gameStarted, gameOver, canPlaceAnyBlock, playSound]);

  // Better grid position (matches the CSS cell size & gap used below)
  const getGridPosition = useCallback((clientX, clientY) => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const cellSize = 40; 
    const gap = 7.2;
    const padding = 16;
    const relativeX = clientX - rect.left - padding;
    const relativeY = clientY - rect.top - padding;
    const col = Math.round((relativeX - gap / 2) / (cellSize + gap));
    const row = Math.round((relativeY - gap / 2) / (cellSize + gap));
    const clampedCol = Math.max(0, Math.min(GRID_SIZE - 1, col));
    const clampedRow = Math.max(0, Math.min(GRID_SIZE - 1, row));
    return { row: clampedRow, col: clampedCol };
  }, []);

  const handleStart = useCallback((e, block) => {
    if (!gameStarted || gameOver || isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;
    setDragStartPos({ x: offsetX, y: offsetY });
    setDraggedBlock(block);
    setIsDragging(true);
    setDragPosition({ x: clientX - offsetX, y: clientY - offsetY });
    playSound(330, 120, "triangle", 0.2);
  }, [gameStarted, gameOver, isDragging, playSound]);

  const handleMove = useCallback((e) => {
    if (!isDragging || !draggedBlock) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragPosition({ x: clientX - dragStartPos.x, y: clientY - dragStartPos.y });
    const gridPos = getGridPosition(clientX, clientY);
    if (
      gridPos &&
      gridPos.row + draggedBlock.height <= GRID_SIZE &&
      gridPos.col + draggedBlock.width <= GRID_SIZE &&
      canPlaceBlock(draggedBlock, gridPos.row, gridPos.col)
    ) {
      setPreviewPosition(gridPos);
    } else {
      setPreviewPosition(null);
    }
  }, [isDragging, draggedBlock, dragStartPos, getGridPosition]);

  const handleEnd = useCallback((e) => {
    if (!isDragging || !draggedBlock) return;
    e.preventDefault();
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const blockToPlace = { ...draggedBlock };

    if (previewPosition && canPlaceBlock(blockToPlace, previewPosition.row, previewPosition.col)) {
      placeBlock(blockToPlace, previewPosition.row, previewPosition.col);
    } else {
      const gridPos = getGridPosition(clientX, clientY);
      let placed = false;
      if (gridPos) {
        for (let dR = -1; dR <= 1 && !placed; dR++) {
          for (let dC = -1; dC <= 1 && !placed; dC++) {
            const r = gridPos.row + dR;
            const c = gridPos.col + dC;
            if (r >= 0 && c >= 0 && r + blockToPlace.height <= GRID_SIZE && c + blockToPlace.width <= GRID_SIZE && canPlaceBlock(blockToPlace, r, c)) {
              placeBlock(blockToPlace, r, c);
              placed = true;
            }
          }
        }
      }
      if (!placed) playSound(200, 250, "sawtooth", 0.2);
    }

    setDraggedBlock(null);
    setIsDragging(false);
    setPreviewPosition(null);
  }, [isDragging, draggedBlock, previewPosition, getGridPosition, placeBlock, playSound]);

  useEffect(() => {
    if (!isDragging) return;
    const move = (e) => handleMove(e);
    const end = (e) => handleEnd(e);
    document.addEventListener("mousemove", move, { passive: false });
    document.addEventListener("mouseup", end, { passive: false });
    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("touchend", end, { passive: false });
    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", end);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", end);
    };
  }, [isDragging, handleMove, handleEnd]);

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill("")));
    setCurrentBlocks([]);
    setDraggedBlock(null);
    setIsDragging(false);
    setPreviewPosition(null);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
    playSound(261.63, 300, "sine", 0.2);
  };

  return (
    <section className="min-h-screen grid place-items-center mt-22 rounded-3xl shadow-2xl overflow-hidden relative p-6" style={{ background: "#0b0b12" }}>
      {isPlaying && gameStarted && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 blur-3xl z-0"
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.3, 0.6] }}
          transition={{ repeat: Infinity, duration: 3 }}
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="text-center mt-40">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Block Puzzle</h1>

          {gameStarted && (
            <div className="flex items-center gap-6 mb-4">
              <div className="text-2xl font-bold text-yellow-400">Score: {score}</div>

              <motion.button
                onClick={handlePlay}
                whileTap={{ scale: 0.9 }}
                animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
                transition={{ repeat: isPlaying ? Infinity : 0, duration: 1.2 }}
                className="px-4 py-2 text-white/90 rounded-lg bg-white/10 ring-1 ring-white/20 hover:bg-white/20 transition-all duration-300"
              >
                {isPlaying ? "Stop Music" : "Play Music"}
              </motion.button>

              <button onClick={resetGame} className=""><RefreshButton/></button>
            </div>
          )}
        </div>

        {!gameStarted ? (
          <div className="flex flex-col items-center space-y-8">
            <motion.button
              onClick={startGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className=""
            >
           <Button/>
            </motion.button>

            <div className="text-center text-gray-300 max-w-lg space-y-4">
              <p className="text-xl">🎯 Fill complete <b>rows</b> with matching colors!</p>
              <div className="text-sm space-y-2 bg-white/5 p-6 rounded-lg border border-white/10">
                <p>• <b>Drag blocks</b> to fill the grid</p>
                <p>• <b>Complete row</b>: +100 points</p>
                <p>• <b>Smart colors</b> make matching easier</p>
                <p>• <b>Game over</b> when no blocks fit</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Board */}
            <div className=" flex p-4 rounded-2xl border-2 bg-[#26263a] shadow-2xl" style={{ borderColor: "#646479", boxShadow: "0 0 40px 10px #842fad60" }}>
              <div
                ref={gridRef}
                className="grid gap-[0.45rem] relative"
                style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 2.5rem)`, gridTemplateRows: `repeat(${GRID_SIZE}, 2.5rem)` }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isPreview =
                      previewPosition &&
                      rowIndex >= previewPosition.row &&
                      rowIndex < previewPosition.row + (draggedBlock?.height || 0) &&
                      colIndex >= previewPosition.col &&
                      colIndex < previewPosition.col + (draggedBlock?.width || 0);

                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className="rounded-lg border transition-all duration-200"
                        style={{
                          background: cell === "#ffffff" ? "#ffffff" : cell || (isPreview ? "#22d3ee" : "#323247"),
                          borderColor: cell === "#ffffff" ? "#ffffff" : isPreview ? "#0891b2" : "#464665",
                          borderWidth: isPreview ? 2 : 1,
                          opacity: cell === "#ffffff" ? 1 : isPreview ? 0.9 : 0.85,
                          boxShadow:
                            cell === "#ffffff"
                              ? "0 0 20px #ffffff, 0 0 40px #ffffff"
                              : isPreview
                              ? "0 0 15px #22d3ee, inset 0 0 10px #0891b2"
                              : "0 0 3px 0 #181828",
                          transform: isPreview ? "scale(1.08)" : "scale(1)",
                          animation: cell === "#ffffff" ? "pulse 0.5s ease-in-out" : "none",
                          zIndex: isPreview ? 10 : 1,
                        }}
                      />
                    );
                  })
                )}

                {/* Overlay showing valid drop zones */}
                {isDragging && (
                  <div
                    className="absolute inset-0 pointer-events-none grid gap-[0.45rem]"
                    style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 2.5rem)`, gridTemplateRows: `repeat(${GRID_SIZE}, 2.5rem)` }}
                  >
                    {Array(GRID_SIZE * GRID_SIZE)
                      .fill(null)
                      .map((_, index) => {
                        const row = Math.floor(index / GRID_SIZE);
                        const col = index % GRID_SIZE;
                        const ok = draggedBlock && canPlaceBlock(draggedBlock, row, col);
                        return (
                          <div
                            key={index}
                            className={`rounded-lg border-2 transition-all duration-150 ${ok ? "border-green-400 bg-green-400/20" : "border-red-400/30 bg-red-400/10"}`}
                            style={{ opacity: ok ? 0.6 : 0.18, zIndex: 5 }}
                          />
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            {/* Current Blocks */}
            <div className={`flex gap-8 mt-6 ${isMobile ? "flex-col" : "flex-row"}`}>
              {currentBlocks.map((block) => (
                <motion.div
                  key={block.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className={`p-3 bg-[#26263a] rounded-xl border border-[#646479] transition-all duration-300 ${
                    draggedBlock?.id === block.id ? "opacity-50 scale-95" : "opacity-100 hover:scale-110 cursor-grab hover:shadow-xl hover:border-blue-400"
                  }`}
                  onMouseDown={(e) => handleStart(e, block)}
                  onTouchStart={(e) => handleStart(e, block)}
                  style={{ pointerEvents: draggedBlock?.id === block.id ? "none" : "auto", boxShadow: draggedBlock?.id === block.id ? "none" : "0 0 20px 5px #842fad40", touchAction: "none" }}
                >
                  <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${block.width}, 1.5rem)`, gridTemplateRows: `repeat(${block.height}, 1.5rem)` }}>
                    {block.cells.map((row, r) =>
                      row.map((cell, c) => (
                        <div
                          key={`${r}-${c}`}
                          className="rounded border"
                          style={{
                            background: cell,
                            borderColor: cell,
                            boxShadow: "0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.2)",
                          }}
                        />
                      ))
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Tips */}
            <div className="text-center text-gray-300 mt-4">
              <p className="text-sm bg-white/5 p-3 rounded-lg border border-white/10">
                <b>Complete rows with the same color</b> • <b>+100 points</b> per row • <b>Smart colors</b>
              </p>
            </div>
          </>
        )}

        {/* Drag Ghost */}
        {draggedBlock && isDragging && (
          <div className="fixed pointer-events-none z-50" style={{ left: dragPosition.x, top: dragPosition.y, transform: "scale(1.3)" }}>
            <div
              className="grid gap-1 p-3 bg-[#26263a] rounded-xl border-2 border-cyan-400 shadow-2xl"
              style={{ gridTemplateColumns: `repeat(${draggedBlock.width}, 1.5rem)`, gridTemplateRows: `repeat(${draggedBlock.height}, 1.5rem)`, boxShadow: "0 15px 30px rgba(0,0,0,0.8), 0 0 20px rgba(6, 182, 212, 0.6)" }}
            >
              {draggedBlock.cells.map((row, r) =>
                row.map((cell, c) => (
                  <div key={`${r}-${c}`} className="rounded border-2 border-cyan-300" style={{ background: cell, boxShadow: "0 4px 8px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.3)" }} />
                ))
              )}
            </div>
          </div>
        )}

        {/* Game Over */}
        {gameOver && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-[#26263a] p-8 rounded-2xl border-2 border-red-500 shadow-2xl text-center">
              <div className="text-6xl mb-4">💀</div>
              <h2 className="text-3xl font-bold text-red-400 mb-4">Game Over!</h2>
              <p className="text-xl mb-6">Final Score: <span className="text-yellow-400 font-bold">{score}</span></p>
              <motion.button onClick={resetGame} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 px-8 py-4 rounded-xl text-xl font-bold transition-all duration-300 shadow-lg">🔄 Play Again</motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Audio element */}
      <audio ref={audioRef} src="/backgroundMusic.mp3" preload="auto" loop />
    </section>
  );
};

export default BlockPuzzleGame;
