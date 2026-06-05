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

const LEFT_FIELDS = [
  { key: "problem", label: "문제", placeholder: "해결하려는 핵심 문제", rows: 3 },
  { key: "existing_alternatives", label: "기존 대안", placeholder: "현재 사람들이 어떻게 해결하고 있는가", rows: 3 },
  { key: "unique_value", label: "고유한 가치", placeholder: "왜 우리 솔루션이 달라야 하는가", rows: 3 },
  { key: "unfair_advantage", label: "경쟁 우위", placeholder: "쉽게 복제할 수 없는 차별점", rows: 3 },
];

const RIGHT_FIELDS = [
  { key: "solution", label: "솔루션", placeholder: "핵심 솔루션 3가지", rows: 3 },
  { key: "key_metrics", label: "핵심 지표", placeholder: "성공을 측정하는 핵심 KPI", rows: 3 },
  { key: "channels", label: "채널", placeholder: "고객에게 닿는 경로", rows: 3 },
  { key: "customer_segments", label: "고객 세그먼트", placeholder: "초기 타겟 고객 정의", rows: 3 },
];

export function IdeaCanvasTemplate({ data, idea, cards, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          {LEFT_FIELDS.map((f) => (
            <EditableField
              key={f.key}
              fieldKey={f.key}
              label={f.label}
              value={data[f.key] ?? ""}
              placeholder={f.placeholder}
              rows={f.rows}
              idea={idea}
              cards={cards}
              templateType="idea_canvas"
              onChange={(v) => onChange(f.key, v)}
            />
          ))}
        </div>
        <div className="space-y-4">
          {RIGHT_FIELDS.map((f) => (
            <EditableField
              key={f.key}
              fieldKey={f.key}
              label={f.label}
              value={data[f.key] ?? ""}
              placeholder={f.placeholder}
              rows={f.rows}
              idea={idea}
              cards={cards}
              templateType="idea_canvas"
              onChange={(v) => onChange(f.key, v)}
            />
          ))}
        </div>
      </div>
      <EditableField
        fieldKey="cost_structure"
        label="비용 구조"
        value={data["cost_structure"] ?? ""}
        placeholder="주요 비용 항목"
        rows={2}
        idea={idea}
        cards={cards}
        templateType="idea_canvas"
        onChange={(v) => onChange("cost_structure", v)}
      />
      <EditableField
        fieldKey="revenue_streams"
        label="수익 흐름"
        value={data["revenue_streams"] ?? ""}
        placeholder="수익 모델과 가격 전략"
        rows={2}
        idea={idea}
        cards={cards}
        templateType="idea_canvas"
        onChange={(v) => onChange("revenue_streams", v)}
      />
    </div>
  );
}
