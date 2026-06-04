"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  DoorOpen,
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
import { practiceService, type PracticeAttemptInput } from "@/services";
import {
  type MockStudentWordSet,
  type MockWord,
} from "@/types/mock";
import { buildChoices, cn, getPercentage, normalizeAnswer } from "@/utils";

type PracticeMode = "flashcard" | "multiple-choice" | "writing";
type WordScope = "all" | "weak" | "new";
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
  words: MockWord[];
  initialWordScope?: WordScope;
}

export function PracticePage({
  wordSet,
  words: allWords,
  initialWordScope = "all",
}: PracticePageProps) {
  const [mode, setMode] = useState<PracticeMode>("flashcard");
  const [wordScope, setWordScope] = useState<WordScope>(initialWordScope);
  const [started, setStarted] = useState(false);
  const [sessionWords, setSessionWords] = useState<MockWord[]>([]);
  const [attempts, setAttempts] = useState<PracticeAttemptInput[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>(null);
  const [completed, setCompleted] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">(
    "idle",
  );

  const words = started ? sessionWords : getWordsByScope(allWords, wordScope);
  const currentWord = words[currentIndex];
  const answeredCount = correctCount + wrongCount;
  const progress = getPercentage(answeredCount, words.length);

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
    setAttempts([]);
    setCompleted(false);
    setSaveStatus("idle");
    resetQuestionState();
  };

  const startSession = () => {
    const nextWords = getWordsByScope(allWords, wordScope);

    setSessionWords(nextWords.length > 0 ? nextWords : allWords);
    setStarted(true);
    setCurrentIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setAttempts([]);
    setCompleted(false);
    setSaveStatus("idle");
    resetQuestionState();
  };

  const startWeakWordsSession = () => {
    const weakWords = getWeakWordsForSession(allWords, attempts);

    setWordScope("weak");
    setSessionWords(weakWords.length > 0 ? weakWords : allWords);
    setStarted(true);
    setCurrentIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setAttempts([]);
    setCompleted(false);
    setSaveStatus("idle");
    resetQuestionState();
  };

  const exitSession = () => {
    setStarted(false);
    resetSession();
  };

  const completeSession = async (nextAttempts: PracticeAttemptInput[]) => {
    setCompleted(true);

    try {
      await practiceService.savePracticeSession({
        assignmentId: wordSet.id,
        studentId: "local-student",
        mode,
        attempts: nextAttempts,
      });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  };

  const goToNextWord = async () => {
    if (!answerStatus || !currentWord) {
      return;
    }

    const correct = answerStatus === "correct";
    const nextAttempt: PracticeAttemptInput = {
      wordId: currentWord.id,
      status: correct ? "correct" : "wrong",
      answeredAt: new Date().toISOString(),
    };
    const nextAttempts = [...attempts, nextAttempt];

    setAttempts(nextAttempts);
    setCorrectCount((value) => (correct ? value + 1 : value));
    setWrongCount((value) => (correct ? value : value + 1));

    const lastQuestion = currentIndex >= words.length - 1;

    if (lastQuestion) {
      await completeSession(nextAttempts);
      return;
    }

    setCurrentIndex((index) => index + 1);
    resetQuestionState();
  };

  const skipWord = () => {
    const lastQuestion = currentIndex >= words.length - 1;

    if (lastQuestion) {
      void completeSession(attempts);
      return;
    }

    setCurrentIndex((index) => index + 1);
    resetQuestionState();
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

  const handleFlashcardAnswer = (correct: boolean) => {
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
        {!started ? (
          <SetupCard
            wordSet={wordSet}
            mode={mode}
            wordScope={wordScope}
            availableWords={words.length}
            onModeChange={setMode}
            onWordScopeChange={setWordScope}
            onStart={startSession}
          />
        ) : (
          <>
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
              <Button variant="outline" onClick={exitSession}>
                <DoorOpen className="size-4" />
                Exit session
              </Button>
              <Button
                variant="outline"
                onClick={skipWord}
                disabled={completed || !currentWord}
              >
                Skip word
              </Button>
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
            words={words}
            attempts={attempts}
            saveStatus={saveStatus}
            onPracticeWeakWords={startWeakWordsSession}
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
                onMultipleChoice={handleMultipleChoice}
                onWritingChange={setWrittenAnswer}
                onWritingSubmit={handleWritingSubmit}
                onFlashcardAnswer={handleFlashcardAnswer}
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
                    exampleSentence={currentWord.exampleSentence}
                  />
                  <Button onClick={goToNextWord}>
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
          </>
        )}
      </div>
    </StudentShell>
  );
}

function getWordsByScope(words: MockWord[], scope: WordScope) {
  if (scope === "weak") {
    return words.filter((word) => word.masteryLevel < 60);
  }

  if (scope === "new") {
    return words.filter((word) => word.masteryLevel === 0);
  }

  return words;
}

function getWeakWordsForSession(
  words: MockWord[],
  attempts: PracticeAttemptInput[],
) {
  const currentSessionAttemptsByWord = attempts.reduce<
    Map<string, { correct: number; wrong: number }>
  >((attemptsByWord, attempt) => {
    const existing = attemptsByWord.get(attempt.wordId) ?? {
      correct: 0,
      wrong: 0,
    };

    if (attempt.status === "correct") {
      existing.correct += 1;
    } else {
      existing.wrong += 1;
    }

    attemptsByWord.set(attempt.wordId, existing);

    return attemptsByWord;
  }, new Map());

  return words.filter((word) => {
    const currentSessionAttempts =
      currentSessionAttemptsByWord.get(word.id) ?? {
        correct: 0,
        wrong: 0,
      };
    const correctAnswers = word.correctAnswers + currentSessionAttempts.correct;
    const wrongAnswers = word.wrongAnswers + currentSessionAttempts.wrong;
    const totalAnswers = correctAnswers + wrongAnswers;
    const projectedMastery =
      totalAnswers === 0
        ? word.masteryLevel
        : Math.round((correctAnswers / totalAnswers) * 100);

    return projectedMastery < 60;
  });
}

interface SetupCardProps {
  wordSet: MockStudentWordSet;
  mode: PracticeMode;
  wordScope: WordScope;
  availableWords: number;
  onModeChange: (mode: PracticeMode) => void;
  onWordScopeChange: (scope: WordScope) => void;
  onStart: () => void;
}

function SetupCard({
  wordSet,
  mode,
  wordScope,
  availableWords,
  onModeChange,
  onWordScopeChange,
  onStart,
}: SetupCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl">{wordSet.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{wordSet.className}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-3">
          <div className="text-sm font-medium">Choose mode</div>
          <div className="grid gap-2 sm:grid-cols-3">
            {practiceModes.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={mode === item.id ? "default" : "outline"}
                onClick={() => onModeChange(item.id)}
              >
                <item.icon className="size-4" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          <div className="text-sm font-medium">Choose words</div>
          <div className="grid gap-2 sm:grid-cols-3">
            {wordScopeOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={wordScope === option.value ? "default" : "outline"}
                onClick={() => onWordScopeChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Words selected</span>
          <span className="font-medium">{availableWords}</span>
        </div>

        <Button onClick={onStart} disabled={availableWords === 0}>
          Start Practice
        </Button>
      </CardContent>
    </Card>
  );
}

const wordScopeOptions: Array<{ label: string; value: WordScope }> = [
  { label: "All", value: "all" },
  { label: "Weak only", value: "weak" },
  { label: "New only", value: "new" },
];

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
  exampleSentence: string;
}

function AnswerFeedback({
  status,
  correctAnswer,
  exampleSentence,
}: AnswerFeedbackProps) {
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
      <div className="mt-2 text-muted-foreground">{exampleSentence}</div>
    </div>
  );
}

interface ResultCardProps {
  correctCount: number;
  wrongCount: number;
  words: MockWord[];
  attempts: PracticeAttemptInput[];
  saveStatus: "idle" | "saved" | "error";
  onPracticeWeakWords: () => void;
}

function ResultCard({
  correctCount,
  wrongCount,
  words,
  attempts,
  saveStatus,
  onPracticeWeakWords,
}: ResultCardProps) {
  const totalWords = words.length;
  const score = getPercentage(correctCount, totalWords);
  const weakWords = getWeakWordsForSession(words, attempts);

  return (
    <Card>
      <CardContent className="flex min-h-80 flex-col gap-6 p-8">
        <div className="text-center">
          <div className="text-sm font-medium text-muted-foreground">
            Session complete
          </div>
          <div className="mt-3 text-5xl font-semibold">{score}%</div>
          <div className="mt-2 text-sm text-muted-foreground">accuracy</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <ResultMetric label="Correct" value={correctCount} />
          <ResultMetric label="Wrong" value={wrongCount} destructive />
          <ResultMetric label="Accuracy" value={`${score}%`} />
        </div>

        <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {saveStatus === "saved" &&
            "Practice result saved for progress tracking."}
          {saveStatus === "error" &&
            "Practice finished, but the result could not be saved."}
          {saveStatus === "idle" && "Preparing practice result..."}
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="font-medium">Weak words</div>
            <div className="text-sm text-muted-foreground">
              {weakWords.length}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {weakWords.length === 0 ? (
              <span className="text-sm text-muted-foreground">
                No weak words in this session.
              </span>
            ) : (
              weakWords.map((word) => (
                <Badge key={word.id} variant="outline">
                  {word.term}
                </Badge>
              ))
            )}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button onClick={onPracticeWeakWords} disabled={weakWords.length === 0}>
            <RotateCcw className="size-4" />
            Practice weak words
          </Button>
          <Button variant="outline" asChild>
            <Link href="/student/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultMetric({
  label,
  value,
  destructive = false,
}: {
  label: string;
  value: number | string;
  destructive?: boolean;
}) {
  return (
    <div className="rounded-lg border p-4 text-center">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div
        className={
          destructive
            ? "mt-1 text-2xl font-semibold text-destructive"
            : "mt-1 text-2xl font-semibold"
        }
      >
        {value}
      </div>
    </div>
  );
}

