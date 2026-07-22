import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Bloodlust & Harmony palette. Dark editorial fantasy: near-black
        // night, parchment ink, ONE crimson accent (the "bloodlust"), and a
        // muted gold reserved for costs/economy (the "harmony"). Keep the
        // discipline: crimson for CTAs and emphasis only.
        bh: {
          night: "#0c0a10",      // page background
          panel: "#15121c",      // card / panel surfaces
          ink: "#e9e4d8",        // primary text (warm parchment)
          mute: "#8d8798",       // captions, meta
          rule: "#282334",       // hairline rules and borders
          blood: "#c22d36",      // primary accent
          bloodInk: "#8f1f27",   // hover / pressed accent
          gold: "#c9a860",       // economy / cost highlights
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-cinzel)", "serif"],
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  plugins: [],
};

export default config;
