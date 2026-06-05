"use client";

import { EditableField } from "./EditableField";
import { IdeaItem } from "@/types/api";
import { Card } from "@/types";

interface Props {
  data: Record<string, string>;
  idea: IdeaItem;
  cards: Card[];
  onChange: (key: string, value: string) => void;
}

const SECTIONS = [
  {
    key: "origin_story",
    label: "창업 계기 (Origin Story)",
    placeholder: "왜 이 문제를 해결하려 하는가? 창업자의 개인적 연결고리",
    rows: 5,
  },
  {
    key: "market_opportunity",
    label: "시장 기회",
    placeholder: "TAM/SAM/SOM, 시장 성장률, 타이밍이 왜 지금인가",
    rows: 5,
  },
  {
    key: "go_to_market",
    label: "시장 진입 전략",
    placeholder: "첫 100명의 고객을 어떻게 확보할 것인가, 초기 채널 전략",
    rows: 5,
  },
  {
    key: "competitive_moat",
    label: "경쟁 해자 (Competitive Moat)",
    placeholder: "12개월 후 경쟁자가 따라오기 어려운 이유",
    rows: 5,
  },
  {
    key: "vision",
    label: "3년 비전",
    placeholder: "3년 후 이 회사는 어떤 모습인가? 어떤 세상을 만들고 있는가",
    rows: 5,
  },
];

export function BusinessModelNarrativesTemplate({ data, idea, cards, onChange }: Props) {
  return (
    <div className="space-y-8">
      {SECTIONS.map((s, i) => (
        <div key={s.key} className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {i + 1}
            </span>
            <span className="font-semibold">{s.label}</span>
          </div>
          <EditableField
            fieldKey={s.key}
            label=""
            value={data[s.key] ?? ""}
            placeholder={s.placeholder}
            rows={s.rows}
            idea={idea}
            cards={cards}
            templateType="business_model_narratives"
            onChange={(v) => onChange(s.key, v)}
            className="pl-10"
          />
        </div>
      ))}
    </div>
  );
}
