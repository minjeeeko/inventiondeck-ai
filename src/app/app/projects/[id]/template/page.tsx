"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, Save, CheckCircle2 } from "lucide-react";
import { ProjectStepper } from "@/components/layout/ProjectStepper";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/stores/projectStore";
import { IdeaDefinitionTemplate } from "@/components/templates/IdeaDefinitionTemplate";
import { IdeaCanvasTemplate } from "@/components/templates/IdeaCanvasTemplate";
import { SolutionOutlineTemplate } from "@/components/templates/SolutionOutlineTemplate";
import { ValuePropositionTemplate } from "@/components/templates/ValuePropositionTemplate";
import { BusinessModelCanvasTemplate } from "@/components/templates/BusinessModelCanvasTemplate";
import { BusinessModelNarrativesTemplate } from "@/components/templates/BusinessModelNarrativesTemplate";
import { cn } from "@/lib/utils";

const TEMPLATES = [
  { id: "idea_definition", label: "아이디어 정의서", fields: ["tagline", "elevator_pitch", "headline", "twitter_summary", "investor_one_liner", "problem_statement", "solution_statement"] },
  { id: "idea_canvas", label: "아이디어 캔버스", fields: ["problem", "existing_alternatives", "unique_value", "unfair_advantage", "solution", "key_metrics", "channels", "customer_segments", "cost_structure", "revenue_streams"] },
  { id: "solution_outline", label: "솔루션 아웃라인", fields: ["feature_1_name", "feature_1_desc", "feature_2_name", "feature_2_desc", "feature_3_name", "feature_3_desc", "tech_stack", "mvp_scope"] },
  { id: "value_proposition", label: "가치 제안 캔버스", fields: ["customer_jobs", "customer_pains", "customer_gains", "products_services", "pain_relievers", "gain_creators"] },
  { id: "business_model_canvas", label: "비즈니스 모델 캔버스", fields: ["key_partners", "key_activities", "key_resources", "value_propositions", "customer_relationships", "channels", "customer_segments", "cost_structure", "revenue_streams"] },
  { id: "business_model_narratives", label: "비즈니스 내러티브", fields: ["origin_story", "market_opportunity", "go_to_market", "competitive_moat", "vision"] },
];

