import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@components": path.resolve(
                import.meta.dirname,
                "./src/components/",
            ),
            "@lib": path.resolve(import.meta.dirname, "./src/lib/"),
        },
    },
});
