import { defineConfig } from "vite";

export default defineConfig({
  root: "public", // Tells Vite to look for index.html inside the public folder
  server: {
    port: 5173, // Vite will run your frontend UI here
    proxy: {
      // Automatically forward AI stream and tool requests to Express (Port 3000)
      "/sse": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/messages": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
