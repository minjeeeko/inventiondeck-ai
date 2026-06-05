"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/types";
import { CATEGORY_TAILWIND } from "@/types";
import { cn } from "@/lib/utils";

interface SelectedCardTrayProps {
  cards: Card[];
  onRemove: (cardId: string) => void;
}

export function SelectedCardTray({ cards, onRemove }: SelectedCardTrayProps) {
  if (cards.length === 0) return null;

  return (
    <div className="border-t bg-background/95 backdrop-blur-sm px-4 py-3">
      <div className="mx-auto max-w-7xl">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          선택된 카드 ({cards.length}개)
        </p>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {cards.map((card) => {
              const colors = CATEGORY_TAILWIND[card.category];
              return (
                <motion.span
                  key={card.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
                    colors.chip
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", colors.dot)} />
                  <span className="max-w-[120px] truncate">{card.title}</span>
                  <button
                    onClick={() => onRemove(card.id)}
                    className="ml-0.5 flex-shrink-0 rounded-full p-0.5 opacity-60 hover:opacity-100 transition-opacity"
                    aria-label={`${card.title} 제거`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.span>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
