import { createClient } from "@/lib/supabase/server";

export default async function AppPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold">내 프로젝트</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {user?.email} 님의 프로젝트 목록
      </p>
      <div className="mt-8 rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        아직 프로젝트가 없습니다. 새 프로젝트를 만들어 보세요.
      </div>
    </div>
  );
}
