// Places words into an NxN grid in random directions (H, V, diagonal).
// Returns the grid (2D array of letters).
export function generateGrid(words, size) {
    const grid = Array.from({ length: size }, () => Array(size).fill(""));

    const directions = [
        [0, 1],   // ➡
        [1, 0],   // ⬇
        [1, 1],   // ⬇➡
        [-1, 1],  // ⬆➡
    ];

    function canPlace(word, r, c, dr, dc) {
        for (let i = 0; i < word.length; i++) {
            const nr = r + dr * i;
            const nc = c + dc * i;
            if (nr < 0 || nr >= size || nc < 0 || nc >= size) return false;
            const cell = grid[nr][nc];
            if (cell !== "" && cell !== word[i]) return false;
        }
        return true;
    }

    function place(word) {
        let placed = false;
        let guard = 0;
        while (!placed && guard < 2000) {
            guard++;
            const r = Math.floor(Math.random() * size);
            const c = Math.floor(Math.random() * size);
            const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];
            if (!canPlace(word, r, c, dr, dc)) continue;
            for (let i = 0; i < word.length; i++) {
                grid[r + dr * i][c + dc * i] = word[i];
            }
            placed = true;
        }
    }

    words.forEach(w => place(w));

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (!grid[r][c]) {
                grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
    return grid;
}
