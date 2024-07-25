import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import fs from "fs";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react({ tsDecorators: true }), svgr()],
    server: {
        host: true,
        port: 8443,
        https: {
            key: fs.readFileSync("./ssl/key.key"),
            cert: fs.readFileSync("./ssl/certificate.pem"),
        },
    },
    resolve: {
        alias: {
            "@shared": path.resolve(__dirname, "../shared"), // указывает на папку 'shared' в корне вашего проекта
        },
    },
});
