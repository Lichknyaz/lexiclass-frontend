import { AuthGuard } from "@/features/auth/auth-guard";

export default function TeacherLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthGuard requiredRole="teacher">{children}</AuthGuard>;
}
