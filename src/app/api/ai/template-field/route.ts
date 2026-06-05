import { NextRequest } from "next/server";
import { generateTemplateField } from "@/lib/gemini";
import { TemplateFieldRequest } from "@/types/api";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as TemplateFieldRequest;

  try {
    const stream = await generateTemplateField(body);
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
