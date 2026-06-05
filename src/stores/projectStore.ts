import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Card } from "@/types";
import { IdeaItem } from "@/types/api";

interface ProjectStore {
  // Stage 1
  selectedCards: Card[];
  addCard: (card: Card) => void;
  removeCard: (cardId: string) => void;
  toggleCard: (card: Card) => void;
  clearCards: () => void;
  isSelected: (cardId: string) => boolean;

  // Stage 2
  ideas: IdeaItem[];
  selectedIdea: IdeaItem | null;
  setIdeas: (ideas: IdeaItem[]) => void;
  appendIdeas: (ideas: IdeaItem[]) => void;
  setSelectedIdea: (idea: IdeaItem) => void;
  updateIdea: (id: string, updated: Partial<IdeaItem>) => void;

  // Stage 3
  templateData: Record<string, Record<string, string>>;
  activeTemplate: string;
  setTemplateField: (template: string, field: string, value: string) => void;
  setActiveTemplate: (template: string) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      // ─── Stage 1 ─────────────────────────────────────────────
      selectedCards: [],

      addCard: (card) =>
        set((s) => ({
          selectedCards: s.selectedCards.some((c) => c.id === card.id)
            ? s.selectedCards
            : [...s.selectedCards, card],
        })),

      removeCard: (cardId) =>
        set((s) => ({ selectedCards: s.selectedCards.filter((c) => c.id !== cardId) })),

      toggleCard: (card) => {
        const { isSelected, addCard, removeCard } = get();
        isSelected(card.id) ? removeCard(card.id) : addCard(card);
      },

      clearCards: () => set({ selectedCards: [] }),

      isSelected: (cardId) => get().selectedCards.some((c) => c.id === cardId),

      // ─── Stage 2 ─────────────────────────────────────────────
      ideas: [],
      selectedIdea: null,

      setIdeas: (ideas) => set({ ideas }),
      appendIdeas: (ideas) => set((s) => ({ ideas: [...s.ideas, ...ideas] })),
      setSelectedIdea: (idea) => set({ selectedIdea: idea }),
      updateIdea: (id, updated) =>
        set((s) => ({
          ideas: s.ideas.map((idea) => (idea.id === id ? { ...idea, ...updated } : idea)),
          selectedIdea:
            s.selectedIdea?.id === id ? { ...s.selectedIdea, ...updated } : s.selectedIdea,
        })),

      // ─── Stage 3 ─────────────────────────────────────────────
      templateData: {},
      activeTemplate: "idea_definition",

      setTemplateField: (template, field, value) =>
        set((s) => ({
          templateData: {
            ...s.templateData,
            [template]: { ...(s.templateData[template] ?? {}), [field]: value },
          },
        })),

      setActiveTemplate: (template) => set({ activeTemplate: template }),
    }),
    { name: "inventiondeck-project" }
  )
);
