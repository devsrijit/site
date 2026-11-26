import { llmsIndex } from "@/lib/agent/markdown";

// The llms.txt index for AI agents (https://llmstxt.org).
export function GET() {
  return new Response(llmsIndex(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
