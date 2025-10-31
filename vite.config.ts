import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

// 自定義插件：處理 HTML 中的環境變數替換
function htmlEnvReplace(): Plugin {
  return {
    name: "html-env-replace",
    transformIndexHtml(html) {
      // 替換環境變數，如果未設置則使用默認值
      const logoUrl = process.env.VITE_APP_LOGO || "/aijob-logo.png";
      const analyticsEndpoint = process.env.VITE_ANALYTICS_ENDPOINT || "";
      const analyticsWebsiteId = process.env.VITE_ANALYTICS_WEBSITE_ID || "";
      
      return html
        .replace(/%VITE_APP_LOGO%/g, logoUrl)
        .replace(/%VITE_ANALYTICS_ENDPOINT%/g, analyticsEndpoint)
        .replace(/%VITE_ANALYTICS_WEBSITE_ID%/g, analyticsWebsiteId);
    },
  };
}

const plugins = [
  react(),
  tailwindcss(),
  jsxLocPlugin(),
  vitePluginManusRuntime(),
  htmlEnvReplace(),
];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
