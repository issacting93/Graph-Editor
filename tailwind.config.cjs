/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./graph-editor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "cyber-red": "#FF3A30",
        "cyber-blue": "#00F0FF",
        "cyber-pink": "#FF00FF",
        "cyber-green": "#00FF00",
        "cyber-yellow": "#eab308",
        "cyber-dark": "#0A0A0A",
        "cyber-dark-800": "#12141c",
        "cyber-dark-900": "#0a0c12",
        "cyber-muted": "#4A4A4A",
        "cyber-blue-bright": "#60a5fa",
      },
      boxShadow: {
        "cyber-glow-red": "0 0 10px #FF3A30, 0 0 20px #FF3A30",
        "cyber-glow-blue": "0 0 10px #00F0FF, 0 0 20px #00F0FF",
        "cyber-glow-pink": "0 0 10px #FF00FF, 0 0 20px #FF00FF",
        "cyber-glow-green": "0 0 10px #00FF00, 0 0 20px #00FF00",
        "neon-blue":
          "0 0 5px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)",
        "neon-red":
          "0 0 5px rgba(239, 68, 68, 0.5), 0 0 20px rgba(239, 68, 68, 0.3)",
        "neon-green":
          "0 0 5px rgba(34, 197, 94, 0.5), 0 0 20px rgba(34, 197, 94, 0.3)",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', "monospace"],
        sans: [
          '"Share Tech Mono"',
          '"IBM Plex Mono"',
          '"Courier New"',
          "monospace",
        ],
      },
      backgroundImage: {
        "cyber-gradient-active":
          "linear-gradient(135deg, #FF3A30 0%, #FF3A30 100%)",
        "cyber-gradient-inactive":
          "linear-gradient(135deg, #4A4A4A 0%, #4A4A4A 100%)",
        "cyber-gradient-pending":
          "linear-gradient(135deg, #00F0FF 0%, #00F0FF 100%)",
        "cyber-gradient-completed":
          "linear-gradient(135deg, #00FF00 0%, #00FF00 100%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": {
            boxShadow:
              "0 0 5px rgba(59, 130, 246, 0.5), 0 0 10px rgba(59, 130, 246, 0.3)",
          },
          "100%": {
            boxShadow:
              "0 0 10px rgba(59, 130, 246, 0.7), 0 0 20px rgba(59, 130, 246, 0.5)",
          },
        },
      },
    },
  },
  plugins: [],
};
