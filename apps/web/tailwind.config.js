/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "border-beam": {
                    "100%": {
                        "offset-distance": "100%",
                    },
                },
                "confetti": {
                    "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
                    "100%": { transform: "translateY(100vh) rotate(720deg)", opacity: "0" },
                },
                "fade-up": {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                }
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
                "confetti": "confetti 3s ease-out forwards",
                "fade-up": "fade-up 0.5s ease-out forwards",
            },
        },
    },
    plugins: [],
}
