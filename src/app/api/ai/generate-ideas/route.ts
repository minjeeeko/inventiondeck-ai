import { NextRequest } from "next/server";
import { generateIdeas } from "@/lib/gemini";
import { GenerateIdeasRequest } from "@/types/api";

export async function POST(req: NextRequest) {
  const { cards } = (await req.json()) as GenerateIdeasRequest;

  try {
    const stream = await generateIdeas(cards);
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" },
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
