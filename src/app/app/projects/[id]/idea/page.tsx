"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectStepper } from "@/components/layout/ProjectStepper";
import { IdeaCard } from "@/components/idea/IdeaCard";
import { IdeaGenerateButton } from "@/components/idea/IdeaGenerateButton";
import { IdeaChatPanel } from "@/components/idea/IdeaChatPanel";
import { useProjectStore } from "@/stores/projectStore";
import { CATEGORY_TAILWIND } from "@/types";
import { IdeaItem } from "@/types/api";
import { cn } from "@/lib/utils";

export default function IdeaPage({ params }: { params: { id: string } }) {
  const { selectedCards, ideas, selectedIdea, setIdeas, appendIdeas, setSelectedIdea, updateIdea } =
    useProjectStore();

  const [isLoading, setIsLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatIdeaContext, setChatIdeaContext] = useState<IdeaItem | null>(null);

  async function streamIdeas(append = false) {
    if (isLoading || !selectedCards.length) return;
    setIsLoading(true);

    let accumulated = "";
    try {
      const res = await fetch("/api/ai/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards: selectedCards, projectId: params.id }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
      }

      const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as { ideas: IdeaItem[] };
        const newIdeas = parsed.ideas.map((idea, i) => ({
          ...idea,
          id: `idea_${Date.now()}_${i}`,
        }));
        append ? appendIdeas(newIdeas) : setIdeas(newIdeas);
      }
    } catch (err) {
      console.error("아이디어 생성 오류:", err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleRefineIdea(idea: IdeaItem) {
    setChatIdeaContext(idea);
    setChatOpen(true);
  }

  function handleApplyUpdated(updated: Partial<IdeaItem>) {
    if (chatIdeaContext) {
      updateIdea(chatIdeaContext.id, updated);
    }
  }

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col">
      <ProjectStepper currentStep={2} />

      {/* 선택된 카드 칩 서브헤더 */}
      <div className="border-b bg-muted/30 px-4 py-2">
        <div className="mx-auto flex max-w-4xl items-center gap-2 flex-wrap">
          <Link
            href={`/app/projects/${params.id}/cards`}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mr-1"
          >
            <ArrowLeft className="h-3 w-3" />
            카드 수정
          </Link>
          {selectedCards.map((card) => {
            const colors = CATEGORY_TAILWIND[card.category];
            return (
              <Link key={card.id} href={`/app/projects/${params.id}/cards`}>
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs cursor-pointer hover:opacity-80", colors.chip)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
                  {card.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className={cn("flex-1 overflow-y-auto transition-[margin] duration-300", chatOpen ? "mr-96" : "")}>
        <div className="mx-auto max-w-4xl px-4 py-8">
          {ideas.length === 0 || isLoading ? (
            <IdeaGenerateButton
              isLoading={isLoading}
              hasIdeas={false}
              onGenerate={() => streamIdeas(false)}
            />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  생성된 아이디어{" "}
                  <span className="text-muted-foreground font-normal">({ideas.length}개)</span>
                </h2>
                <IdeaGenerateButton
                  isLoading={isLoading}
                  hasIdeas={true}
                  onGenerate={() => streamIdeas(true)}
                />
              </div>
              {ideas.map((idea, i) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  index={i}
                  projectId={params.id}
                  onSelectIdea={setSelectedIdea}
                  onRefineIdea={handleRefineIdea}
                  isSelected={selectedIdea?.id === idea.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <IdeaChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        idea={chatIdeaContext}
        cards={selectedCards}
        onApplyIdea={handleApplyUpdated}
      />
    </div>
  );
}
