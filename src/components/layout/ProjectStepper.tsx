import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { label: "카드 선택", description: "아이디어 재료" },
  { label: "아이디어 생성", description: "AI 분석" },
  { label: "문서 작성", description: "사업계획서" },
  { label: "피치덱 생성", description: "발표 자료" },
];

interface ProjectStepperProps {
  currentStep: number; // 1-based
}

export function ProjectStepper({ currentStep }: ProjectStepperProps) {
  return (
    <div className="border-b bg-background px-4 py-3">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="진행 단계">
          <ol className="flex items-center gap-0">
            {STEPS.map((step, i) => {
              const stepNum = i + 1;
              const isDone = stepNum < currentStep;
              const isActive = stepNum === currentStep;

              return (
                <li key={step.label} className="flex flex-1 items-center">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* 스텝 번호 */}
                    <div
                      className={cn(
                        "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                        isDone
                          ? "bg-primary text-primary-foreground"
                          : isActive
                          ? "border-2 border-primary text-primary"
                          : "border-2 border-muted-foreground/30 text-muted-foreground"
                      )}
                    >
                      {isDone ? <Check className="h-3.5 w-3.5" /> : stepNum}
                    </div>
                    {/* 레이블 */}
                    <div className="hidden sm:block min-w-0">
                      <p
                        className={cn(
                          "truncate text-xs font-medium",
                          isActive ? "text-foreground" : isDone ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {/* 연결선 */}
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "mx-2 flex-1 h-px",
                        isDone ? "bg-primary" : "bg-muted-foreground/20"
                      )}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
