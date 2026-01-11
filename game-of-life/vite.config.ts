import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      GameOfLifeModule: path.resolve(__dirname, "./GameOfLifeModule.js"),
    },
  },
});
