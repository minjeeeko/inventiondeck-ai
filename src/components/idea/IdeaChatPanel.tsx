"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IdeaItem, ChatMessage } from "@/types/api";
import { Card } from "@/types";
import { cn } from "@/lib/utils";

interface IdeaChatPanelProps {
  open: boolean;
  onClose: () => void;
  idea: IdeaItem | null;
  cards: Card[];
  onApplyIdea: (updated: Partial<IdeaItem>) => void;
}

export function IdeaChatPanel({ open, onClose, idea, cards, onApplyIdea }: IdeaChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingIdea, setPendingIdea] = useState<Partial<IdeaItem> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (idea) {
      setMessages([
        {
          role: "model",
          content: `**${idea.name}** 아이디어를 더 발전시켜 드릴게요. 어떤 부분을 개선하고 싶으신가요?\n\n예) "타겟을 더 좁혀줘", "수익 모델을 구체화해줘", "경쟁사 대비 차별점 강화"`,
        },
      ]);
      setPendingIdea(null);
    }
  }, [idea?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !idea || isStreaming) return;

    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    const allMessages = [...messages, userMsg];
    let accumulated = "";

    setMessages((prev) => [...prev, { role: "model", content: "" }]);

    try {
      const res = await fetch("/api/ai/idea-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages, ideaContext: idea, cards }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "model", content: accumulated },
        ]);
      }

      // JSON 파싱 시도 (개선된 아이디어 추출)
      const jsonMatch = accumulated.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]) as Partial<IdeaItem>;
          setPendingIdea(parsed);
        } catch {}
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "model", content: "오류가 발생했습니다. 다시 시도해 주세요." },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed right-0 top-14 z-30 flex h-[calc(100vh-56px)] w-96 flex-col border-l bg-background shadow-xl"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h3 className="font-semibold text-sm">AI 아이디어 고도화</h3>
              {idea && <p className="text-xs text-muted-foreground truncate max-w-[260px]">{idea.name}</p>}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* 메시지 목록 */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {msg.content}
                    {i === messages.length - 1 && isStreaming && (
                      <span className="inline-block h-4 w-1 bg-current ml-0.5 animate-pulse" />
                    )}
                  </div>
                </div>
              ))}

              {/* 개선된 아이디어 적용 버튼 */}
              {pendingIdea && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-lg border-2 border-primary/30 bg-primary/5 p-3 space-y-2"
                >
                  <p className="text-xs font-medium text-primary">개선된 아이디어가 준비됐습니다</p>
                  <Button
                    size="sm"
                    className="w-full gap-1.5"
                    onClick={() => { onApplyIdea(pendingIdea); setPendingIdea(null); }}
                  >
                    <CheckCheck className="h-4 w-4" />
                    이 버전 적용하기
                  </Button>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* 입력창 */}
          <div className="border-t p-3">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="아이디어를 어떻게 발전시킬지 말씀해 주세요…"
                rows={2}
                className="resize-none text-sm"
                disabled={isStreaming}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="self-end h-9 w-9 flex-shrink-0"
              >
                {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">Enter로 전송, Shift+Enter로 줄바꿈</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
