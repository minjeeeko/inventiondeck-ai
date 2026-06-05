"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "패스워드 불일치", description: "패스워드를 다시 확인해 주세요.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      toast({ title: "회원가입 실패", description: error.message, variant: "destructive" });
    } else {
      setDone(true);
    }
    setLoading(false);
  }

  async function handleGoogleSignup() {
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      toast({ title: "Google 회원가입 실패", description: error.message, variant: "destructive" });
      setGoogleLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-bold">
            ID
          </div>
          <h1 className="text-2xl font-bold tracking-tight">InventionDeck AI</h1>
          <p className="mt-1 text-sm text-muted-foreground">AI로 아이디어를 발굴하고 사업계획을 완성하세요</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">회원가입</CardTitle>
            <CardDescription>새 계정을 만들어 시작하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {done ? (
              <div className="rounded-lg bg-muted p-4 text-center text-sm">
                <p className="font-medium">확인 이메일을 보냈습니다 ✉️</p>
                <p className="mt-1 text-muted-foreground">
                  <strong>{email}</strong> 받은편지함을 확인하고 링크를 클릭해 주세요.
                </p>
              </div>
            ) : (
              <>
                <Button variant="outline" className="w-full gap-2" onClick={handleGoogleSignup} disabled={googleLoading}>
                  <GoogleIcon />
                  {googleLoading ? "연결 중…" : "Google로 계속하기"}
                </Button>

                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">또는</span>
                  <Separator className="flex-1" />
                </div>

                <form onSubmit={handleSignup} className="space-y-3">
                  <Input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                  <Input type="password" placeholder="패스워드 (8자 이상)" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
                  <Input type="password" placeholder="패스워드 확인" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "가입 중…" : "이메일로 회원가입"}
                  </Button>
                </form>
              </>
            )}

            <p className="text-center text-sm text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                로그인
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
