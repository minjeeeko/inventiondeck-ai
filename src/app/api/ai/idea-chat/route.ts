import { NextRequest } from "next/server";
import { ideaChat } from "@/lib/gemini";
import { IdeaChatRequest } from "@/types/api";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as IdeaChatRequest;

  try {
    const stream = await ideaChat(body);
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
