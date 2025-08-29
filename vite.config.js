import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:7300", // ton backend
        changeOrigin: true,
        // Si ton backend n’a PAS le préfixe /api, décommente la ligne suivante :
        // rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
