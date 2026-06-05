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

export function ValuePropositionTemplate({ data, idea, cards, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Customer Profile */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h3 className="font-bold text-sm">고객 프로파일</h3>
        <EditableField
          fieldKey="customer_jobs"
          label="고객의 과업 (Jobs)"
          value={data["customer_jobs"] ?? ""}
          placeholder="고객이 해내려는 기능적·사회적·감정적 과업"
          rows={4}
          idea={idea}
          cards={cards}
          templateType="value_proposition"
          onChange={(v) => onChange("customer_jobs", v)}
        />
        <EditableField
          fieldKey="customer_pains"
          label="고객의 고통 (Pains)"
          value={data["customer_pains"] ?? ""}
          placeholder="고객이 겪는 부정적 경험, 위험, 장애물"
          rows={4}
          idea={idea}
          cards={cards}
          templateType="value_proposition"
          onChange={(v) => onChange("customer_pains", v)}
        />
        <EditableField
          fieldKey="customer_gains"
          label="고객의 이득 (Gains)"
          value={data["customer_gains"] ?? ""}
          placeholder="고객이 원하는 결과와 혜택"
          rows={4}
          idea={idea}
          cards={cards}
          templateType="value_proposition"
          onChange={(v) => onChange("customer_gains", v)}
        />
      </div>

      {/* Value Map */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h3 className="font-bold text-sm">가치 맵</h3>
        <EditableField
          fieldKey="products_services"
          label="제품 및 서비스"
          value={data["products_services"] ?? ""}
          placeholder="제공하는 핵심 제품/서비스 목록"
          rows={4}
          idea={idea}
          cards={cards}
          templateType="value_proposition"
          onChange={(v) => onChange("products_services", v)}
        />
        <EditableField
          fieldKey="pain_relievers"
          label="고통 해소제 (Pain Relievers)"
          value={data["pain_relievers"] ?? ""}
          placeholder="고객의 고통을 어떻게 줄이는가"
          rows={4}
          idea={idea}
          cards={cards}
          templateType="value_proposition"
          onChange={(v) => onChange("pain_relievers", v)}
        />
        <EditableField
          fieldKey="gain_creators"
          label="이득 창출제 (Gain Creators)"
          value={data["gain_creators"] ?? ""}
          placeholder="고객의 이득을 어떻게 만들어내는가"
          rows={4}
          idea={idea}
          cards={cards}
          templateType="value_proposition"
          onChange={(v) => onChange("gain_creators", v)}
        />
      </div>
    </div>
  );
}
