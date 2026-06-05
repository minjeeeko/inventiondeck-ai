export default function IdeaPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex h-full items-center justify-center p-8 text-muted-foreground">
      Stage 2: 아이디어 생성 (구현 예정) — 프로젝트 {params.id}
    </div>
  );
}
