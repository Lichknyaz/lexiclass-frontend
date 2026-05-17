"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Play, Target, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { getMockWordSetDetails } from "@/mock/mock-data";
import type { MockStudentWordSet } from "@/types/mock";

interface StudentWordSetDetailsPageProps {
  wordSet: MockStudentWordSet;
}

export function StudentWordSetDetailsPage({
  wordSet,
}: StudentWordSetDetailsPageProps) {
  const teacherWordSet =
    getMockWordSetDetails(wordSet.id) ?? getMockWordSetDetails("w1");
  const words = teacherWordSet?.wordsList ?? [];
  const weakWords = words.filter((word) => word.masteryLevel < 60);

  return (
    <StudentShell
      title="Word Set Details"
      action={
        <Button variant="outline" asChild>
          <Link href="/student/dashboard">
            <ArrowLeft className="size-4" />
            Dashboard
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-2xl">{wordSet.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {wordSet.className}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/student/word-sets/${wordSet.id}/practice`}>
                    <Play className="size-4" />
                    Start Practice
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/student/word-sets/${wordSet.id}/practice?mode=weak`}>
                    <TrendingDown className="size-4" />
                    Practice Weak Words
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <SummaryMetric
              icon={Target}
              label="Progress"
              value={`${wordSet.progress}%`}
            />
            <SummaryMetric
              icon={BookOpen}
              label="Words practiced"
              value={`${wordSet.completedWords} / ${wordSet.words}`}
            />
            <SummaryMetric
              icon={TrendingDown}
              label="Weak words"
              value={weakWords.length}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Words</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Term</TableHead>
                  <TableHead>Translation</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Last practiced</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {words.map((word, index) => (
                  <TableRow key={word.id}>
                    <TableCell className="font-medium">{word.term}</TableCell>
                    <TableCell>{word.translation}</TableCell>
                    <TableCell className="min-w-40">
                      <div className="flex items-center gap-3">
                        <Progress value={word.masteryLevel} className="h-2" />
                        <span className="w-10 text-right text-sm font-medium">
                          {word.masteryLevel}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getLastPracticedLabel(index)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </StudentShell>
  );
}

interface SummaryMetricProps {
  icon: typeof BookOpen;
  label: string;
  value: number | string;
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

function getLastPracticedLabel(index: number) {
  const labels = ["Today", "Yesterday", "2 days ago", "Not practiced yet"];

  return labels[index % labels.length];
}
