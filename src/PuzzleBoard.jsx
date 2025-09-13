import React from "react";

const GRID_SIZE = 10;

export default function PuzzleBoard() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at center, #191934 60%, #5e0fae 100%)",
      }}
    >
      <div className="p-4 rounded-2xl border border-[#646479] bg-[#26263a] shadow-2xl"
        style={{
          boxShadow: "0 0 40px 10px #842fad60",
          borderWidth: "3px",
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 2.5rem)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 2.5rem)`,
            gap: "0.45rem",
            background: "none",
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-[#464665]"
              style={{
                background: "#323247",
                opacity: "0.85",
                boxShadow: "0 0 3px 0 #181828"
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
