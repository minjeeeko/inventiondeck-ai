"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IdeaGenerateButtonProps {
  isLoading: boolean;
  hasIdeas: boolean;
  onGenerate: () => void;
}

const LOADING_MESSAGES = [
  "카드 조합을 분석하는 중…",
  "아이디어를 탐색하는 중…",
  "혁신적 관점을 찾는 중…",
  "아이디어를 구체화하는 중…",
];

export function IdeaGenerateButton({ isLoading, hasIdeas, onGenerate }: IdeaGenerateButtonProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-3 py-12"
      >
        <div className="relative flex h-16 w-16 items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
          />
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <AnimatePresence mode="wait">
          {LOADING_MESSAGES.map((msg, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="text-sm text-muted-foreground"
            >
              {msg}
            </motion.p>
          )).slice(0, 1)}
        </AnimatePresence>
      </motion.div>
    );
  }

  if (!hasIdeas) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 py-16"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">AI 아이디어 생성</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            선택한 카드들을 조합해 맞춤 스타트업 아이디어 3개를 제안해 드립니다
          </p>
        </div>
        <Button size="lg" onClick={onGenerate} className="gap-2 px-8">
          <Sparkles className="h-5 w-5" />
          아이디어 생성하기
        </Button>
      </motion.div>
    );
  }

  return (
    <Button variant="outline" onClick={onGenerate} className="gap-2">
      <Sparkles className="h-4 w-4" />
      3개 더 생성
    </Button>
  );
}
