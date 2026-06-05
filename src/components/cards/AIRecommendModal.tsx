"use client";

import { useState } from "react";
import { Sparkles, Plus, CheckCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CATEGORY_LABELS, CATEGORY_TAILWIND } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface AIRecommendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allCards: Card[];
  selectedCards: Card[];
  onAddCards: (cards: Card[]) => void;
}

export function AIRecommendModal({ open, onOpenChange, allCards, selectedCards, onAddCards }: AIRecommendModalProps) {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Card[]>([]);
  const [staged, setStaged] = useState<Set<string>>(new Set());

  async function handleRecommend() {
    if (!keyword.trim()) return;
    setLoading(true);
    setRecommendations([]);

    try {
      const res = await fetch("/api/ai/recommend-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword,
          allCards: allCards.map((c) => ({ id: c.id, category: c.category, title: c.title })),
          selectedIds: selectedCards.map((c) => c.id),
        }),
      });

      if (!res.ok) throw new Error("추천 API 오류");
      const { recommendedIds } = await res.json() as { recommendedIds: string[] };
      const recommended = allCards.filter((c) => recommendedIds.includes(c.id));
      setRecommendations(recommended);
      setStaged(new Set(recommended.map((c) => c.id)));
    } catch {
      toast({ title: "AI 추천 실패", description: "잠시 후 다시 시도해주세요.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function toggleStaged(cardId: string) {
    setStaged((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) { next.delete(cardId); } else { next.add(cardId); }
      return next;
    });
  }

  function handleAdd() {
    const toAdd = recommendations.filter((c) => staged.has(c.id));
    onAddCards(toAdd);
    onOpenChange(false);
    setKeyword("");
    setRecommendations([]);
    setStaged(new Set());
    toast({ title: `${toAdd.length}개 카드가 추가됐습니다.` });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI 카드 추천
          </DialogTitle>
          <DialogDescription>
            관심 분야나 키워드를 입력하면 카테고리 균형을 고려해 3~6장을 추천해 드립니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder="예: 노인을 위한 건강 관리 앱, AI 기반 교육 플랫폼, 친환경 배달 서비스…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button className="w-full gap-2" onClick={handleRecommend} disabled={loading || !keyword.trim()}>
            <Sparkles className="h-4 w-4" />
            {loading ? "AI가 분석 중…" : "추천 받기"}
          </Button>

          {/* 로딩 스켈레톤 */}
          {loading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          )}

          {/* 추천 결과 */}
          {recommendations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{recommendations.length}개 추천됨</p>
                <Button variant="ghost" size="sm" onClick={() => setStaged(new Set(recommendations.map((c) => c.id)))}>
                  전체 선택
                </Button>
              </div>
              {recommendations.map((card) => {
                const colors = CATEGORY_TAILWIND[card.category];
                const isStaged = staged.has(card.id);
                return (
                  <div
                    key={card.id}
                    onClick={() => toggleStaged(card.id)}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-colors",
                      isStaged ? colors.border + " bg-muted/40" : "border-border"
                    )}
                  >
                    <div className={cn("mt-0.5 h-2 w-2 flex-shrink-0 rounded-full", colors.dot)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{card.title}</p>
                      <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[card.category]}</p>
                    </div>
                    {isStaged && <CheckCheck className="h-4 w-4 text-primary flex-shrink-0" />}
                  </div>
                );
              })}

              <Button className="w-full gap-2" onClick={handleAdd} disabled={staged.size === 0}>
                <Plus className="h-4 w-4" />
                선택한 {staged.size}개 추가하기
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
