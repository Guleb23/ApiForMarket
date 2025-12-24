import defaultTheme from "tailwindcss/defaultTheme"

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}"
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#f6f5ff",
                    100: "#eeebff",
                    200: "#ddd6fe",
                    300: "#c4b5fd",
                    400: "#a78bfa",
                    500: "#8b5cf6",
                    600: "#7c3aed",
                    700: "#6d28d9",
                },
                bg: "#fafaff",
                surface: "#ffffff",
                muted: "#6b7280",
            },
            fontFamily: {
                sans: ["Inter", ...defaultTheme.fontFamily.sans],
            },
            boxShadow: {
                soft: "0 10px 30px rgba(139,92,246,0.15)",
            },
            borderRadius: {
                xl: "14px",
                "2xl": "18px",
            },
        }
    },
    plugins: [],
}
