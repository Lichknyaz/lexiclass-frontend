"use client";

import { useEffect, useState } from "react";
import type { DependencyList, ReactNode } from "react";
import { AlertCircle, BookOpenCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { StudentShell } from "@/components/student/student-shell";
import { StudentDashboardPage } from "@/features/student/dashboard/student-dashboard-page";
import { PracticePage } from "@/features/student/practice/practice-page";
import { StudentProgressPage } from "@/features/student/progress/student-progress-page";
import { StudentWordSetDetailsPage } from "@/features/student/word-sets/student-word-set-details-page";
import { authService, studentService } from "@/services";
import type {
  MockStudentClass,
  MockStudentProgressWord,
  MockStudentWordSet,
  MockWord,
} from "@/types/mock";
import { getErrorMessage } from "@/utils";

type LoadState<TData> =
  | {
      status: "loading";
      data?: never;
      error?: never;
    }
  | {
      status: "error";
      data?: never;
      error: string;
    }
  | {
      status: "ready";
      data: TData;
      error?: never;
    };

interface StudentDashboardData {
  joinedClasses: MockStudentClass[];
  assignedWordSets: MockStudentWordSet[];
}

interface StudentWordSetData {
  wordSet: MockStudentWordSet | undefined;
  words: MockWord[];
}

export function StudentDashboardClientPage() {
  const state = useStudentData<StudentDashboardData>(async () => {
    const [joinedClasses, assignedWordSets] = await Promise.all([
      studentService.listJoinedClasses(),
      studentService.listAssignedWordSets(),
    ]);

    return {
      joinedClasses,
      assignedWordSets,
    };
  });

  if (state.status !== "ready") {
    return <StudentDataState state={state} title="My Word Sets" />;
  }

  return <StudentDashboardPage {...state.data} />;
}

export function StudentProgressClientPage() {
  const state = useStudentData<MockStudentProgressWord[]>(() =>
    studentService.listProgressWords(),
  );

  if (state.status !== "ready") {
    return <StudentDataState state={state} title="My Progress" />;
  }

  return <StudentProgressPage progressWords={state.data} />;
}

export function StudentWordSetDetailsClientPage({ id }: { id: string }) {
  const state = useStudentData<StudentWordSetData>(async () => {
    const [wordSet, wordSetDetails] = await Promise.all([
      studentService.getAssignedWordSet(id),
      studentService.getAssignedWordSetDetails(id),
    ]);

    return {
      wordSet,
      words: wordSetDetails?.wordsList ?? [],
    };
  }, [id]);

  if (state.status !== "ready") {
    return <StudentDataState state={state} title="Word Set Details" />;
  }

  if (!state.data.wordSet) {
    return <StudentNotFound title="Word set not found" />;
  }

  return (
    <StudentWordSetDetailsPage
      wordSet={state.data.wordSet}
      words={state.data.words}
    />
  );
}

export function StudentPracticeClientPage({ id }: { id: string }) {
  const state = useStudentData<StudentWordSetData>(async () => {
    const [wordSet, wordSetDetails] = await Promise.all([
      studentService.getAssignedWordSet(id),
      studentService.getAssignedWordSetDetails(id),
    ]);

    return {
      wordSet,
      words: wordSetDetails?.wordsList ?? [],
    };
  }, [id]);

  if (state.status !== "ready") {
    return <StudentDataState state={state} title="Practice" />;
  }

  if (!state.data.wordSet) {
    return <StudentNotFound title="Word set not found" />;
  }

  return <PracticePage wordSet={state.data.wordSet} words={state.data.words} />;
}

function useStudentData<TData>(
  load: () => Promise<TData>,
  dependencies: DependencyList = [],
) {
  const [state, setState] = useState<LoadState<TData>>({
    status: "loading",
  });

  useEffect(() => {
    let cancelled = false;

    setState({ status: "loading" });

    void authService
      .getCurrentUser()
      .then((user) => {
        if (!user || user.role !== "student") {
          return undefined;
        }

        return load();
      })
      .then((data) => {
        if (cancelled || data === undefined) {
          return;
        }

        setState({
          status: "ready",
          data,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        setState({
          status: "error",
          error: getErrorMessage(error),
        });
      });

    return () => {
      cancelled = true;
    };
  }, dependencies);

  return state;
}

function StudentDataState<TData>({
  state,
  title,
}: {
  state: LoadState<TData>;
  title: string;
}) {
  return (
    <StudentShell title={title}>
      {state.status === "loading" ? (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <div className="flex items-center gap-3">
            <BookOpenCheck className="size-5" />
            <span>Loading data...</span>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Could not load data</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}
    </StudentShell>
  );
}

function StudentNotFound({ title }: { title: string }) {
  return (
    <StudentShell title={title}>
      <div className="flex h-full items-center justify-center text-muted-foreground">
        {title}
      </div>
    </StudentShell>
  );
}

export function StudentClientShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return <StudentShell title={title}>{children}</StudentShell>;
}
