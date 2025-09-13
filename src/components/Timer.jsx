import React, { useEffect, useState } from "react";

export default function Timer({ running }) {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        if (!running) return;
        const interval = setInterval(() => {
            setSeconds((s) => s + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [running]);

    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");

    return (
        <div className="px-3 py-1 rounded-lg bg-white text-indigo-700 font-bold shadow">
            ⏱ {mins}:{secs}
        </div>
    );
}
