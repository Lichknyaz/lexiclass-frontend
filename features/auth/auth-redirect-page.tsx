"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpenCheck } from "lucide-react";
import { getRoleHome, getStoredUser } from "@/features/auth/auth-session";

export function AuthRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    router.replace(user ? getRoleHome(user.role) : "/login");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="flex items-center gap-3 text-muted-foreground">
        <BookOpenCheck className="size-5" />
        <span>Opening LexiClass...</span>
      </div>
    </main>
  );
}
