"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookText,
  Check,
  Copy,
  Plus,
  TrendingDown,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { Sidebar } from "@/components/dashboard/sidebar";
import {
  mockWordSetSummaries,
  type MockClassDetails,
  type MockWordSet,
  type MockWordSetSummary,
} from "@/lib/mock-data";

interface ClassDetailsPageProps {
  classDetails: MockClassDetails;
}

export function ClassDetailsPage({ classDetails }: ClassDetailsPageProps) {
  const [copied, setCopied] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignedWordSets, setAssignedWordSets] = useState<MockWordSet[]>(
    classDetails.wordSetsList,
  );

  const availableWordSets = mockWordSetSummaries.filter(
    (wordSet) =>
      !assignedWordSets.some(
        (assignedWordSet) =>
          assignedWordSet.id === `${classDetails.id}-${wordSet.id}` ||
          assignedWordSet.id === wordSet.id,
      ),
  );

  const totalWrongAnswers = useMemo(
    () =>
      classDetails.problemWords.reduce(
        (total, word) => total + word.wrongAnswers,
        0,
      ),
    [classDetails.problemWords],
  );

  const handleCopyInviteCode = async () => {
    await navigator.clipboard.writeText(classDetails.inviteCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const handleAssignWordSet = (wordSet: MockWordSetSummary) => {
    const assignedWordSet: MockWordSet = {
      id: `${classDetails.id}-${wordSet.id}`,
      classId: classDetails.id,
      title: wordSet.title,
      description: wordSet.description,
      words: wordSet.words,
      assignedStudents: classDetails.students,
      averageProgress: 0,
    };

    setAssignedWordSets((currentWordSets) => [
      ...currentWordSets,
      assignedWordSet,
    ]);
    setAssignDialogOpen(false);
  };

  return (
    <div className="flex h-screen">
      <Sidebar className="hidden lg:flex" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <MobileSidebar />
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href="/teacher/classes">
                <ArrowLeft className="size-4" />
                <span className="sr-only">Back to classes</span>
              </Link>
            </Button>
            <h1 className="truncate text-xl font-semibold">
              {classDetails.name}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="flex flex-col gap-4">
            <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <CardTitle className="text-2xl">
                        {classDetails.name}
                      </CardTitle>
                      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        {classDetails.description}
                      </p>
                    </div>
                    <Badge variant="secondary">{classDetails.level}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <SummaryMetric
                    icon={Users}
                    label="Students"
                    value={classDetails.students}
                  />
                  <SummaryMetric
                    icon={BookText}
                    label="Word sets"
                    value={classDetails.wordSets}
                  />
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Class progress
                      </span>
                      <span className="font-medium">
                        {classDetails.progress}%
                      </span>
                    </div>
                    <Progress
                      value={classDetails.progress}
                      className="mt-3 h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Invite Code</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="rounded-lg border bg-muted/40 px-4 py-3 font-mono text-2xl font-semibold tracking-wide">
                    {classDetails.inviteCode}
                  </div>
                  <Button variant="outline" onClick={handleCopyInviteCode}>
                    {copied ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                    {copied ? "Copied" : "Copy Code"}
                  </Button>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
              <Card>
                <CardHeader>
                  <CardTitle>Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead className="text-right">Answers</TableHead>
                        <TableHead>Last practice</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classDetails.studentsList.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {student.email}
                            </div>
                          </TableCell>
                          <TableCell className="min-w-36">
                            <div className="flex items-center gap-3">
                              <Progress
                                value={student.progress}
                                className="h-2"
                              />
                              <span className="w-10 text-right text-sm font-medium">
                                {student.progress}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-medium">
                              {student.correctAnswers}
                            </span>
                            <span className="text-muted-foreground">
                              {" "}
                              / {student.wrongAnswers} wrong
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {student.lastPracticedAt}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <ProblemWordsCard
                problemWords={classDetails.problemWords}
                totalWrongAnswers={totalWrongAnswers}
              />
            </section>

            <section>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <CardTitle>Word Sets</CardTitle>
                  <Button size="sm" onClick={() => setAssignDialogOpen(true)}>
                    <Plus className="size-4" />
                    Assign Word Set
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {assignedWordSets.map((wordSet) => (
                      <Link
                        key={wordSet.id}
                        href={`/teacher/word-sets/${wordSet.id}?from=class`}
                        className="rounded-lg border p-4 transition-colors hover:bg-muted/40"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold">{wordSet.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {wordSet.description}
                            </p>
                          </div>
                          <Badge variant="outline">{wordSet.words} words</Badge>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                          <span>{wordSet.assignedStudents} assigned</span>
                          <span>{wordSet.averageProgress}% avg.</span>
                        </div>
                        <Progress
                          value={wordSet.averageProgress}
                          className="mt-2 h-2"
                        />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>

      <AssignWordSetDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        availableWordSets={availableWordSets}
        onAssign={handleAssignWordSet}
      />
    </div>
  );
}

interface SummaryMetricProps {
  icon: typeof Users;
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

interface ProblemWordsCardProps {
  problemWords: MockClassDetails["problemWords"];
  totalWrongAnswers: number;
}

function ProblemWordsCard({
  problemWords,
  totalWrongAnswers,
}: ProblemWordsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Problem Words</CardTitle>
          <TrendingDown className="size-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="rounded-lg border bg-muted/40 p-4">
          <div className="text-sm text-muted-foreground">
            Wrong answers tracked
          </div>
          <div className="mt-1 text-2xl font-semibold">{totalWrongAnswers}</div>
        </div>

        <div className="flex flex-col gap-3">
          {problemWords.map((word) => {
            const totalAnswers = word.correctAnswers + word.wrongAnswers;
            const wrongRate = Math.round(
              (word.wrongAnswers / totalAnswers) * 100,
            );

            return (
              <div key={word.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{word.term}</div>
                    <div className="text-sm text-muted-foreground">
                      {word.translation}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-destructive/30 text-destructive"
                  >
                    {wrongRate}% wrong
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{word.affectedStudents} students affected</span>
                  <span>{word.wrongAnswers} wrong answers</span>
                </div>
                <Progress
                  value={wrongRate}
                  className="mt-2 h-2 [&_[data-slot=progress-indicator]]:bg-destructive"
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface AssignWordSetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableWordSets: MockWordSetSummary[];
  onAssign: (wordSet: MockWordSetSummary) => void;
}

function AssignWordSetDialog({
  open,
  onOpenChange,
  availableWordSets,
  onAssign,
}: AssignWordSetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Word Set</DialogTitle>
          <DialogDescription>
            Choose an existing word set to assign to this class.
          </DialogDescription>
        </DialogHeader>

        {availableWordSets.length === 0 ? (
          <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            All existing word sets are already assigned to this class.
          </div>
        ) : (
          <div className="grid gap-3">
            {availableWordSets.map((wordSet) => (
              <div
                key={wordSet.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="font-medium">{wordSet.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {wordSet.description}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{wordSet.words} words</Badge>
                    <span>{wordSet.assignedClasses} assigned classes</span>
                  </div>
                </div>
                <Button onClick={() => onAssign(wordSet)}>
                  <Plus className="size-4" />
                  Assign
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
