"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { loginAction, signupAction, type FormState } from "@/lib/actions";
import { LogoMark } from "./Logo";

export default function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "login" ? loginAction : signupAction, undefined);
  const [show, setShow] = useState(false);
  const q = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-16 pt-28">
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-80 w-80 animate-glow rounded-full bg-sea/25 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-10 right-1/4 h-72 w-72 animate-glow rounded-full bg-mint/10 blur-[120px] [animation-delay:3s]" />
      <div className="glass relative w-full max-w-md animate-fade-up rounded-[2rem] border border-white/10 p-8 shadow-2xl sm:p-10">
        <div className="mb-8 text-center">
          <LogoMark className="mx-auto h-14 w-14" />
          <h1 className="mt-5 font-display text-3xl font-bold">{mode === "login" ? "Welcome back" : "Join HeyNovelWorld"}</h1>
          <p className="mt-2 text-sm text-mist">
            {mode === "login" ? "Log in to continue your reading journey." : "Create a free account to save your library and progress."}
          </p>
        </div>
        <form action={action} className="grid gap-4">
          {next && <input type="hidden" name="next" value={next} />}
          {mode === "signup" && (
            <label className="relative block">
              <span className="sr-only">Name</span>
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-sea" />
              <input name="name" required minLength={2} placeholder="Your name" autoComplete="name" className="input !pl-11" />
            </label>
          )}
          <label className="relative block">
            <span className="sr-only">Email</span>
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-sea" />
            <input name="email" type="email" required placeholder="Email address" autoComplete="email" className="input !pl-11" />
          </label>
          <label className="relative block">
            <span className="sr-only">Password</span>
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-sea" />
            <input
              name="password"
              type={show ? "text" : "password"}
              required
              minLength={mode === "signup" ? 8 : 1}
              placeholder={mode === "signup" ? "Password (min. 8 characters)" : "Password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="input !pl-11 !pr-11"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-mist hover:text-white" aria-label="Toggle password visibility">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </label>
          {state?.error && <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{state.error}</p>}
          <button disabled={pending} className="btn-primary mt-2 w-full !py-3.5">
            {pending && <Loader2 size={18} className="animate-spin" />}
            {mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-mist">
          {mode === "login" ? (
            <>New to HeyNovelWorld? <Link href={`/signup${q}`} className="font-semibold text-mint hover:underline">Sign up free</Link></>
          ) : (
            <>Already have an account? <Link href={`/login${q}`} className="font-semibold text-mint hover:underline">Log in</Link></>
          )}
        </p>
        <p className="mt-4 text-center text-xs text-mist/60">
          No account needed to read — <Link href="/explore" className="underline hover:text-mint">browse as a guest</Link>.
        </p>
      </div>
    </div>
  );
}
