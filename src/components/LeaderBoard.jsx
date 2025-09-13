import React from "react";

export default function Leaderboard({ scores }) {
    if (!scores.length) return null;

    return (
        <div className="bg-white p-4 rounded-2xl shadow w-full md:w-52">
            <h2 className="font-bold mb-2 text-indigo-700">🏆 Leaderboard</h2>
            <ol className="space-y-1 list-decimal list-inside">
                {scores.map((s, i) => (
                    <li key={i} className="text-indigo-800 font-medium">
                        {s.score} pts — <span className="text-sm text-gray-500">{s.date}</span>
                    </li>
                ))}
            </ol>
        </div>
    );
}
