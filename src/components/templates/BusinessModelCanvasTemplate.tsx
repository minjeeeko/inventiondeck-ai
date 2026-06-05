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

const BLOCKS = [
  { key: "key_partners", label: "핵심 파트너십", placeholder: "주요 공급자와 파트너" },
  { key: "key_activities", label: "핵심 활동", placeholder: "가치 제공을 위한 핵심 활동" },
  { key: "key_resources", label: "핵심 자원", placeholder: "필요한 물리적·지적·인적 자원" },
  { key: "value_propositions", label: "가치 제안", placeholder: "고객에게 제공하는 핵심 가치" },
  { key: "customer_relationships", label: "고객 관계", placeholder: "고객과의 관계 유형" },
  { key: "channels", label: "채널", placeholder: "가치를 전달하는 경로" },
  { key: "customer_segments", label: "고객 세그먼트", placeholder: "타겟 고객 그룹" },
  { key: "cost_structure", label: "비용 구조", placeholder: "주요 비용 항목과 비율" },
  { key: "revenue_streams", label: "수익 흐름", placeholder: "수익 모델과 가격 책정" },
];

export function BusinessModelCanvasTemplate({ data, idea, cards, onChange }: Props) {
  return (
    <div className="space-y-3">
      {/* Top 7 blocks */}
      <div className="grid grid-cols-5 gap-3 min-h-[360px]">
        <div className="rounded-xl border bg-card p-4">
          <EditableField
            fieldKey="key_partners"
            label="핵심 파트너십"
            value={data["key_partners"] ?? ""}
            placeholder="주요 공급자와 파트너"
            rows={8}
            idea={idea}
            cards={cards}
            templateType="business_model_canvas"
            onChange={(v) => onChange("key_partners", v)}
          />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex-1 rounded-xl border bg-card p-4">
            <EditableField
              fieldKey="key_activities"
              label="핵심 활동"
              value={data["key_activities"] ?? ""}
              placeholder="가치 제공을 위한 핵심 활동"
              rows={4}
              idea={idea}
              cards={cards}
              templateType="business_model_canvas"
              onChange={(v) => onChange("key_activities", v)}
            />
          </div>
          <div className="flex-1 rounded-xl border bg-card p-4">
            <EditableField
              fieldKey="key_resources"
              label="핵심 자원"
              value={data["key_resources"] ?? ""}
              placeholder="필요한 물리적·지적·인적 자원"
              rows={4}
              idea={idea}
              cards={cards}
              templateType="business_model_canvas"
              onChange={(v) => onChange("key_resources", v)}
            />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <EditableField
            fieldKey="value_propositions"
            label="가치 제안"
            value={data["value_propositions"] ?? ""}
            placeholder="고객에게 제공하는 핵심 가치"
            rows={8}
            idea={idea}
            cards={cards}
            templateType="business_model_canvas"
            onChange={(v) => onChange("value_propositions", v)}
          />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex-1 rounded-xl border bg-card p-4">
            <EditableField
              fieldKey="customer_relationships"
              label="고객 관계"
              value={data["customer_relationships"] ?? ""}
              placeholder="고객과의 관계 유형"
              rows={4}
              idea={idea}
              cards={cards}
              templateType="business_model_canvas"
              onChange={(v) => onChange("customer_relationships", v)}
            />
          </div>
          <div className="flex-1 rounded-xl border bg-card p-4">
            <EditableField
              fieldKey="channels"
              label="채널"
              value={data["channels"] ?? ""}
              placeholder="가치를 전달하는 경로"
              rows={4}
              idea={idea}
              cards={cards}
              templateType="business_model_canvas"
              onChange={(v) => onChange("channels", v)}
            />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <EditableField
            fieldKey="customer_segments"
            label="고객 세그먼트"
            value={data["customer_segments"] ?? ""}
            placeholder="타겟 고객 그룹"
            rows={8}
            idea={idea}
            cards={cards}
            templateType="business_model_canvas"
            onChange={(v) => onChange("customer_segments", v)}
          />
        </div>
      </div>
      {/* Bottom 2 blocks */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-4">
          <EditableField
            fieldKey="cost_structure"
            label="비용 구조"
            value={data["cost_structure"] ?? ""}
            placeholder="주요 비용 항목과 비율"
            rows={3}
            idea={idea}
            cards={cards}
            templateType="business_model_canvas"
            onChange={(v) => onChange("cost_structure", v)}
          />
        </div>
        <div className="rounded-xl border bg-card p-4">
          <EditableField
            fieldKey="revenue_streams"
            label="수익 흐름"
            value={data["revenue_streams"] ?? ""}
            placeholder="수익 모델과 가격 책정"
            rows={3}
            idea={idea}
            cards={cards}
            templateType="business_model_canvas"
            onChange={(v) => onChange("revenue_streams", v)}
          />
        </div>
      </div>
    </div>
  );
}
