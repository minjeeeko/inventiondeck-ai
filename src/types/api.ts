// ─── AI API 요청/응답 타입 ───────────────────────────────────────────────────

import { Card } from "./index";

export interface GenerateIdeasRequest {
  cards: Card[];
  projectId: string;
}

export interface IdeaItem {
  id: string;
  name: string;
  tagline: string;
  problem: string;
  solution: string;
  value_props: string[];
  risks: string[];
}

export interface GenerateIdeasResponse {
  ideas: IdeaItem[];
}

export interface TemplateFieldRequest {
  fieldKey: string;
  fieldLabel: string;
  templateType: string;
  ideaData: IdeaItem;
  allFieldData: Record<string, string>;
  instruction?: string;
}

export interface RewriteFieldRequest {
  fieldKey: string;
  currentValue: string;
  instruction: string;
  templateType: string;
  ideaData: IdeaItem;
}

export interface RewriteInlineRequest {
  before: string;
  selected: string;
  after: string;
  instruction: string;
}

export interface GenerateDocumentRequest {
  section: string;
  ideaData: IdeaItem;
  templateData: Record<string, Record<string, string>>;
}

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export interface IdeaChatRequest {
  messages: ChatMessage[];
  ideaContext: IdeaItem;
  cards: Card[];
}