export default function TemplatePage({ params }: { params: { id: string } }) {
  const { selectedCards, selectedIdea, templateData, activeTemplate, setTemplateField, setActiveTemplate } =
    useProjectStore();

  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentTemplateConfig = TEMPLATES.find((t) => t.id === activeTemplate)!;
  const currentData = templateData[activeTemplate] ?? {};

  function getCompletionCount(templateId: string) {
    const config = TEMPLATES.find((t) => t.id === templateId);
    if (!config) return 0;
    const data = templateData[templateId] ?? {};
    return config.fields.filter((f) => (data[f] ?? "").trim().length > 0).length;
  }

  function handleFieldChange(field: string, value: string) {
    setTemplateField(activeTemplate, field, value);
    triggerAutoSave();
  }

  function triggerAutoSave() {
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      await saveToSupabase();
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 3000);
  }

  async function saveToSupabase() {
    try {
      await fetch(`/api/projects/${params.id}/templates`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templates: templateData }),
      });
    } catch (err) {
      console.error("자동 저장 오류:", err);
    }
  }

  async function handleBulkGenerate() {
    if (!selectedIdea || isBulkGenerating) return;
    setIsBulkGenerating(true);
    setBulkProgress(0);

    const emptyFields = currentTemplateConfig.fields.filter(
      (f) => !(currentData[f] ?? "").trim()
    );

    for (let i = 0; i < emptyFields.length; i++) {
      const fieldKey = emptyFields[i];
      let accumulated = "";
      try {
        const res = await fetch("/api/ai/template-field", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fieldKey, templateType: activeTemplate, idea: selectedIdea, cards: selectedCards }),
        });
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setTemplateField(activeTemplate, fieldKey, accumulated);
        }
      } catch (err) {
        console.error(`필드 ${fieldKey} 생성 오류:`, err);
      }
      setBulkProgress(Math.round(((i + 1) / emptyFields.length) * 100));
    }

    setIsBulkGenerating(false);
    triggerAutoSave();
  }

  if (!selectedIdea) {
    return (
      <div className="flex h-[calc(100vh-56px)] flex-col">
        <ProjectStepper currentStep={3} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">선택된 아이디어가 없습니다.</p>
            <Link href={`/app/projects/${params.id}/idea`}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                아이디어 선택으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const emptyCount = currentTemplateConfig.fields.filter((f) => !(currentData[f] ?? "").trim()).length;

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col">
      <ProjectStepper currentStep={3} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-64 border-r bg-muted/20 flex-shrink-0 overflow-y-auto p-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">
            템플릿 선택
          </p>
          {TEMPLATES.map((t) => {
            const done = getCompletionCount(t.id);
            const total = t.fields.length;
            const pct = Math.round((done / total) * 100);
            const isActive = activeTemplate === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTemplate(t.id)}
                className={cn(
                  "w-full rounded-lg px-3 py-2.5 text-left transition-colors space-y-1.5",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/60 text-foreground"
                )}
              >
                <p className="text-sm font-medium leading-tight">{t.label}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", isActive ? "bg-primary" : "bg-muted-foreground/40")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{done}/{total}</span>
                </div>
              </button>
            );
          })}

          <div className="pt-4 border-t mt-4">
            <Link href={`/app/projects/${params.id}/deck`}>
              <Button size="sm" className="w-full gap-2">
                <Sparkles className="h-4 w-4" />
                피치덱 생성
              </Button>
            </Link>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-6 py-8">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/app/projects/${params.id}/idea`}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    아이디어 변경
                  </Link>
                </div>
                <h1 className="text-xl font-bold">{currentTemplateConfig.label}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">{selectedIdea.name}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {saveStatus === "saving" && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    저장 중…
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    저장됨
                  </span>
                )}
                {emptyCount > 0 && (
                  <Button
                    onClick={handleBulkGenerate}
                    disabled={isBulkGenerating}
                    className="gap-2"
                  >
                    {isBulkGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {bulkProgress}% 생성 중…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        전체 AI 초안 작성 ({emptyCount}개)
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Progress bar for bulk generation */}
            {isBulkGenerating && (
              <div className="mb-6 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${bulkProgress}%` }}
                />
              </div>
            )}

            {/* Template content */}
            {activeTemplate === "idea_definition" && (
              <IdeaDefinitionTemplate
                data={currentData}
                idea={selectedIdea}
                cards={selectedCards}
                onChange={handleFieldChange}
              />
            )}
            {activeTemplate === "idea_canvas" && (
              <IdeaCanvasTemplate
                data={currentData}
                idea={selectedIdea}
                cards={selectedCards}
                onChange={handleFieldChange}
              />
            )}
            {activeTemplate === "solution_outline" && (
              <SolutionOutlineTemplate
                data={currentData}
                idea={selectedIdea}
                cards={selectedCards}
                onChange={handleFieldChange}
              />
            )}
            {activeTemplate === "value_proposition" && (
              <ValuePropositionTemplate
                data={currentData}
                idea={selectedIdea}
                cards={selectedCards}
                onChange={handleFieldChange}
              />
            )}
            {activeTemplate === "business_model_canvas" && (
              <BusinessModelCanvasTemplate
                data={currentData}
                idea={selectedIdea}
                cards={selectedCards}
                onChange={handleFieldChange}
              />
            )}
            {activeTemplate === "business_model_narratives" && (
              <BusinessModelNarrativesTemplate
                data={currentData}
                idea={selectedIdea}
                cards={selectedCards}
                onChange={handleFieldChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
