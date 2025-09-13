import React from "react";

export default function WordList({ words, foundWords }) {
    return (
        <div className="bg-white p-4 rounded-2xl shadow w-full md:w-52">
            <h2 className="font-bold mb-2 text-indigo-700">Words</h2>
            <ul className="space-y-1">
                {words.map((word) => (
                    <li
                        key={word}
                        className={`${foundWords.includes(word)
                                ? "line-through text-gray-400"
                                : "text-indigo-800"
                            } font-medium`}
                    >
                        {word}
                    </li>
                ))}
            </ul>
        </div>
    );
}
