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

const FIELDS = [
  { key: "tagline", label: "태그라인", placeholder: "한 문장으로 아이디어를 표현하세요", rows: 2 },
  { key: "elevator_pitch", label: "엘리베이터 피치 (30초)", placeholder: "투자자에게 30초 안에 설득하는 한 단락", rows: 4 },
  { key: "headline", label: "헤드라인 (미디어용)", placeholder: "언론 기사 제목처럼 작성", rows: 2 },
  { key: "twitter_summary", label: "트위터 요약 (280자)", placeholder: "SNS 한 줄 요약", rows: 2 },
  { key: "investor_one_liner", label: "투자자 원라이너", placeholder: "VC에게 보내는 콜드 이메일 첫 문장", rows: 2 },
  { key: "problem_statement", label: "문제 정의", placeholder: "어떤 문제를 해결하나요? 왜 지금인가요?", rows: 4 },
  { key: "solution_statement", label: "솔루션 정의", placeholder: "핵심 솔루션과 작동 방식을 설명하세요", rows: 4 },
];

export function IdeaDefinitionTemplate({ data, idea, cards, onChange }: Props) {
  return (
    <div className="space-y-6">
      {FIELDS.map((f) => (
        <EditableField
          key={f.key}
          fieldKey={f.key}
          label={f.label}
          value={data[f.key] ?? ""}
          placeholder={f.placeholder}
          rows={f.rows}
          idea={idea}
          cards={cards}
          templateType="idea_definition"
          onChange={(v) => onChange(f.key, v)}
        />
      ))}
    </div>
  );
}
