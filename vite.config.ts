import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/project3/",
  plugins: [react()],
  server: { open: true },
});
