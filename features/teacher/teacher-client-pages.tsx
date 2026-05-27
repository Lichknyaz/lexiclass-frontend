"use client";

import { useEffect, useState } from "react";
import type { DependencyList, ReactNode } from "react";
import { AlertCircle, BookOpenCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TeacherAnalyticsPage } from "@/features/teacher/analytics/teacher-analytics-page";
import { ClassDetailsPage } from "@/features/teacher/classes/class-details-page";
import { TeacherClassesPage } from "@/features/teacher/classes/teacher-classes-page";
import { TeacherDashboard } from "@/features/teacher/dashboard/teacher-dashboard";
import { TeacherWordSetsPage } from "@/features/teacher/word-sets/teacher-word-sets-page";
import { WordSetDetailsPage } from "@/features/teacher/word-sets/word-set-details-page";
import {
  analyticsService,
  authService,
  classesService,
  wordSetsService,
  type TeacherAnalytics,
} from "@/services";
import type {
  MockClassDetails,
  MockClassSummary,
  MockWordSetDetails,
  MockWordSetSummary,
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

interface TeacherDashboardData {
  classes: MockClassSummary[];
  classDetails: MockClassDetails[];
  wordSets: MockWordSetSummary[];
  analytics: TeacherAnalytics;
}

interface TeacherClassDetailsData {
  classDetails: MockClassDetails | undefined;
  wordSetSummaries: MockWordSetSummary[];
}

interface TeacherWordSetDetailsData {
  wordSet: MockWordSetDetails | undefined;
  classes: MockClassSummary[];
}

export function TeacherDashboardClientPage() {
  const state = useTeacherData<TeacherDashboardData>(async () => {
    const [classes, classDetails, wordSets, analytics] = await Promise.all([
      classesService.listClasses(),
      classesService.listClassDetails(),
      wordSetsService.listWordSetSummaries(),
      analyticsService.getTeacherAnalytics(),
    ]);

    return {
      classes,
      classDetails,
      wordSets,
      analytics,
    };
  });

  if (state.status !== "ready") {
    return <TeacherDataState state={state} title="Dashboard" />;
  }

  return <TeacherDashboard {...state.data} />;
}

export function TeacherClassesClientPage() {
  const state = useTeacherData(() => classesService.listClasses());

  if (state.status !== "ready") {
    return <TeacherDataState state={state} title="Classes" />;
  }

  return <TeacherClassesPage initialClasses={state.data} />;
}

export function TeacherClassDetailsClientPage({ id }: { id: string }) {
  const state = useTeacherData<TeacherClassDetailsData>(async () => {
    const [classDetails, wordSetSummaries] = await Promise.all([
      classesService.getClassDetails(id),
      wordSetsService.listWordSetSummaries(),
    ]);

    return {
      classDetails,
      wordSetSummaries,
    };
  }, [id]);

  if (state.status !== "ready") {
    return <TeacherDataState state={state} title="Class Details" />;
  }

  if (!state.data.classDetails) {
    return <TeacherNotFound title="Class not found" />;
  }

  return (
    <ClassDetailsPage
      classDetails={state.data.classDetails}
      wordSetSummaries={state.data.wordSetSummaries}
    />
  );
}

export function TeacherWordSetsClientPage() {
  const state = useTeacherData(() => wordSetsService.listWordSetSummaries());

  if (state.status !== "ready") {
    return <TeacherDataState state={state} title="Word Sets" />;
  }

  return <TeacherWordSetsPage wordSets={state.data} />;
}

export function TeacherWordSetDetailsClientPage({
  id,
  from,
}: {
  id: string;
  from?: string;
}) {
  const state = useTeacherData<TeacherWordSetDetailsData>(async () => {
    const [wordSet, classes] = await Promise.all([
      wordSetsService.getWordSetDetails(id),
      classesService.listClasses(),
    ]);

    return {
      wordSet,
      classes,
    };
  }, [id]);

  if (state.status !== "ready") {
    return <TeacherDataState state={state} title="Word Set Details" />;
  }

  if (!state.data.wordSet) {
    return <TeacherNotFound title="Word set not found" />;
  }

  const backHref =
    from === "word-sets"
      ? "/teacher/word-sets"
      : `/teacher/classes/${state.data.wordSet.classId}`;
  const backLabel = from === "word-sets" ? "Back to word sets" : "Back to class";

  return (
    <WordSetDetailsPage
      wordSet={state.data.wordSet}
      classes={state.data.classes}
      backHref={backHref}
      backLabel={backLabel}
    />
  );
}

export function TeacherAnalyticsClientPage() {
  const state = useTeacherData(() => analyticsService.getTeacherAnalytics());

  if (state.status !== "ready") {
    return <TeacherDataState state={state} title="Analytics" />;
  }

  return <TeacherAnalyticsPage analytics={state.data} />;
}

function useTeacherData<TData>(
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
        if (!user || user.role !== "teacher") {
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

function TeacherDataState<TData>({
  state,
  title,
}: {
  state: LoadState<TData>;
  title: string;
}) {
  return (
    <TeacherShell title={title}>
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
    </TeacherShell>
  );
}

function TeacherNotFound({ title }: { title: string }) {
  return (
    <TeacherShell title={title}>
      <div className="flex h-full items-center justify-center text-muted-foreground">
        {title}
      </div>
    </TeacherShell>
  );
}

function TeacherShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar className="hidden lg:flex" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-3 border-b bg-background px-4 lg:px-6">
          <MobileSidebar />
          <h1 className="text-xl font-semibold">{title}</h1>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
