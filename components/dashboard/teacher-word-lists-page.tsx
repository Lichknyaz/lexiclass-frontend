"use client";

import Link from "next/link";
import { BookOpen, Edit, FolderOpen, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { Sidebar } from "@/components/dashboard/sidebar";
import { mockWordSetSummaries } from "@/lib/mock-data";

export function TeacherWordSetsPage() {
  const wordSets = mockWordSetSummaries;

  return (
    <div className="flex h-screen">
      <Sidebar className="hidden lg:flex" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <MobileSidebar />
            <h1 className="text-xl font-semibold">Word Sets</h1>
          </div>
          <Button>
            <Plus className="size-4" />
            Create Word Set
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {wordSets.length === 0 ? (
            <Empty className="h-full border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BookOpen />
                </EmptyMedia>
                <EmptyTitle>No word sets yet</EmptyTitle>
                <EmptyDescription>
                  Create your first word set to assign vocabulary practice to
                  classes.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button>
                  <Plus className="size-4" />
                  Create Word Set
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {wordSets.map((wordSet) => (
                <Card
                  key={wordSet.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-lg">
                        {wordSet.title}
                      </CardTitle>
                      <Badge variant="outline">{wordSet.words} words</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <p className="min-h-10 text-sm text-muted-foreground">
                      {wordSet.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FolderOpen className="size-4" />
                      <span>{wordSet.assignedClasses} assigned classes</span>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <Button variant="outline" asChild>
                        <Link href={`/teacher/word-sets/${wordSet.id}?from=word-sets`}>
                          Open
                        </Link>
                      </Button>
                      <Button variant="secondary" asChild>
                        <Link href={`/teacher/word-sets/${wordSet.id}?from=word-sets`}>
                          <Edit className="size-4" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
