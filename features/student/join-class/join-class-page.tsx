"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { StudentShell } from "@/components/student/student-shell";

export function JoinClassPage() {
  const [inviteCode, setInviteCode] = useState("");
  const [joinedClassName, setJoinedClassName] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!inviteCode.trim()) {
      return;
    }

    setJoinedClassName("English A2");
  };

  return (
    <StudentShell title="Join Class">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        {joinedClassName && (
          <Alert>
            <CheckCircle2 className="size-4" />
            <AlertTitle>Class joined</AlertTitle>
            <AlertDescription>
              You joined {joinedClassName}. New word sets are now available on
              your dashboard.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Enter Invite Code</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="invite-code">Invite code</FieldLabel>
                <Input
                  id="invite-code"
                  value={inviteCode}
                  onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                  placeholder="A2-7KQ9"
                  className="font-mono tracking-wide"
                />
              </Field>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" asChild>
                  <Link href="/student/dashboard">Back to Dashboard</Link>
                </Button>
                <Button type="submit" disabled={!inviteCode.trim()}>
                  Join Class
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </StudentShell>
  );
}
