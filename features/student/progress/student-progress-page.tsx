"use client";

import { CheckCircle2, Target, TrendingDown, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentShell } from "@/components/student/student-shell";
import { mockStudentProgressWords } from "@/mock/mock-data";

export function StudentProgressPage() {
  const totalWordsPracticed = mockStudentProgressWords.length;
  const correctAnswers = mockStudentProgressWords.reduce(
    (total, word) => total + word.correctCount,
    0,
  );
  const wrongAnswers = mockStudentProgressWords.reduce(
    (total, word) => total + word.wrongCount,
    0,
  );
  const progress = Math.round(
    mockStudentProgressWords.reduce((total, word) => total + word.masteryLevel, 0) /
      mockStudentProgressWords.length,
  );
  const weakWords = mockStudentProgressWords.filter(
    (word) => word.masteryLevel < 60,
  );

  return (
    <StudentShell title="My Progress">
      <div className="flex flex-col gap-4">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={Target}
            label="Total words practiced"
            value={totalWordsPracticed}
          />
          <SummaryCard
            icon={CheckCircle2}
            label="Correct answers"
            value={correctAnswers}
          />
          <SummaryCard
            icon={XCircle}
            label="Wrong answers"
            value={wrongAnswers}
            valueClassName="text-destructive"
          />
          <SummaryCard
            icon={TrendingDown}
            label="Progress"
            value={`${progress}%`}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <Card>
            <CardHeader>
              <CardTitle>Word Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Word</TableHead>
                    <TableHead>Translation</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Answers</TableHead>
                    <TableHead>Last practiced</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStudentProgressWords.map((word) => (
                    <TableRow key={word.id}>
                      <TableCell className="font-medium">{word.term}</TableCell>
                      <TableCell>{word.translation}</TableCell>
                      <TableCell className="min-w-40">
                        <WordProgress value={word.masteryLevel} />
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">{word.correctCount}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          / {word.wrongCount} wrong
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {word.lastPracticedAt}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weak Words</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {weakWords.map((word) => (
                <div key={word.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{word.term}</div>
                      <div className="text-sm text-muted-foreground">
                        {word.translation}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-destructive">
                      {word.masteryLevel}%
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{word.wrongCount} wrong answers</span>
                    <span>{word.lastPracticedAt}</span>
                  </div>
                  <Progress
                    value={word.masteryLevel}
                    className="mt-2 h-2 [&_[data-slot=progress-indicator]]:bg-destructive"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </StudentShell>
  );
}

interface SummaryCardProps {
  icon: typeof Target;
  label: string;
  value: number | string;
  valueClassName?: string;
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  valueClassName,
}: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="size-4" />
          {label}
        </div>
        <div className={`mt-2 text-2xl font-semibold ${valueClassName ?? ""}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

interface WordProgressProps {
  value: number;
}

function WordProgress({ value }: WordProgressProps) {
  const weak = value < 60;

  return (
    <div className="flex items-center gap-3">
      <Progress
        value={value}
        className={
          weak
            ? "h-2 [&_[data-slot=progress-indicator]]:bg-destructive"
            : "h-2"
        }
      />
      <span
        className={
          weak
            ? "w-10 text-right text-sm font-medium text-destructive"
            : "w-10 text-right text-sm font-medium"
        }
      >
        {value}%
      </span>
    </div>
  );
}
