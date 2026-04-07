// Netlify serverless function — proxies requests to Anthropic API
// Set ANTHROPIC_API_KEY in Netlify dashboard → Site settings → Environment variables
export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type" } });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST required" }), { status: 405 });
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
  try {
    const body = await req.json();
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Proxy error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
export const config = { path: "/api/anthropic" };
