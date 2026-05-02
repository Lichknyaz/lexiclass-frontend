"use client";

import { BookOpen, Target, TrendingDown } from "lucide-react";
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
import { mockStudentProgressWords } from "@/lib/mock-data";

export function StudentProgressPage() {
  const averageMastery = Math.round(
    mockStudentProgressWords.reduce((total, word) => total + word.masteryLevel, 0) /
      mockStudentProgressWords.length,
  );
  const problemWords = mockStudentProgressWords.filter(
    (word) => word.masteryLevel < 60,
  );

  return (
    <StudentShell title="My Progress">
      <div className="flex flex-col gap-4">
        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={Target}
            label="Average mastery"
            value={`${averageMastery}%`}
          />
          <SummaryCard
            icon={BookOpen}
            label="Words practiced"
            value={mockStudentProgressWords.length}
          />
          <SummaryCard
            icon={TrendingDown}
            label="Need review"
            value={problemWords.length}
          />
        </section>

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
                  <TableHead>Mastery</TableHead>
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
                      <div className="flex items-center gap-3">
                        <Progress
                          value={word.masteryLevel}
                          className={
                            word.masteryLevel < 60
                              ? "h-2 [&_[data-slot=progress-indicator]]:bg-destructive"
                              : "h-2"
                          }
                        />
                        <span
                          className={
                            word.masteryLevel < 60
                              ? "w-10 text-right text-sm font-medium text-destructive"
                              : "w-10 text-right text-sm font-medium"
                          }
                        >
                          {word.masteryLevel}%
                        </span>
                      </div>
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
      </div>
    </StudentShell>
  );
}

interface SummaryCardProps {
  icon: typeof Target;
  label: string;
  value: number | string;
}

function SummaryCard({ icon: Icon, label, value }: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="size-4" />
          {label}
        </div>
        <div className="mt-2 text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
