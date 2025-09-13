import React, { useMemo, useState } from "react";

export default function GameBoard({
    grid,
    words,
    foundWords,
    foundPaths,
    onWordFound,
}) {
    const rows = grid.length;
    const cols = grid[0]?.length ?? 0;

    // --- selection state
    const [start, setStart] = useState(null);      // {r,c}
    const [hover, setHover] = useState(null);      // {r,c}
    const [activePath, setActivePath] = useState([]); // [[r,c], ...]

    // quick lookup to highlight found cells
    const foundSet = useMemo(() => {
        const s = new Set();
        for (const path of foundPaths) {
            for (const [r, c] of path) s.add(key(r, c));
        }
        return s;
    }, [foundPaths]);

    function key(r, c) {
        return `${r}:${c}`;
    }

    // returns a straight line between start and end if aligned (↔ ↕ ↘ ↗); otherwise []
    function getLineCells(a, b) {
        if (!a || !b) return [];
        const dr = b.r - a.r;
        const dc = b.c - a.c;

        // alignment checks
        let stepR = 0,
            stepC = 0,
            len = 0;

        if (dr === 0 && dc !== 0) {
            stepR = 0;
            stepC = Math.sign(dc);
            len = Math.abs(dc) + 1;
        } else if (dc === 0 && dr !== 0) {
            stepR = Math.sign(dr);
            stepC = 0;
            len = Math.abs(dr) + 1;
        } else if (Math.abs(dr) === Math.abs(dc) && dr !== 0) {
            stepR = Math.sign(dr);
            stepC = Math.sign(dc);
            len = Math.abs(dr) + 1;
        } else {
            return [];
        }

        const cells = [];
        for (let i = 0; i < len; i++) {
            const r = a.r + stepR * i;
            const c = a.c + stepC * i;
            if (r < 0 || r >= rows || c < 0 || c >= cols) return []; // out of bounds
            cells.push([r, c]);
        }
        return cells;
    }

    // build the string from a path
    function lettersFromPath(path) {
        return path.map(([r, c]) => grid[r][c]).join("");
    }

    // validate the selection when mouse/touch ends
    function finalizeSelection(path) {
        if (!path.length) return;

        const forward = lettersFromPath(path);
        const backward = lettersFromPath([...path].reverse());

        // find a target word (accept either direction)
        let matched = null;
        if (words.includes(forward)) matched = forward;
        else if (words.includes(backward)) matched = backward;

        if (matched && !foundWords.includes(matched)) {
            // normalize path to match the matched direction
            const normalized =
                matched === forward ? path : [...path].reverse();
            onWordFound(matched, normalized);
        }

        // reset UI state
        setStart(null);
        setHover(null);
        setActivePath([]);
    }

    // --- Mouse handlers
    function handleMouseDown(r, c) {
        setStart({ r, c });
        setHover({ r, c });
        setActivePath([[r, c]]);
    }
    function handleMouseEnter(r, c) {
        if (!start) return;
        const p = getLineCells(start, { r, c });
        setHover({ r, c });
        setActivePath(p);
    }
    function handleMouseUp() {
        finalizeSelection(activePath);
    }

    // --- Touch handlers (basic)
    function handleTouchStart(e, r, c) {
        e.preventDefault();
        handleMouseDown(r, c);
    }
    function handleTouchMove(e) {
        if (!start) return;
        const t = e.touches[0];
        const el = document.elementFromPoint(t.clientX, t.clientY);
        if (!el) return;
        const r = Number(el.getAttribute("data-r"));
        const c = Number(el.getAttribute("data-c"));
        if (Number.isInteger(r) && Number.isInteger(c)) {
            handleMouseEnter(r, c);
        }
    }
    function handleTouchEnd() {
        handleMouseUp();
    }

    // quick set for the active path to highlight while dragging
    const activeSet = useMemo(() => {
        const s = new Set();
        for (const [r, c] of activePath) s.add(key(r, c));
        return s;
    }, [activePath]);

    return (
        <div
            className="select-none bg-white p-3 rounded-2xl shadow"
            onMouseLeave={() => {
                // cancel selection if pointer leaves the board
                setStart(null);
                setHover(null);
                setActivePath([]);
            }}
        >
            <div
                className="grid"
                style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(1.75rem, 2rem))`,
                    gap: "0.25rem",
                }}
                onMouseUp={handleMouseUp}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {grid.map((row, r) =>
                    row.map((letter, c) => {
                        const k = key(r, c);
                        const isFound = foundSet.has(k);
                        const isActive = activeSet.has(k);

                        return (
                            <div
                                key={k}
                                data-r={r}
                                data-c={c}
                                onMouseDown={() => handleMouseDown(r, c)}
                                onMouseEnter={() => handleMouseEnter(r, c)}
                                onTouchStart={(e) => handleTouchStart(e, r, c)}
                                className={[
                                    "flex items-center justify-center",
                                    "font-bold border rounded",
                                    "w-8 h-8 sm:w-9 sm:h-9",
                                    "transition-colors",
                                    isFound
                                        ? "bg-green-500 text-white border-green-500"
                                        : isActive
                                            ? "bg-yellow-300 text-indigo-900 border-yellow-300"
                                            : "text-indigo-700 border-gray-200",
                                ].join(" ")}
                            >
                                {letter}
                            </div>
                        );
                    })
                )}
            </div>
            {/* tiny hint under the grid */}
            <div className="text-xs text-gray-500 mt-2">
                drag in a straight line (↔ ↕ ↘ ↗) to select a word
            </div>
        </div>
    );
}
