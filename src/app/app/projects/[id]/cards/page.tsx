"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectStepper } from "@/components/layout/ProjectStepper";
import { CardGrid } from "@/components/cards/CardGrid";
import { CardSearch } from "@/components/cards/CardSearch";
import { SelectedCardTray } from "@/components/cards/SelectedCardTray";
import { SelectionValidator, useValidation } from "@/components/cards/SelectionValidator";
import { AIRecommendModal } from "@/components/cards/AIRecommendModal";
import { useCards } from "@/hooks/useCards";
import { useProjectStore } from "@/stores/projectStore";
import { Card, CardCategory, CATEGORY_LABELS, CATEGORY_TAILWIND } from "@/types";
import { cn } from "@/lib/utils";

const CATEGORY_TABS: { value: CardCategory | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "target", label: CATEGORY_LABELS.target },
  { value: "technology", label: CATEGORY_LABELS.technology },
  { value: "trend", label: CATEGORY_LABELS.trend },
  { value: "revenue", label: CATEGORY_LABELS.revenue },
  { value: "feature", label: CATEGORY_LABELS.feature },
  { value: "industry", label: CATEGORY_LABELS.industry },
];

export default function CardsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { cards, isLoading, search, getByCategory } = useCards();
  const { selectedCards, toggleCard, addCard, removeCard } = useProjectStore();

  const [activeCategory, setActiveCategory] = useState<CardCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const isValid = useValidation(selectedCards);

  // 표시할 카드: 검색어 있으면 검색 결과, 없으면 카테고리 필터
  const displayCards = useMemo<Card[]>(() => {
    if (searchQuery.trim()) return search(searchQuery);
    return getByCategory(activeCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeCategory, search, getByCategory]);

  const selectedIds = useMemo(
    () => new Set(selectedCards.map((c) => c.id)),
    [selectedCards]
  );

  // 카테고리별 선택 카운트
  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = {};
    selectedCards.forEach((c) => {
      counts[c.category] = (counts[c.category] ?? 0) + 1;
    });
    return counts;
  }, [selectedCards]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (q) setActiveCategory("all");
  }, []);

  const handleAddRecommended = useCallback((cards: Card[]) => {
    cards.forEach((c) => addCard(c));
  }, [addCard]);

  function handleNext() {
    router.push(`/app/projects/${params.id}/idea`);
  }

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col">
      <ProjectStepper currentStep={1} />

      <div className="flex flex-1 overflow-hidden">
        {/* 좌측 사이드바 */}
        <aside className="w-60 flex-shrink-0 border-r bg-muted/30 overflow-y-auto">
          <div className="p-3">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              카테고리
            </p>
            <nav className="space-y-0.5">
              {CATEGORY_TABS.map((tab) => {
                const isActive = activeCategory === tab.value && !searchQuery;
                const count =
                  tab.value === "all"
                    ? selectedCards.length
                    : categoryCount[tab.value] ?? 0;
                const colors =
                  tab.value !== "all" ? CATEGORY_TAILWIND[tab.value] : null;

                return (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setActiveCategory(tab.value);
                      setSearchQuery("");
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-background font-medium text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {colors && (
                        <span className={cn("h-2 w-2 rounded-full flex-shrink-0", colors.dot)} />
                      )}
                      <span>{tab.label}</span>
                    </div>
                    {count > 0 && (
                      <Badge variant="secondary" className="h-5 min-w-5 justify-center px-1.5 text-[10px]">
                        {count}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* 검색 + AI 추천 버튼 */}
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <div className="flex-1">
              <CardSearch onSearch={handleSearch} />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 flex-shrink-0"
              onClick={() => setAiModalOpen(true)}
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI 추천</span>
            </Button>
          </div>

          {/* 카드 수 표시 */}
          <div className="px-4 py-2 text-xs text-muted-foreground border-b">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <>
                {searchQuery ? `"${searchQuery}" 검색 결과` : CATEGORY_TABS.find((t) => t.value === activeCategory)?.label}{" "}
                <span className="font-medium text-foreground">{displayCards.length}장</span>
              </>
            )}
          </div>

          {/* 카드 그리드 */}
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className="h-44 rounded-xl" />
                ))}
              </div>
            ) : (
              <CardGrid
                cards={displayCards}
                selectedIds={selectedIds}
                onToggle={toggleCard}
              />
            )}
          </div>
        </div>
      </div>

      {/* 하단 고정 트레이 */}
      <div className="sticky bottom-0 border-t bg-background shadow-lg">
        <SelectedCardTray cards={selectedCards} onRemove={removeCard} />
        <div className="flex items-center justify-between px-4 py-3">
          <SelectionValidator selectedCards={selectedCards} />
          <Button
            onClick={handleNext}
            disabled={!isValid}
            className="gap-2"
          >
            아이디어 생성
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* AI 추천 모달 */}
      <AIRecommendModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        allCards={cards}
        selectedCards={selectedCards}
        onAddCards={handleAddRecommended}
      />
    </div>
  );
}
