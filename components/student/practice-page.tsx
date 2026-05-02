"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, RotateCw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StudentShell } from "@/components/student/student-shell";
import { getMockWordSetDetails, type MockStudentWordSet } from "@/lib/mock-data";

interface PracticePageProps {
  wordSet: MockStudentWordSet;
}

export function PracticePage({ wordSet }: PracticePageProps) {
  const words = useMemo(() => {
    const teacherSet = getMockWordSetDetails(wordSet.id);
    return teacherSet?.wordsList ?? getMockWordSetDetails("w1")?.wordsList ?? [];
  }, [wordSet.id]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const currentWord = words[currentIndex];
  const progress = words.length
    ? Math.round(((currentIndex + 1) / words.length) * 100)
    : 0;

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setCorrectCount((value) => value + 1);
    } else {
      setWrongCount((value) => value + 1);
    }

    setShowAnswer(false);
    setCurrentIndex((index) => (index + 1) % words.length);
  };

  return (
    <StudentShell
      title="Practice"
      action={
        <Button variant="outline" asChild>
          <Link href="/student/dashboard">
            <ArrowLeft className="size-4" />
            Dashboard
          </Link>
        </Button>
      }
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-2xl">{wordSet.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {wordSet.className}
                </p>
              </div>
              <Badge variant="secondary">Flashcards</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Card {currentIndex + 1} of {words.length}
              </span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        {currentWord && (
          <Card>
            <CardContent className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
              <div className="text-sm font-medium text-muted-foreground">
                Term
              </div>
              <div className="mt-3 text-4xl font-semibold">
                {currentWord.term}
              </div>
              <div className="mt-4 max-w-xl text-muted-foreground">
                {currentWord.exampleSentence}
              </div>

              {showAnswer && (
                <div className="mt-8 rounded-lg border bg-muted/40 px-6 py-4">
                  <div className="text-sm text-muted-foreground">
                    Translation
                  </div>
                  <div className="mt-1 text-xl font-semibold">
                    {currentWord.translation}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <Button
            variant="outline"
            onClick={() => setShowAnswer((visible) => !visible)}
          >
            <RotateCw className="size-4" />
            {showAnswer ? "Hide Answer" : "Show Answer"}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAnswer(false)}
            disabled={!showAnswer}
          >
            <XCircle className="size-4" />
            Need Review
          </Button>
          <Button onClick={() => handleAnswer(true)} disabled={!showAnswer}>
            <CheckCircle2 className="size-4" />
            I Knew It
          </Button>
        </div>

        <div className="flex justify-center gap-6 text-sm text-muted-foreground">
          <span>
            Correct: <span className="font-medium text-foreground">{correctCount}</span>
          </span>
          <span>
            Wrong: <span className="font-medium text-destructive">{wrongCount}</span>
          </span>
        </div>
      </div>
    </StudentShell>
  );
}
