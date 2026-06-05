export type CardCategory =
  | "target"
  | "technology"
  | "trend"
  | "revenue"
  | "feature"
  | "industry";

export interface Card {
  id: string;
  category: CardCategory;
  title: string;
  description: string | null;
  tags: string[];
  popularity: number;
  synced_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  stage: number;
  selected_cards: Card[];
  idea: Record<string, unknown> | null;
  templates: Record<string, unknown>;
  document_html: string | null;
  pitch_config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const CATEGORY_LABELS: Record<CardCategory, string> = {
  target: "타겟",
  technology: "기술",
  trend: "트렌드",
  revenue: "수익모델",
  feature: "비즈니스피쳐",
  industry: "산업",
};

export const CATEGORY_COLORS: Record<CardCategory, string> = {
  target: "violet",
  technology: "blue",
  trend: "emerald",
  revenue: "amber",
  feature: "rose",
  industry: "cyan",
};

export const CATEGORY_TAILWIND = {
  target: {
    bar: "bg-violet-500",
    border: "border-violet-500",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    chip: "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200",
    dot: "bg-violet-500",
  },
  technology: {
    bar: "bg-blue-500",
    border: "border-blue-500",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    chip: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
    dot: "bg-blue-500",
  },
  trend: {
    bar: "bg-emerald-500",
    border: "border-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
    dot: "bg-emerald-500",
  },
  revenue: {
    bar: "bg-amber-500",
    border: "border-amber-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    chip: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
    dot: "bg-amber-500",
  },
  feature: {
    bar: "bg-rose-500",
    border: "border-rose-500",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    chip: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200",
    dot: "bg-rose-500",
  },
  industry: {
    bar: "bg-cyan-500",
    border: "border-cyan-500",
    badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    chip: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200",
    dot: "bg-cyan-500",
  },
} as const;
