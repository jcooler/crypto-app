import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { handleApiRequest } from "./server/proxy-core.ts";

// Dev/preview equivalent of netlify/functions/coinstats.mts — same shared
// proxy core, key injected from .env (COINSTATS_API_KEY, not VITE_-prefixed,
// so it can never end up in the client bundle).
const apiProxy = (apiKey: string | undefined): Plugin => {
  const handler = async (
    req: import("node:http").IncomingMessage,
    res: import("node:http").ServerResponse,
    next: () => void,
  ) => {
    if (!req.url?.startsWith("/api/")) return next();
    const url = new URL(req.url, "http://localhost");
    const result = await handleApiRequest(url.pathname, url.searchParams, apiKey);
    res.writeHead(result.status, result.headers);
    res.end(result.body);
  };
  return {
    name: "qv-api-proxy",
    configureServer: (server) => void server.middlewares.use(handler),
    configurePreviewServer: (server) => void server.middlewares.use(handler),
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), apiProxy(env.COINSTATS_API_KEY)],
  };
});
