"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Keyboard,
  Layers,
  ListChecks,
  RotateCcw,
  RotateCw,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { StudentShell } from "@/components/student/student-shell";
import {
  getMockWordSetDetails,
  type MockStudentWordSet,
  type MockWord,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type PracticeMode = "flashcard" | "multiple-choice" | "writing";
type AnswerStatus = "correct" | "wrong" | null;

const practiceModes: Array<{
  id: PracticeMode;
  label: string;
  icon: typeof Layers;
}> = [
  { id: "flashcard", label: "Flashcard", icon: Layers },
  { id: "multiple-choice", label: "Multiple choice", icon: ListChecks },
  { id: "writing", label: "Writing", icon: Keyboard },
];

interface PracticePageProps {
  wordSet: MockStudentWordSet;
}

export function PracticePage({ wordSet }: PracticePageProps) {
  const words = useMemo(() => {
    const teacherSet = getMockWordSetDetails(wordSet.id);
    return teacherSet?.wordsList ?? getMockWordSetDetails("w1")?.wordsList ?? [];
  }, [wordSet.id]);

  const [mode, setMode] = useState<PracticeMode>("flashcard");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>(null);
  const [completed, setCompleted] = useState(false);

  const currentWord = words[currentIndex];
  const answeredCount = correctCount + wrongCount;
  const progress = words.length
    ? Math.round((answeredCount / words.length) * 100)
    : 0;

  const choices = useMemo(
    () => buildChoices(words, currentWord),
    [words, currentWord],
  );

  const resetQuestionState = () => {
    setShowAnswer(false);
    setSelectedAnswer("");
    setWrittenAnswer("");
    setAnswerStatus(null);
  };

  const resetSession = (nextMode = mode) => {
    setMode(nextMode);
    setCurrentIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setCompleted(false);
    resetQuestionState();
  };

  const recordAnswer = (correct: boolean) => {
    if (correct) {
      setCorrectCount((value) => value + 1);
    } else {
      setWrongCount((value) => value + 1);
    }

    const lastQuestion = currentIndex >= words.length - 1;

    if (lastQuestion) {
      setCompleted(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
    resetQuestionState();
  };

  const handleModeChange = (nextMode: PracticeMode) => {
    resetSession(nextMode);
  };

  const handleMultipleChoice = (answer: string) => {
    if (!currentWord || answerStatus) {
      return;
    }

    const correct = normalizeAnswer(answer) === normalizeAnswer(currentWord.translation);
    setSelectedAnswer(answer);
    setAnswerStatus(correct ? "correct" : "wrong");
  };

  const handleWritingSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentWord || !writtenAnswer.trim() || answerStatus) {
      return;
    }

    const correct =
      normalizeAnswer(writtenAnswer) === normalizeAnswer(currentWord.term);
    setAnswerStatus(correct ? "correct" : "wrong");
    setShowAnswer(true);
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-2xl">{wordSet.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {wordSet.className}
                </p>
              </div>
              <Badge variant="secondary">
                {completed ? "Finished" : practiceModes.find((item) => item.id === mode)?.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2 sm:grid-cols-3">
              {practiceModes.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant={mode === item.id ? "default" : "outline"}
                  onClick={() => handleModeChange(item.id)}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Button>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {completed
                    ? `${answeredCount} of ${words.length} answered`
                    : `Word ${currentIndex + 1} of ${words.length}`}
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="mt-2 h-2" />
            </div>
          </CardContent>
        </Card>

        {completed ? (
          <ResultCard
            correctCount={correctCount}
            wrongCount={wrongCount}
            totalWords={words.length}
            onRestart={() => resetSession()}
          />
        ) : (
          currentWord && (
            <>
              <PracticeCard
                mode={mode}
                word={currentWord}
                choices={choices}
                showAnswer={showAnswer}
                selectedAnswer={selectedAnswer}
                writtenAnswer={writtenAnswer}
                answerStatus={answerStatus}
                onToggleAnswer={() => setShowAnswer((visible) => !visible)}
                onFlashcardAnswer={recordAnswer}
                onMultipleChoice={handleMultipleChoice}
                onWritingChange={setWrittenAnswer}
                onWritingSubmit={handleWritingSubmit}
              />

              {answerStatus && (
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <AnswerFeedback
                    status={answerStatus}
                    correctAnswer={
                      mode === "writing"
                        ? currentWord.term
                        : currentWord.translation
                    }
                  />
                  <Button onClick={() => recordAnswer(answerStatus === "correct")}>
                    Next Word
                  </Button>
                </div>
              )}
            </>
          )
        )}

        <div className="flex justify-center gap-6 text-sm text-muted-foreground">
          <span>
            Correct:{" "}
            <span className="font-medium text-foreground">{correctCount}</span>
          </span>
          <span>
            Wrong:{" "}
            <span className="font-medium text-destructive">{wrongCount}</span>
          </span>
          <span>
            Current index:{" "}
            <span className="font-medium text-foreground">{currentIndex}</span>
          </span>
        </div>
      </div>
    </StudentShell>
  );
}

interface PracticeCardProps {
  mode: PracticeMode;
  word: MockWord;
  choices: string[];
  showAnswer: boolean;
  selectedAnswer: string;
  writtenAnswer: string;
  answerStatus: AnswerStatus;
  onToggleAnswer: () => void;
  onFlashcardAnswer: (correct: boolean) => void;
  onMultipleChoice: (answer: string) => void;
  onWritingChange: (value: string) => void;
  onWritingSubmit: (event: React.FormEvent) => void;
}

function PracticeCard({
  mode,
  word,
  choices,
  showAnswer,
  selectedAnswer,
  writtenAnswer,
  answerStatus,
  onToggleAnswer,
  onFlashcardAnswer,
  onMultipleChoice,
  onWritingChange,
  onWritingSubmit,
}: PracticeCardProps) {
  if (mode === "multiple-choice") {
    return (
      <Card>
        <CardContent className="flex min-h-80 flex-col justify-center gap-6 p-8">
          <QuestionHeader label="Choose the translation" value={word.term} />
          <div className="grid gap-3 sm:grid-cols-2">
            {choices.map((choice) => {
              const selected = selectedAnswer === choice;
              const correct = normalizeAnswer(choice) === normalizeAnswer(word.translation);

              return (
                <Button
                  key={choice}
                  type="button"
                  variant="outline"
                  disabled={Boolean(answerStatus)}
                  onClick={() => onMultipleChoice(choice)}
                  className={cn(
                    "h-auto justify-start whitespace-normal py-4 text-left",
                    answerStatus &&
                      correct &&
                      "border-green-600 text-green-700 hover:text-green-700",
                    answerStatus &&
                      selected &&
                      !correct &&
                      "border-destructive text-destructive hover:text-destructive",
                  )}
                >
                  {choice}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mode === "writing") {
    return (
      <Card>
        <CardContent className="flex min-h-80 flex-col justify-center gap-6 p-8">
          <QuestionHeader label="Write the term" value={word.translation} />
          <form onSubmit={onWritingSubmit} className="mx-auto flex w-full max-w-md flex-col gap-3">
            <Input
              value={writtenAnswer}
              onChange={(event) => onWritingChange(event.target.value)}
              placeholder="Type the word"
              disabled={Boolean(answerStatus)}
              autoFocus
            />
            <Button type="submit" disabled={!writtenAnswer.trim() || Boolean(answerStatus)}>
              Check Answer
            </Button>
          </form>
          {showAnswer && (
            <div className="mx-auto rounded-lg border bg-muted/40 px-6 py-4 text-center">
              <div className="text-sm text-muted-foreground">Correct term</div>
              <div className="mt-1 text-xl font-semibold">{word.term}</div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
        <QuestionHeader label="Term" value={word.term} />
        <div className="mt-4 max-w-xl text-muted-foreground">
          {word.exampleSentence}
        </div>

        {showAnswer && (
          <div className="mt-8 rounded-lg border bg-muted/40 px-6 py-4">
            <div className="text-sm text-muted-foreground">Translation</div>
            <div className="mt-1 text-xl font-semibold">{word.translation}</div>
          </div>
        )}

        <div className="mt-8 grid w-full gap-3 sm:grid-cols-3">
          <Button variant="outline" onClick={onToggleAnswer}>
            <RotateCw className="size-4" />
            {showAnswer ? "Hide Answer" : "Show Answer"}
          </Button>
          <Button
            variant="outline"
            onClick={() => onFlashcardAnswer(false)}
            disabled={!showAnswer}
          >
            <XCircle className="size-4" />
            Need Review
          </Button>
          <Button onClick={() => onFlashcardAnswer(true)} disabled={!showAnswer}>
            <CheckCircle2 className="size-4" />
            I Knew It
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuestionHeaderProps {
  label: string;
  value: string;
}

function QuestionHeader({ label, value }: QuestionHeaderProps) {
  return (
    <div className="text-center">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="mt-3 text-4xl font-semibold">{value}</div>
    </div>
  );
}

interface AnswerFeedbackProps {
  status: Exclude<AnswerStatus, null>;
  correctAnswer: string;
}

function AnswerFeedback({ status, correctAnswer }: AnswerFeedbackProps) {
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        status === "correct"
          ? "border-green-600/30 text-green-700"
          : "border-destructive/30 text-destructive",
      )}
    >
      <div className="font-medium">
        {status === "correct" ? "Correct answer" : "Wrong answer"}
      </div>
      <div className="mt-1">Correct: {correctAnswer}</div>
    </div>
  );
}

interface ResultCardProps {
  correctCount: number;
  wrongCount: number;
  totalWords: number;
  onRestart: () => void;
}

function ResultCard({
  correctCount,
  wrongCount,
  totalWords,
  onRestart,
}: ResultCardProps) {
  const score = totalWords ? Math.round((correctCount / totalWords) * 100) : 0;

  return (
    <Card>
      <CardContent className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
        <div className="text-sm font-medium text-muted-foreground">
          Final result
        </div>
        <div className="mt-3 text-5xl font-semibold">{score}%</div>
        <div className="mt-4 flex gap-6 text-sm text-muted-foreground">
          <span>
            Correct:{" "}
            <span className="font-medium text-foreground">{correctCount}</span>
          </span>
          <span>
            Wrong:{" "}
            <span className="font-medium text-destructive">{wrongCount}</span>
          </span>
        </div>
        <Button className="mt-8" onClick={onRestart}>
          <RotateCcw className="size-4" />
          Practice Again
        </Button>
      </CardContent>
    </Card>
  );
}

function normalizeAnswer(answer: string) {
  return answer.trim().toLowerCase();
}

function buildChoices(words: MockWord[], currentWord?: MockWord) {
  if (!currentWord) {
    return [];
  }

  const wrongChoices = words
    .filter((word) => word.id !== currentWord.id)
    .map((word) => word.translation)
    .slice(0, 3);

  const fallbackChoices = [
    "scheduled meeting",
    "small first course",
    "make a place clean",
  ].filter((choice) => normalizeAnswer(choice) !== normalizeAnswer(currentWord.translation));

  return shuffleChoices([
    currentWord.translation,
    ...wrongChoices,
    ...fallbackChoices,
  ].slice(0, 4));
}

function shuffleChoices(choices: string[]) {
  return [...choices].sort((a, b) => a.localeCompare(b));
}
