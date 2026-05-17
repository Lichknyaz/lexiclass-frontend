"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpenCheck, GraduationCap, UserRoundCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  createLocalUser,
  getRoleHome,
  getStoredUser,
  storeUser,
  type UserRole,
} from "@/features/auth/auth-session";
import { cn } from "@/utils";

type AuthMode = "login" | "register";

interface AuthFormPageProps {
  mode: AuthMode;
}

export function AuthFormPage({ mode }: AuthFormPageProps) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("teacher");

  useEffect(() => {
    const user = getStoredUser();

    if (user) {
      router.replace(getRoleHome(user.role));
    }
  }, [router]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim() || !password.trim() || (isRegister && !name.trim())) {
      return;
    }

    const user = createLocalUser({
      name: isRegister ? name : "",
      email,
      role,
    });

    storeUser(user);
    router.replace(getRoleHome(user.role));
  };

  return (
    <main className="flex min-h-screen bg-muted/30">
      <section className="hidden min-h-screen flex-1 flex-col justify-between border-r bg-sidebar p-8 text-sidebar-foreground lg:flex">
        <Link href="/" className="flex items-center gap-3 text-xl font-bold">
          <BookOpenCheck className="size-7" />
          LexiClass
        </Link>
        <div className="max-w-xl">
          <div className="text-4xl font-semibold leading-tight">
            Vocabulary practice organized around real classes.
          </div>
          <p className="mt-4 text-sidebar-foreground/70">
            Teachers assign word sets, students practice, and progress becomes
            visible at class and word level.
          </p>
        </div>
      </section>

      <section className="flex min-h-screen flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Link
              href="/"
              className="mb-3 flex items-center gap-2 text-lg font-bold lg:hidden"
            >
              <BookOpenCheck className="size-6" />
              LexiClass
            </Link>
            <CardTitle className="text-2xl">
              {isRegister ? "Create account" : "Log in"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {isRegister
                ? "Choose your role and create a local MVP account."
                : "Use any email and password to enter the MVP prototype."}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {isRegister && (
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
              </Field>

              <div className="grid gap-3">
                <div className="text-sm font-medium">Role</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <RoleButton
                    active={role === "teacher"}
                    icon={UserRoundCheck}
                    label="Teacher"
                    onClick={() => setRole("teacher")}
                  />
                  <RoleButton
                    active={role === "student"}
                    icon={GraduationCap}
                    label="Student"
                    onClick={() => setRole("student")}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={
                  !email.trim() ||
                  !password.trim() ||
                  (isRegister && !name.trim())
                }
              >
                {isRegister ? "Create Account" : "Log In"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                {isRegister ? "Already have an account?" : "Need an account?"}{" "}
                <Link
                  href={isRegister ? "/login" : "/register"}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {isRegister ? "Log in" : "Register"}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

interface RoleButtonProps {
  active: boolean;
  icon: typeof UserRoundCheck;
  label: string;
  onClick: () => void;
}

function RoleButton({ active, icon: Icon, label, onClick }: RoleButtonProps) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      className={cn("justify-start", active && "border-primary")}
      onClick={onClick}
    >
      <Icon className="size-4" />
      {label}
    </Button>
  );
}
