import { GoogleGenerativeAI, GenerateContentStreamResult } from "@google/generative-ai";
import { Card } from "@/types";
import { IdeaItem, ChatMessage } from "@/types/api";
import {
  IDEA_GENERATION_PROMPT,
  TEMPLATE_FIELD_PROMPT,
  REWRITE_FIELD_PROMPT,
  INLINE_REWRITE_PROMPT,
  IDEA_CHAT_SYSTEM_PROMPT,
  DOCUMENT_SECTION_PROMPT,
} from "./prompts";

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(apiKey);
}

function getModel(streaming = true) {
  return getGenAI().getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { temperature: 0.8, maxOutputTokens: 4096 },
  });
}

/** 스트리밍 결과를 ReadableStream으로 변환 */
export function streamToReadable(stream: GenerateContentStreamResult): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

/** 아이디어 3개 생성 (스트리밍) */
export async function generateIdeas(cards: Card[]): Promise<ReadableStream> {
  const model = getModel();
  const cardList = cards.map((c) => `[${c.category}] ${c.title}: ${c.description ?? ""}`).join("\n");
  const prompt = `선택된 카드:\n${cardList}`;

  const result = await model.generateContentStream({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    systemInstruction: { role: "model", parts: [{ text: IDEA_GENERATION_PROMPT }] },
  });

  return streamToReadable(result);
}

/** 템플릿 필드 초안 작성 (스트리밍) */
export async function generateTemplateField(params: {
  fieldKey: string;
  fieldLabel: string;
  templateType: string;
  ideaData: IdeaItem;
  allFieldData: Record<string, string>;
  instruction?: string;
}): Promise<ReadableStream> {
  const model = getModel();
  const context = `
아이디어명: ${params.ideaData.name}
한 줄 정의: ${params.ideaData.tagline}
문제: ${params.ideaData.problem}
솔루션: ${params.ideaData.solution}
가치제안: ${params.ideaData.value_props.join(", ")}

템플릿: ${params.templateType}
필드: ${params.fieldLabel} (key: ${params.fieldKey})
${params.instruction ? `지시사항: ${params.instruction}` : ""}

기존 작성된 필드들:
${Object.entries(params.allFieldData)
  .filter(([k, v]) => k !== params.fieldKey && v)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}
`;

  const result = await model.generateContentStream({
    contents: [{ role: "user", parts: [{ text: context }] }],
    systemInstruction: { role: "model", parts: [{ text: TEMPLATE_FIELD_PROMPT }] },
  });

  return streamToReadable(result);
}

/** 필드 전체 수정 (스트리밍) */
export async function rewriteField(params: {
  fieldKey: string;
  currentValue: string;
  instruction: string;
  templateType: string;
  ideaData: IdeaItem;
}): Promise<ReadableStream> {
  const model = getModel();
  const prompt = `
아이디어: ${params.ideaData.name} — ${params.ideaData.tagline}
필드(${params.fieldKey}) 현재 내용:
${params.currentValue}

수정 지시: ${params.instruction}
`;

  const result = await model.generateContentStream({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    systemInstruction: { role: "model", parts: [{ text: REWRITE_FIELD_PROMPT }] },
  });

  return streamToReadable(result);
}

/** 인라인 문장 수정 (스트리밍) */
export async function rewriteInline(params: {
  before: string;
  selected: string;
  after: string;
  instruction: string;
}): Promise<ReadableStream> {
  const model = getModel();
  const prompt = `전체맥락: ${params.before} [[[${params.selected}]]] ${params.after}\n지시: ${params.instruction}`;

  const result = await model.generateContentStream({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    systemInstruction: { role: "model", parts: [{ text: INLINE_REWRITE_PROMPT }] },
  });

  return streamToReadable(result);
}

/** 아이디어 채팅 (스트리밍) */
export async function ideaChat(params: {
  messages: ChatMessage[];
  ideaContext: IdeaItem;
  cards: Card[];
}): Promise<ReadableStream> {
  const model = getModel();
  const cardSummary = params.cards.map((c) => `[${c.category}] ${c.title}`).join(", ");
  const ideaSummary = `
아이디어명: ${params.ideaContext.name}
태그라인: ${params.ideaContext.tagline}
문제: ${params.ideaContext.problem}
솔루션: ${params.ideaContext.solution}
선택 카드: ${cardSummary}
`;

  const history = params.messages.slice(0, -1).map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  const lastMessage = params.messages[params.messages.length - 1];

  const result = await model.generateContentStream({
    contents: [
      { role: "user", parts: [{ text: `컨텍스트:\n${ideaSummary}` }] },
      { role: "model", parts: [{ text: "네, 아이디어 내용을 파악했습니다. 어떻게 발전시킬까요?" }] },
      ...history,
      { role: "user", parts: [{ text: lastMessage.content }] },
    ],
    systemInstruction: { role: "model", parts: [{ text: IDEA_CHAT_SYSTEM_PROMPT }] },
  });

  return streamToReadable(result);
}

/** 사업계획서 섹션 생성 (스트리밍) */
export async function generateDocument(params: {
  section: string;
  ideaData: IdeaItem;
  templateData: Record<string, Record<string, string>>;
}): Promise<ReadableStream> {
  const model = getModel();
  const templateSummary = Object.entries(params.templateData)
    .map(([t, fields]) => `[${t}]\n${Object.entries(fields).map(([k, v]) => `  ${k}: ${v}`).join("\n")}`)
    .join("\n\n");

  const prompt = `
아이디어: ${params.ideaData.name}
섹션: ${params.section}

템플릿 데이터:
${templateSummary}
`;

  const result = await model.generateContentStream({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    systemInstruction: { role: "model", parts: [{ text: DOCUMENT_SECTION_PROMPT }] },
  });

  return streamToReadable(result);
}

/** 카드 추천 (non-streaming JSON) */
export async function recommendCards(query: string, cards: Card[]): Promise<string[]> {
  const model = getGenAI().getGenerativeModel({ model: "gemini-1.5-flash" });
  const cardList = cards.slice(0, 200).map((c) => `${c.id}|${c.category}|${c.title}`).join("\n");

  const prompt = `관심사: "${query}"\n\n카드 목록(id|category|title):\n${cardList}\n\n3~6개 추천. JSON만 반환: {"recommendedIds":["id1","id2"]}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return [];
    const parsed = JSON.parse(match[0]) as { recommendedIds: string[] };
    return parsed.recommendedIds ?? [];
  } catch {
    return [];
  }
}
