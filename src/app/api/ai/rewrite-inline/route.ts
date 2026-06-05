import { NextRequest } from "next/server";
import { rewriteInline } from "@/lib/gemini";
import { RewriteInlineRequest } from "@/types/api";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as RewriteInlineRequest;

  try {
    const stream = await rewriteInline(body);
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
