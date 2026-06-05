"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Card } from "@/types";
import { CATEGORY_LABELS, CATEGORY_TAILWIND } from "@/types";
import { cn } from "@/lib/utils";

interface CardItemProps {
  card: Card;
  isSelected: boolean;
  onToggle: (card: Card) => void;
}

export const CardItem = memo(function CardItem({ card, isSelected, onToggle }: CardItemProps) {
  const colors = CATEGORY_TAILWIND[card.category];

  return (
    <motion.div
      layout
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onToggle(card)}
      className={cn(
        "relative flex cursor-pointer flex-col rounded-xl border-2 bg-card overflow-hidden transition-colors duration-150 select-none",
        isSelected ? colors.border : "border-border hover:border-muted-foreground/40"
      )}
    >
      {/* 카테고리 컬러 상단 바 */}
      <div className={cn("h-1 w-full", colors.bar)} />

      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* 카테고리 배지 */}
        <span className={cn("inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium", colors.badge)}>
          {CATEGORY_LABELS[card.category]}
        </span>

        {/* 제목 */}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{card.title}</h3>

        {/* 설명 */}
        {card.description && (
          <p className="line-clamp-3 text-xs text-muted-foreground leading-relaxed">
            {card.description}
          </p>
        )}

        {/* 태그 */}
        {card.tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1 pt-2">
            {card.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 선택 체크 배지 */}
      {isSelected && (
        <div className={cn("absolute right-2 top-3 flex h-5 w-5 items-center justify-center rounded-full", colors.bar)}>
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        </div>
      )}
    </motion.div>
  );
});
