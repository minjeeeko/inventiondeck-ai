import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface CardRef {
  id: string;
  category: string;
  title: string;
}

export async function POST(req: NextRequest) {
  const { keyword, allCards, selectedIds } = await req.json() as {
    keyword: string;
    allCards: CardRef[];
    selectedIds: string[];
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const cardList = allCards
    .filter((c) => !selectedIds.includes(c.id))
    .slice(0, 200)
    .map((c) => `${c.id} | ${c.category} | ${c.title}`)
    .join("\n");

  const prompt = `
사용자 관심사: "${keyword}"

아래 카드 목록 중 관심사에 적합한 카드를 3~6개 추천해줘.
반드시 여러 카테고리를 균형 있게 포함해야 해 (동일 카테고리 최대 2개).

카드 목록 (id | category | title):
${cardList}

응답은 반드시 JSON 형식으로만 답해줘:
{"recommendedIds": ["id1", "id2", "id3"]}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON 파싱 실패");
    const parsed = JSON.parse(jsonMatch[0]) as { recommendedIds: string[] };
    return NextResponse.json(parsed);
  } catch {
    // Gemini 실패 시 무작위 fallback (카테고리 균형 고려)
    const categories = ["target", "technology", "trend", "revenue", "feature", "industry"];
    const fallback: string[] = [];
    for (const cat of categories.slice(0, 4)) {
      const candidate = allCards.find((c) => c.category === cat && !selectedIds.includes(c.id));
      if (candidate) fallback.push(candidate.id);
    }
    return NextResponse.json({ recommendedIds: fallback });
  }
}
