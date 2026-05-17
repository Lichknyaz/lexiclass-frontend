"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, FolderOpen, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { Sidebar } from "@/components/dashboard/sidebar";
import type { MockWordSetSummary } from "@/types/mock";
import { wordSetsService } from "@/services";
import { getErrorMessage } from "@/utils";

interface TeacherWordSetsPageProps {
  wordSets: MockWordSetSummary[];
}

export function TeacherWordSetsPage({ wordSets }: TeacherWordSetsPageProps) {
  const [currentWordSets, setCurrentWordSets] = useState(wordSets);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreateWordSet = async (input: CreateWordSetInput) => {
    const createdWordSet = await wordSetsService.createWordSet(input);

    setCurrentWordSets((currentItems) => [...currentItems, createdWordSet]);
    setCreateDialogOpen(false);
  };

  return (
    <div className="flex h-screen">
      <Sidebar className="hidden lg:flex" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <MobileSidebar />
            <h1 className="text-xl font-semibold">Word Sets</h1>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="size-4" />
            Create Word Set
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {currentWordSets.length === 0 ? (
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
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="size-4" />
                  Create Word Set
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentWordSets.map((wordSet) => (
                <Card
                  key={wordSet.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-lg">{wordSet.title}</CardTitle>
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

                    <div className="grid">
                      <Button variant="outline" asChild>
                        <Link
                          href={`/teacher/word-sets/${wordSet.id}?from=word-sets`}
                        >
                          Open
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

      <CreateWordSetDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreateWordSet}
      />
    </div>
  );
}

interface CreateWordSetInput {
  title: string;
  description: string;
}

interface CreateWordSetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: CreateWordSetInput) => Promise<void>;
}

function CreateWordSetDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateWordSetDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!title.trim() || !description.trim()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await onCreate({
        title: title.trim(),
        description: description.trim(),
      });
      setTitle("");
      setDescription("");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Could not create word set"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Word Set</DialogTitle>
            <DialogDescription>
              Create a vocabulary set that can be assigned to classes.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            {errorMessage && (
              <div className="rounded-lg border border-destructive/30 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </div>
            )}
            <Field>
              <FieldLabel htmlFor="new-word-set-title">Title</FieldLabel>
              <Input
                id="new-word-set-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g., Travel essentials"
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="new-word-set-description">
                Description
              </FieldLabel>
              <Textarea
                id="new-word-set-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe what this word set covers."
              />
            </Field>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !description.trim() || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Word Set"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
