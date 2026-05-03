"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ListChecks,
  Plus,
  Target,
  Users,
} from "lucide-react";
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
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { Sidebar } from "@/components/dashboard/sidebar";
import { mockClasses } from "@/mock/mock-data";
import type { MockClassSummary, MockWord, MockWordSetDetails } from "@/types/mock";
import { getAverage } from "@/utils";

interface WordSetDetailsPageProps {
  wordSet: MockWordSetDetails;
  backHref: string;
  backLabel: string;
}

export function WordSetDetailsPage({
  wordSet,
  backHref,
  backLabel,
}: WordSetDetailsPageProps) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [addWordDialogOpen, setAddWordDialogOpen] = useState(false);
  const [words, setWords] = useState<MockWord[]>(wordSet.wordsList);
  const [assignedClasses, setAssignedClasses] = useState<MockClassSummary[]>(
    mockClasses.filter((classItem) => classItem.id === wordSet.classId),
  );

  const averageMastery = getAverage(words.map((word) => word.masteryLevel));
  const problemWordsCount = words.filter(
    (word) => word.masteryLevel < 60,
  ).length;
  const availableClasses = mockClasses.filter(
    (classItem) =>
      !assignedClasses.some(
        (assignedClass) => assignedClass.id === classItem.id,
      ),
  );

  const handleAssignClass = (classItem: MockClassSummary) => {
    setAssignedClasses((currentClasses) => [...currentClasses, classItem]);
    setAssignDialogOpen(false);
  };

  const handleAddWord = (word: NewWordInput) => {
    setWords((currentWords) => [
      ...currentWords,
      {
        id: Date.now().toString(),
        term: word.term,
        translation: word.translation,
        exampleSentence: word.exampleSentence,
        masteryLevel: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
      },
    ]);
  };

  return (
    <div className="flex h-screen">
      <Sidebar className="hidden lg:flex" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <MobileSidebar />
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href={backHref}>
                <ArrowLeft className="size-4" />
                <span className="sr-only">{backLabel}</span>
              </Link>
            </Button>
            <h1 className="truncate text-xl font-semibold">{wordSet.title}</h1>
          </div>
          <Button onClick={() => setAssignDialogOpen(true)}>
            <Plus className="size-4" />
            Assign to Class
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="flex flex-col gap-4">
            <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle className="text-2xl">
                        {wordSet.title}
                      </CardTitle>
                      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        {wordSet.description}
                      </p>
                    </div>
                    <Badge variant="secondary">{wordSet.className}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <SummaryMetric
                    icon={BookOpen}
                    label="Words"
                    value={words.length}
                  />
                  <SummaryMetric
                    icon={ListChecks}
                    label="Assigned classes"
                    value={assignedClasses.length}
                  />
                  <SummaryMetric
                    icon={Target}
                    label="Problem words"
                    value={problemWordsCount}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Set Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="text-3xl font-semibold">
                        {averageMastery}%
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        average mastery
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      Created
                      <div className="font-medium text-foreground">
                        {wordSet.createdAt}
                      </div>
                    </div>
                  </div>
                  <Progress value={averageMastery} className="mt-4 h-2" />
                </CardContent>
              </Card>
            </section>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle>Words</CardTitle>
                <Button size="sm" onClick={() => setAddWordDialogOpen(true)}>
                  <Plus className="size-4" />
                  Add Word
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Term</TableHead>
                      <TableHead>Translation</TableHead>
                      <TableHead>Example</TableHead>
                      <TableHead>Mastery</TableHead>
                      <TableHead className="text-right">Answers</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {words.map((word) => (
                      <TableRow key={word.id}>
                        <TableCell className="font-medium">
                          {word.term}
                        </TableCell>
                        <TableCell>{word.translation}</TableCell>
                        <TableCell className="max-w-80 text-muted-foreground">
                          <span className="line-clamp-2">
                            {word.exampleSentence}
                          </span>
                        </TableCell>
                        <TableCell className="min-w-36">
                          <div className="flex items-center gap-3">
                            <Progress
                              value={word.masteryLevel}
                              className="h-2"
                            />
                            <span className="w-10 text-right text-sm font-medium">
                              {word.masteryLevel}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">
                            {word.correctAnswers}
                          </span>
                          <span className="text-muted-foreground">
                            {" "}
                            / {word.wrongAnswers} wrong
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <AssignClassDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        availableClasses={availableClasses}
        assignedClasses={assignedClasses}
        onAssign={handleAssignClass}
      />
      <AddWordDialog
        open={addWordDialogOpen}
        onOpenChange={setAddWordDialogOpen}
        onAddWord={handleAddWord}
      />
    </div>
  );
}

interface SummaryMetricProps {
  icon: typeof BookOpen;
  label: string;
  value: number;
}

function SummaryMetric({ icon: Icon, label, value }: SummaryMetricProps) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

interface NewWordInput {
  term: string;
  translation: string;
  exampleSentence: string;
}

interface AssignClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableClasses: MockClassSummary[];
  assignedClasses: MockClassSummary[];
  onAssign: (classItem: MockClassSummary) => void;
}

function AssignClassDialog({
  open,
  onOpenChange,
  availableClasses,
  assignedClasses,
  onAssign,
}: AssignClassDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Word Set to Class</DialogTitle>
          <DialogDescription>
            Choose a class that should practice this word set.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="rounded-lg border bg-muted/40 p-4">
            <div className="text-sm font-medium">Assigned classes</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {assignedClasses.map((classItem) => (
                <Badge key={classItem.id} variant="secondary">
                  {classItem.name}
                </Badge>
              ))}
            </div>
          </div>

          {availableClasses.length === 0 ? (
            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              This word set is already assigned to every class.
            </div>
          ) : (
            <div className="grid gap-3">
              {availableClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-medium">{classItem.name}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-4" />
                        {classItem.students} students
                      </span>
                      <span>{classItem.wordSets} word sets</span>
                      <span>{classItem.progress}% progress</span>
                    </div>
                  </div>
                  <Button onClick={() => onAssign(classItem)}>
                    <Plus className="size-4" />
                    Assign
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface AddWordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWord: (word: NewWordInput) => void;
}

function AddWordDialog({
  open,
  onOpenChange,
  onAddWord,
}: AddWordDialogProps) {
  const [term, setTerm] = useState("");
  const [translation, setTranslation] = useState("");
  const [exampleSentence, setExampleSentence] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!term.trim() || !translation.trim()) {
      return;
    }

    onAddWord({
      term: term.trim(),
      translation: translation.trim(),
      exampleSentence: exampleSentence.trim(),
    });
    setTerm("");
    setTranslation("");
    setExampleSentence("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Word</DialogTitle>
            <DialogDescription>
              Add a term, translation, and optional example sentence.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            <Field>
              <FieldLabel htmlFor="word-term">Term</FieldLabel>
              <Input
                id="word-term"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="e.g., appointment"
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="word-translation">Translation</FieldLabel>
              <Input
                id="word-translation"
                value={translation}
                onChange={(event) => setTranslation(event.target.value)}
                placeholder="e.g., scheduled meeting"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="word-example">Example Sentence</FieldLabel>
              <Textarea
                id="word-example"
                value={exampleSentence}
                onChange={(event) => setExampleSentence(event.target.value)}
                placeholder="Use the word in a short sentence."
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
            <Button type="submit" disabled={!term.trim() || !translation.trim()}>
              Add Word
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
