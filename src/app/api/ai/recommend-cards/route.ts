import { NextRequest, NextResponse } from "next/server";
import { recommendCards } from "@/lib/gemini";
import { Card } from "@/types";

export async function POST(req: NextRequest) {
  const { keyword, allCards, selectedIds } = await req.json() as {
    keyword: string;
    allCards: Card[];
    selectedIds: string[];
  };

  const candidates = allCards.filter((c) => !selectedIds.includes(c.id));

  try {
    const recommendedIds = await recommendCards(keyword, candidates);
    return NextResponse.json({ recommendedIds });
  } catch {
    // fallback: 카테고리 균형 무작위 선택
    const cats = ["target", "technology", "trend", "revenue", "feature", "industry"];
    const fallback = cats
      .slice(0, 4)
      .map((cat) => candidates.find((c) => c.category === cat)?.id)
      .filter(Boolean) as string[];
    return NextResponse.json({ recommendedIds: fallback });
  }
}
