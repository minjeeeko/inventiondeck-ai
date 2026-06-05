import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AppPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 가장 최근 프로젝트 조회
  const { data: projects } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (projects && projects.length > 0) {
    // 기존 프로젝트 → 카드 선택 화면으로
    redirect(`/app/projects/${projects[0].id}/cards`);
  }

  // 프로젝트 없으면 새 프로젝트 자동 생성
  const { data: newProject, error } = await supabase
    .from("projects")
    .insert({ user_id: user.id, name: "새 프로젝트", stage: 1 })
    .select("id")
    .single();

  if (error || !newProject) {
    // Supabase 미연결 상태(개발 환경) → 임시 ID로 카드 화면 진입
    redirect("/app/projects/demo/cards");
  }

  redirect(`/app/projects/${newProject.id}/cards`);
}
