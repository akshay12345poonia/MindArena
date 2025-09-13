/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            keyframes: {
                gradient: {
                    "0%, 100%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                },
                glow: {
                    "0%, 100%": {
                        textShadow:
                            "0 0 10px #fff, 0 0 20px #ff00ff, 0 0 40px #ff00ff",
                    },
                    "50%": {
                        textShadow:
                            "0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 80px #00ffff",
                    },
                },
            },
            animation: {
                gradient: "gradient 8s ease infinite",
                glow: "glow 2s ease-in-out infinite alternate",
            },
        },
    },
    plugins: [],
};
