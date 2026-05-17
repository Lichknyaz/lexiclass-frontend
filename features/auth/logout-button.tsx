"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authService } from "@/services";

interface LogoutButtonProps {
  className?: string;
  onLogout?: () => void;
}

export function LogoutButton({ className, onLogout }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    onLogout?.();
    router.replace("/login");
  };

  return (
    <button className={className} type="button" onClick={handleLogout}>
      <LogOut className="size-5" />
      Logout
    </button>
  );
}
