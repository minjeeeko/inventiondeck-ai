import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SHEET_NAMES = ["Theme", "Target", "Trend", "Tech", "Feature", "Revenue"] as const;

const SHEET_CATEGORY_MAP: Record<string, string> = {
  Theme: "industry",
  Target: "target",
  Trend: "trend",
  Tech: "technology",
  Feature: "feature",
  Revenue: "revenue",
};

interface SheetRow {
  id: string;
  category: string;
  title: string;
  description: string | null;
  tags: string[];
  popularity: number;
  synced_at: string;
}

async function fetchSheet(sheetName: string, apiKey: string, sheetId: string): Promise<SheetRow[]> {
  const range = encodeURIComponent(`${sheetName}!A2:E`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheets API error for ${sheetName}: ${res.status}`);

  const json = await res.json();
  const rows: string[][] = json.values ?? [];
  const category = SHEET_CATEGORY_MAP[sheetName];

  return rows
    .filter((row) => row[1]?.trim())
    .map((row, i) => ({
      id: `${category}-${String(i + 1).padStart(4, "0")}`,
      category,
      title: row[1]?.trim() ?? "",
      description: [row[2], row[3], row[4]].filter(Boolean).join("\n\n") || null,
      tags: [],
      popularity: 0,
      synced_at: new Date().toISOString(),
    }));
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const sheetId = process.env.GOOGLE_SHEETS_ID;

  if (!apiKey || !sheetId) {
    return NextResponse.json({ error: "Google Sheets 환경변수가 설정되지 않았습니다." }, { status: 500 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  let totalSynced = 0;
  const errors: string[] = [];

  for (const sheetName of SHEET_NAMES) {
    try {
      const rows = await fetchSheet(sheetName, apiKey, sheetId);

      // 500장 배치 단위 upsert
      const BATCH = 500;
      for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH);
        const { error } = await supabase.from("cards").upsert(batch, { onConflict: "id" });
        if (error) throw new Error(error.message);
      }

      totalSynced += rows.length;
    } catch (err) {
      errors.push(`${sheetName}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({
    synced: totalSynced,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString(),
  });
}
