"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RotateCcw, Check, X, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { IdeaItem } from "@/types/api";
import { Card } from "@/types";

interface EditableFieldProps {
  fieldKey: string;
  label: string;
  value: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  idea: IdeaItem;
  cards: Card[];
  templateType: string;
  onChange: (value: string) => void;
  className?: string;
}

const MAX_UNDO = 20;

export function EditableField({
  fieldKey,
  label,
  value,
  placeholder,
  multiline = true,
  rows = 3,
  idea,
  cards,
  templateType,
  onChange,
  className,
}: EditableFieldProps) {
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDiffView, setIsDiffView] = useState(false);
  const [diffCandidate, setDiffCandidate] = useState<string | null>(null);
  const [selectionBubble, setSelectionBubble] = useState<{
    text: string;
    start: number;
    end: number;
    x: number;
    y: number;
  } | null>(null);
  const [inlineResult, setInlineResult] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && document.activeElement === textareaRef.current) {
        e.preventDefault();
        handleUndo();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  function pushUndo(prev: string) {
    setUndoStack((s) => [...s.slice(-MAX_UNDO + 1), prev]);
  }

  function handleUndo() {
    if (!undoStack.length) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    onChange(prev);
  }

  async function handleAIDraft() {
    setIsGenerating(true);
    let accumulated = "";
    try {
      const res = await fetch("/api/ai/template-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldKey, templateType, idea, cards }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        pushUndo(value ? accumulated.slice(0, -accumulated.length) : "");
        onChange(accumulated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleAIRewrite() {
    if (!value.trim()) return;
    setIsGenerating(true);
    let accumulated = "";
    try {
      const res = await fetch("/api/ai/rewrite-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldKey, currentValue: value, templateType, idea, cards }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      while (reader) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(chunk, { stream: true });
        setDiffCandidate(accumulated);
      }
      setIsDiffView(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }

  function acceptRewrite() {
    if (diffCandidate !== null) {
      pushUndo(value);
      onChange(diffCandidate);
    }
    setIsDiffView(false);
    setDiffCandidate(null);
  }

  function rejectRewrite() {
    setIsDiffView(false);
    setDiffCandidate(null);
  }

  function handleMouseUp() {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart, selectionEnd } = ta;
    if (selectionStart === selectionEnd) {
      setSelectionBubble(null);
      setInlineResult(null);
      return;
    }
    const selected = ta.value.slice(selectionStart, selectionEnd);
    const rect = ta.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    setSelectionBubble({
      text: selected,
      start: selectionStart,
      end: selectionEnd,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 40,
    });
    setInlineResult(null);
  }

  async function handleInlineRewrite() {
    if (!selectionBubble) return;
    setIsGenerating(true);
    let accumulated = "";
    try {
      const res = await fetch("/api/ai/rewrite-inline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedText: selectionBubble.text, fieldKey, idea, cards }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      while (reader) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(chunk, { stream: true });
        setInlineResult(accumulated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }

  function applyInline() {
    if (!selectionBubble || inlineResult === null) return;
    pushUndo(value);
    const newValue =
      value.slice(0, selectionBubble.start) + inlineResult + value.slice(selectionBubble.end);
    onChange(newValue);
    setSelectionBubble(null);
    setInlineResult(null);
  }

  const isEmpty = !value.trim();
  const canUndo = undoStack.length > 0;

  return (
    <div ref={containerRef} className={cn("group relative space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canUndo && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleUndo}
              title="실행 취소 (Ctrl+Z)"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          )}
          {isEmpty ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 text-xs px-2 text-primary"
              onClick={handleAIDraft}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              AI 초안
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 text-xs px-2"
              onClick={handleAIRewrite}
              disabled={isGenerating}
            >
              {isGenerating && !isDiffView ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
              AI 개선
            </Button>
          )}
        </div>
      </div>

      {/* Diff view */}
      <AnimatePresence>
        {isDiffView && diffCandidate !== null && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg border-2 border-primary/30 bg-primary/5 p-3 space-y-2"
          >
            <p className="text-xs font-medium text-primary">AI 개선안</p>
            <p className="text-sm whitespace-pre-wrap">{diffCandidate}</p>
            <div className="flex gap-2">
              <Button size="sm" className="gap-1.5 h-7 text-xs" onClick={acceptRewrite}>
                <Check className="h-3 w-3" />
                적용
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={rejectRewrite}>
                <X className="h-3 w-3" />
                취소
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text area */}
      {!isDiffView && (
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              pushUndo(value);
              onChange(e.target.value);
            }}
            onMouseUp={handleMouseUp}
            placeholder={placeholder}
            rows={rows}
            className={cn(
              "resize-none text-sm transition-colors",
              isGenerating && "opacity-70",
              isEmpty && "border-dashed"
            )}
            disabled={isGenerating}
          />
          {isGenerating && isEmpty && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
        </div>
      )}

      {/* Inline rewrite bubble */}
      <AnimatePresence>
        {selectionBubble && !isDiffView && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-20 bg-popover border rounded-lg shadow-lg p-2 space-y-2"
            style={{ left: selectionBubble.x - 80, top: selectionBubble.y }}
          >
            {inlineResult === null ? (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 h-7 text-xs whitespace-nowrap"
                onClick={handleInlineRewrite}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                선택 영역 AI 개선
              </Button>
            ) : (
              <div className="space-y-1.5 max-w-[200px]">
                <p className="text-xs text-muted-foreground">개선안:</p>
                <p className="text-xs whitespace-pre-wrap">{inlineResult}</p>
                <div className="flex gap-1">
                  <Button size="sm" className="gap-1 h-6 text-xs flex-1" onClick={applyInline}>
                    <Check className="h-3 w-3" />
                    적용
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs px-2"
                    onClick={() => { setSelectionBubble(null); setInlineResult(null); }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
