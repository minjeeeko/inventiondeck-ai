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

export function SolutionOutlineTemplate({ data, idea, cards, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">핵심 기능 {i}</p>
            <EditableField
              fieldKey={`feature_${i}_name`}
              label="기능명"
              value={data[`feature_${i}_name`] ?? ""}
              placeholder="기능 이름"
              rows={1}
              idea={idea}
              cards={cards}
              templateType="solution_outline"
              onChange={(v) => onChange(`feature_${i}_name`, v)}
            />
            <EditableField
              fieldKey={`feature_${i}_desc`}
              label="설명"
              value={data[`feature_${i}_desc`] ?? ""}
              placeholder="이 기능이 해결하는 문제와 작동 방식"
              rows={3}
              idea={idea}
              cards={cards}
              templateType="solution_outline"
              onChange={(v) => onChange(`feature_${i}_desc`, v)}
            />
          </div>
        ))}
      </div>
      <EditableField
        fieldKey="tech_stack"
        label="기술 스택"
        value={data["tech_stack"] ?? ""}
        placeholder="핵심 기술과 선택 이유"
        rows={3}
        idea={idea}
        cards={cards}
        templateType="solution_outline"
        onChange={(v) => onChange("tech_stack", v)}
      />
      <EditableField
        fieldKey="mvp_scope"
        label="MVP 범위"
        value={data["mvp_scope"] ?? ""}
        placeholder="3개월 안에 출시할 최소 기능 범위"
        rows={4}
        idea={idea}
        cards={cards}
        templateType="solution_outline"
        onChange={(v) => onChange("mvp_scope", v)}
      />
    </div>
  );
}
