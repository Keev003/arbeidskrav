import { defineConfig } from "vite";

export default defineConfig({
    base: "/arbeidskrav",
    server: {
        proxy: {
            "/arbeidskrav/api": "http://localhost:3000",
        },
    },
});