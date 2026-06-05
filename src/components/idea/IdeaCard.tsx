"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, ChevronDown, ChevronUp, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IdeaItem } from "@/types/api";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface IdeaCardProps {
  idea: IdeaItem;
  index: number;
  projectId: string;
  onSelectIdea: (idea: IdeaItem) => void;
  onRefineIdea: (idea: IdeaItem) => void;
  isSelected: boolean;
}

export function IdeaCard({ idea, index, projectId, onSelectIdea, onRefineIdea, isSelected }: IdeaCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  function handleSelect() {
    onSelectIdea(idea);
    router.push(`/app/projects/${projectId}/template`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={cn(
        "rounded-xl border-2 bg-card p-6 shadow-sm transition-colors",
        isSelected ? "border-primary" : "border-border hover:border-muted-foreground/40"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">아이디어 {index + 1}</Badge>
            {isSelected && (
              <Badge className="text-xs gap-1">
                <Check className="h-3 w-3" />선택됨
              </Badge>
            )}
          </div>
          <h3 className="text-xl font-bold">{idea.name}</h3>
          <p className="mt-1 text-muted-foreground">{idea.tagline}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">문제</p>
          <p className="text-sm">{idea.problem}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">솔루션</p>
          <p className="text-sm">{idea.solution}</p>
        </div>
      </div>

      {/* 확장 섹션 */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expanded ? "접기" : "가치제안 · 리스크 보기"}
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 grid grid-cols-2 gap-4"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">가치제안</p>
            <ul className="space-y-1">
              {idea.value_props.map((vp, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs">
                  <Check className="h-3.5 w-3.5 mt-0.5 text-emerald-500 flex-shrink-0" />
                  {vp}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">리스크</p>
            <ul className="space-y-1">
              {idea.risks.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 text-amber-500 flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      <div className="mt-5 flex gap-2">
        <Button size="sm" onClick={handleSelect} className="gap-1.5">
          이 아이디어로 진행
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onRefineIdea(idea)} className="gap-1.5">
          <MessageSquare className="h-4 w-4" />
          더 다듬기
        </Button>
      </div>
    </motion.div>
  );
}
