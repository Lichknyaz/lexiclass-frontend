"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpenCheck } from "lucide-react";
import {
  getRouteAccessDecision,
  type UserRole,
} from "@/features/auth/auth-session";
import { authService } from "@/services";

interface AuthGuardProps {
  requiredRole: UserRole;
  children: React.ReactNode;
}

export function AuthGuard({ requiredRole, children }: AuthGuardProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    void authService.getCurrentUser().then((user) => {
      const decision = getRouteAccessDecision(user, requiredRole);

      if (!decision.allowed) {
        router.replace(decision.redirectTo);
        return;
      }

      setAllowed(true);
    });
  }, [requiredRole, router]);

  if (!allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <BookOpenCheck className="size-5" />
          <span>Checking access...</span>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
