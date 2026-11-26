import { llmsFull } from "@/lib/agent/markdown";

// Every datasheet as one Markdown file, for agents that want the full text.
export function GET() {
  return new Response(llmsFull(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
