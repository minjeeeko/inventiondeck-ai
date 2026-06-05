import { NextRequest } from "next/server";
import { generateDocument } from "@/lib/gemini";
import { GenerateDocumentRequest } from "@/types/api";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as GenerateDocumentRequest;

  try {
    const stream = await generateDocument(body);
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
