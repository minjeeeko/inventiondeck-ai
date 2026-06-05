import { NextRequest } from "next/server";
import { rewriteField } from "@/lib/gemini";
import { RewriteFieldRequest } from "@/types/api";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as RewriteFieldRequest;

  try {
    const stream = await rewriteField(body);
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
