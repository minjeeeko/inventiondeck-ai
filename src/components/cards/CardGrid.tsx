"use client";

import { VirtuosoGrid } from "react-virtuoso";
import { Card } from "@/types";
import { CardItem } from "./CardItem";

interface CardGridProps {
  cards: Card[];
  selectedIds: Set<string>;
  onToggle: (card: Card) => void;
}

export function CardGrid({ cards, selectedIds, onToggle }: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
        카드를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <VirtuosoGrid
      style={{ height: "calc(100vh - 280px)", minHeight: 400 }}
      totalCount={cards.length}
      listClassName="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4"
      itemContent={(index) => {
        const card = cards[index];
        return (
          <CardItem
            key={card.id}
            card={card}
            isSelected={selectedIds.has(card.id)}
            onToggle={onToggle}
          />
        );
      }}
    />
  );
}
