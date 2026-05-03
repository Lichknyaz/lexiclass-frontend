"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, GraduationCap, LogOut, PlusCircle } from "lucide-react";
import { cn } from "@/utils";

const navItems = [
  { icon: BookOpen, label: "Word Sets", href: "/student/dashboard" },
  { icon: PlusCircle, label: "Join Class", href: "/student/join-class" },
  { icon: BarChart3, label: "Progress", href: "/student/progress" },
];

interface StudentShellProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function StudentShell({ title, action, children }: StudentShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      <aside className="hidden h-full w-60 flex-col border-r bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/student/dashboard" className="text-xl font-bold tracking-tight">
            LexiClass
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map((item) => {
            const active =
              item.href === "/student/dashboard"
                ? pathname === "/student/dashboard" ||
                  pathname.startsWith("/student/word-sets")
                : pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <button className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="size-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <GraduationCap className="size-5 lg:hidden" />
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
          {action}
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b bg-background px-3 py-2 lg:hidden">
          {navItems.map((item) => {
            const active =
              item.href === "/student/dashboard"
                ? pathname === "/student/dashboard" ||
                  pathname.startsWith("/student/word-sets")
                : pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
