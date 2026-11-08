import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Log In" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/library");
  return <AuthForm mode="login" next={next} />;
}
