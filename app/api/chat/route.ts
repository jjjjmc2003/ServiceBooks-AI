import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your_api_key_here") {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const { messages, systemContext } = await req.json();

  const stream = client.messages.stream({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    system: `You are an expert restaurant accountant and financial analyst. You have access to real financial data for a full-service restaurant for the period ending March 2, 2026. Answer questions concisely with specific numbers. When relevant, cite industry benchmarks for full-service restaurants (food cost: 28–35%, labor: 28–35%, prime cost: 55–65%). Keep responses focused and practical — this is a working tool, not a report.

${systemContext}`,
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
