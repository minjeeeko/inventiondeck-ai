import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Card } from "@/types";

interface ProjectStore {
  selectedCards: Card[];
  addCard: (card: Card) => void;
  removeCard: (cardId: string) => void;
  toggleCard: (card: Card) => void;
  clearCards: () => void;
  isSelected: (cardId: string) => boolean;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      selectedCards: [],

      addCard: (card) =>
        set((state) => ({
          selectedCards: state.selectedCards.some((c) => c.id === card.id)
            ? state.selectedCards
            : [...state.selectedCards, card],
        })),

      removeCard: (cardId) =>
        set((state) => ({
          selectedCards: state.selectedCards.filter((c) => c.id !== cardId),
        })),

      toggleCard: (card) => {
        const { isSelected, addCard, removeCard } = get();
        if (isSelected(card.id)) {
          removeCard(card.id);
        } else {
          addCard(card);
        }
      },

      clearCards: () => set({ selectedCards: [] }),

      isSelected: (cardId) => get().selectedCards.some((c) => c.id === cardId),
    }),
    {
      name: "project-selected-cards",
    }
  )
);
