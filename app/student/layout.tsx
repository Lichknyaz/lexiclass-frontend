import { AuthGuard } from "@/features/auth/auth-guard";

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthGuard requiredRole="student">{children}</AuthGuard>;
}
