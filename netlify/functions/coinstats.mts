import type { Config } from "@netlify/functions";
import { handleApiRequest } from "../../server/proxy-core.ts";

export default async (req: Request): Promise<Response> => {
  if (req.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  const url = new URL(req.url);
  const result = await handleApiRequest(
    url.pathname,
    url.searchParams,
    process.env.COINSTATS_API_KEY,
  );
  return new Response(result.body, { status: result.status, headers: result.headers });
};

export const config: Config = { path: "/api/*" };
