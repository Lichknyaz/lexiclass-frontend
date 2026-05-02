"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BarChart3, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

const navItems = [
  { icon: BookOpen, label: "Classes", href: "/teacher/dashboard" },
  { icon: BarChart3, label: "Analytics", href: "/teacher/analytics" },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-60 flex-col border-r bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/teacher/dashboard" className="text-xl font-bold tracking-tight">
          LexiClass
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map((item) => {
          const active =
            item.href === "/teacher/dashboard"
              ? pathname === "/" ||
                pathname === "/teacher/dashboard" ||
                pathname.startsWith("/teacher/classes") ||
                pathname.startsWith("/teacher/word-sets")
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <LogOut className="size-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
