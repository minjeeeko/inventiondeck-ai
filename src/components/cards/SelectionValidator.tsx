"use client";

import { useMemo } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardCategory, CATEGORY_LABELS } from "@/types";

const MIN_CARDS = 3;
const MIN_CATEGORIES = 3;

const ALL_CATEGORIES: CardCategory[] = ["target", "technology", "trend", "revenue", "feature", "industry"];

interface SelectionValidatorProps {
  selectedCards: Card[];
}

export function SelectionValidator({ selectedCards }: SelectionValidatorProps) {
  const { isValid, totalCount, categoryCount, missingCategories } = useMemo(() => {
    const categorySet = new Set(selectedCards.map((c) => c.category));
    const totalCount = selectedCards.length;
    const categoryCount = categorySet.size;
    const isValid = totalCount >= MIN_CARDS && categoryCount >= MIN_CATEGORIES;
    const missingCategories = ALL_CATEGORIES.filter((c) => !categorySet.has(c)).slice(0, 3);
    return { isValid, totalCount, categoryCount, missingCategories };
  }, [selectedCards]);

  if (selectedCards.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        카드를 선택하면 유효성 검사를 진행합니다.
      </p>
    );
  }

  if (isValid) {
    return (
      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
        <span className="text-xs font-medium">아이디어 생성 준비 완료</span>
      </div>
    );
  }

  const needMoreCards = totalCount < MIN_CARDS;
  const needMoreCats = categoryCount < MIN_CATEGORIES;

  let message = "";
  if (needMoreCards && needMoreCats) {
    message = `아직 ${categoryCount}개 카테고리만 선택됨. `;
  } else if (needMoreCats) {
    message = `아직 ${categoryCount}개 카테고리만 선택됨. `;
  } else {
    message = `카드가 ${totalCount}개 선택됨. `;
  }

  if (missingCategories.length > 0) {
    message += `${missingCategories.map((c) => CATEGORY_LABELS[c]).join(", ")} 중 하나를 추가하세요.`;
  }

  return (
    <div className="flex items-start gap-1.5 text-amber-600 dark:text-amber-400">
      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <span className="text-xs">{message}</span>
    </div>
  );
}

export function useValidation(selectedCards: Card[]) {
  return useMemo(() => {
    const categorySet = new Set(selectedCards.map((c) => c.category));
    return selectedCards.length >= MIN_CARDS && categorySet.size >= MIN_CATEGORIES;
  }, [selectedCards]);
}
