"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookText,
  Check,
  Copy,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  TrendingDown,
  Users,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  type MockClassDetails,
  type MockStudent,
  type MockWordSet,
  type MockWordSetSummary,
} from "@/types/mock";
import { classesService } from "@/services";
import { getErrorMessage, getMistakeRate } from "@/utils";

interface ClassDetailsPageProps {
  classDetails: MockClassDetails;
  wordSetSummaries: MockWordSetSummary[];
}

export function ClassDetailsPage({
  classDetails,
  wordSetSummaries,
}: ClassDetailsPageProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [inviteStudentDialogOpen, setInviteStudentDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [progressDialogStudent, setProgressDialogStudent] =
    useState<MockStudent | null>(null);
  const [editStudentDialogStudent, setEditStudentDialogStudent] =
    useState<MockStudent | null>(null);
  const [removeStudentDialogStudent, setRemoveStudentDialogStudent] =
    useState<MockStudent | null>(null);
  const [studentFilter, setStudentFilter] = useState<StudentFilter>("all");
  const [actionError, setActionError] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [classOverview, setClassOverview] = useState({
    name: classDetails.name,
    description: classDetails.description,
    level: classDetails.level,
  });
  const [students, setStudents] = useState<MockStudent[]>(
    classDetails.studentsList,
  );
  const [assignedWordSets, setAssignedWordSets] = useState<MockWordSet[]>(
    classDetails.wordSetsList,
  );
  const filteredStudents = useMemo(
    () =>
      students.filter((student) =>
        matchesStudentFilter(student, studentFilter),
      ),
    [studentFilter, students],
  );

  const availableWordSets = wordSetSummaries.filter(
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

  const handleAssignWordSet = async (wordSet: MockWordSetSummary) => {
    setPendingAction("assign-word-set");
    setActionError("");

    try {
      const assignedWordSet = await classesService.assignWordSet(
        classDetails.id,
        wordSet,
      );

      setAssignedWordSets((currentWordSets) => [
        ...currentWordSets,
        {
          ...assignedWordSet,
          assignedStudents: students.length,
        },
      ]);
      setAssignDialogOpen(false);
    } catch (error) {
      setActionError(getErrorMessage(error, "Could not assign word set"));
    } finally {
      setPendingAction(null);
    }
  };

  const handleUpdateClassOverview = async (overview: ClassOverviewInput) => {
    setPendingAction("update-class");
    setActionError("");

    try {
      const updatedClass = await classesService.updateClassOverview(
        classDetails.id,
        overview,
      );

      setClassOverview({
        name: updatedClass.name,
        description: updatedClass.description,
        level: updatedClass.level,
      });
      setEditDialogOpen(false);
    } catch (error) {
      setActionError(getErrorMessage(error, "Could not update class"));
    } finally {
      setPendingAction(null);
    }
  };

  const handleDeleteClass = async () => {
    setPendingAction("delete-class");
    setActionError("");

    try {
      await classesService.deleteClass(classDetails.id);
      setDeleteDialogOpen(false);
      router.push("/teacher/classes");
    } catch (error) {
      setActionError(getErrorMessage(error, "Could not delete class"));
    } finally {
      setPendingAction(null);
    }
  };

  const handleReviewProblemWords = () => {
    document
      .getElementById("problem-words")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAddStudent = async (student: NewStudentInput) => {
    setPendingAction("add-student");
    setActionError("");

    try {
      const addedStudent = await classesService.addStudent(
        classDetails.id,
        student,
      );

      setStudents((currentStudents) => [...currentStudents, addedStudent]);
      setInviteStudentDialogOpen(false);
    } catch (error) {
      setActionError(getErrorMessage(error, "Could not add student"));
    } finally {
      setPendingAction(null);
    }
  };

  const handleUpdateStudent = async (updatedStudent: StudentProfileInput) => {
    setPendingAction("update-student");
    setActionError("");

    try {
      const savedStudent = await classesService.updateStudent(
        classDetails.id,
        updatedStudent,
      );

      setStudents((currentStudents) =>
        currentStudents.map((student) =>
          student.id === savedStudent.id ? savedStudent : student,
        ),
      );
      setEditStudentDialogStudent(null);
    } catch (error) {
      setActionError(getErrorMessage(error, "Could not update student"));
    } finally {
      setPendingAction(null);
    }
  };

  const handleRemoveStudent = async () => {
    if (!removeStudentDialogStudent) {
      return;
    }

    setPendingAction("remove-student");
    setActionError("");

    try {
      const removedStudent = await classesService.removeStudent(
        classDetails.id,
        removeStudentDialogStudent.id,
      );

      setStudents((currentStudents) =>
        currentStudents.filter(
          (student) => student.id !== removedStudent.studentId,
        ),
      );
      setRemoveStudentDialogStudent(null);
    } catch (error) {
      setActionError(getErrorMessage(error, "Could not remove student"));
    } finally {
      setPendingAction(null);
    }
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
              {classOverview.name}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="flex flex-col gap-4">
            {actionError && (
              <Alert variant="destructive">
                <AlertTitle>Action failed</AlertTitle>
                <AlertDescription>{actionError}</AlertDescription>
              </Alert>
            )}
            {pendingAction && (
              <div className="text-sm text-muted-foreground">
                Saving changes...
              </div>
            )}

            <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <CardTitle className="text-2xl">
                        {classOverview.name}
                      </CardTitle>
                      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        {classOverview.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="secondary">{classOverview.level}</Badge>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setEditDialogOpen(true)}
                        aria-label="Edit class"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                        aria-label="Delete class"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <SummaryMetric
                    icon={Users}
                    label="Students"
                    value={students.length}
                  />
                  <SummaryMetric
                    icon={BookText}
                    label="Word sets"
                    value={classDetails.wordSets}
                  />
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Class completion
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
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <CardTitle>Students</CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    {studentFilterOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        size="sm"
                        variant={
                          studentFilter === option.value ? "default" : "outline"
                        }
                        onClick={() => setStudentFilter(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                    <Button
                      size="sm"
                      onClick={() => setInviteStudentDialogOpen(true)}
                    >
                      <Plus className="size-4" />
                      Invite / Add Student
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Completion</TableHead>
                        <TableHead className="text-right">Answers</TableHead>
                        <TableHead>Last practice</TableHead>
                        <TableHead className="w-12 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
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
                          <TableCell className="text-right">
                            <StudentActionsMenu
                              student={student}
                              onViewProgress={setProgressDialogStudent}
                              onEdit={setEditStudentDialogStudent}
                              onRemove={setRemoveStudentDialogStudent}
                            />
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
                onReview={handleReviewProblemWords}
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
                          <span>{wordSet.averageProgress}% completion avg.</span>
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
      <InviteStudentDialog
        open={inviteStudentDialogOpen}
        onOpenChange={setInviteStudentDialogOpen}
        inviteCode={classDetails.inviteCode}
        onAddStudent={handleAddStudent}
      />
      <StudentProgressDialog
        student={progressDialogStudent}
        className={classOverview.name}
        weakWords={classDetails.problemWords}
        onOpenChange={(open) => {
          if (!open) {
            setProgressDialogStudent(null);
          }
        }}
      />
      <EditStudentDialog
        student={editStudentDialogStudent}
        onOpenChange={(open) => {
          if (!open) {
            setEditStudentDialogStudent(null);
          }
        }}
        onSave={handleUpdateStudent}
      />
      <RemoveStudentDialog
        student={removeStudentDialogStudent}
        onOpenChange={(open) => {
          if (!open) {
            setRemoveStudentDialogStudent(null);
          }
        }}
        onRemove={handleRemoveStudent}
      />
      <EditClassDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        initialValue={classOverview}
        onSave={handleUpdateClassOverview}
      />
      <DeleteClassDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        className={classOverview.name}
        onDelete={handleDeleteClass}
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
  onReview: () => void;
}

function ProblemWordsCard({
  problemWords,
  totalWrongAnswers,
}: ProblemWordsCardProps) {
  return (
    <Card id="problem-words">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Problem Words</CardTitle>
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
            const wrongRate = getMistakeRate(word);

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
                <div className="mt-3 text-xs text-muted-foreground">
                  {formatProblemWordImpact(word)}
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

function formatProblemWordImpact(word: MockClassDetails["problemWords"][number]) {
  return `${word.wrongAnswers} ${pluralize("wrong answer", word.wrongAnswers)} across ${word.affectedStudents} ${pluralize("student", word.affectedStudents)}`;
}

function pluralize(label: string, count: number) {
  return count === 1 ? label : `${label}s`;
}

interface StudentActionsMenuProps {
  student: MockStudent;
  onViewProgress: (student: MockStudent) => void;
  onEdit: (student: MockStudent) => void;
  onRemove: (student: MockStudent) => void;
}

function StudentActionsMenu({
  student,
  onViewProgress,
  onEdit,
  onRemove,
}: StudentActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Student actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => onViewProgress(student)}
        >
          <Eye className="size-4" />
          View completion
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => onEdit(student)}
        >
          <Pencil className="size-4" />
          Edit student
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          variant="destructive"
          onClick={() => onRemove(student)}
        >
          <Trash2 className="size-4" />
          Remove from class
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface NewStudentInput {
  email: string;
  name: string;
}

type StudentFilter = "all" | "low-completion" | "inactive";

const studentFilterOptions: Array<{ label: string; value: StudentFilter }> = [
  { label: "All", value: "all" },
  { label: "Low completion (<50%)", value: "low-completion" },
  { label: "No recent practice", value: "inactive" },
];

function matchesStudentFilter(student: MockStudent, filter: StudentFilter) {
  if (filter === "low-completion") {
    return student.progress < 50;
  }

  if (filter === "inactive") {
    return isInactiveStudent(student);
  }

  return true;
}

function isInactiveStudent(student: MockStudent) {
  return !(
    student.lastPracticedAt.startsWith("Today") ||
    student.lastPracticedAt.startsWith("Yesterday")
  );
}

interface InviteStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inviteCode: string;
  onAddStudent: (student: NewStudentInput) => void;
}

function InviteStudentDialog({
  open,
  onOpenChange,
  inviteCode,
  onAddStudent,
}: InviteStudentDialogProps) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleCopyInviteCode = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim()) {
      return;
    }

    onAddStudent({
      email: email.trim(),
      name: name.trim(),
    });
    setEmail("");
    setName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invite or Add Student</DialogTitle>
            <DialogDescription>
              Share the invite code or add a student directly by email.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="text-sm text-muted-foreground">Invite code</div>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="rounded-md border bg-background px-3 py-2 font-mono text-lg font-semibold tracking-wide">
                  {inviteCode}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyInviteCode}
                >
                  {copied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  {copied ? "Copied" : "Copy invite code"}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs uppercase text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              or
              <div className="h-px flex-1 bg-border" />
            </div>

            <Field>
              <FieldLabel htmlFor="student-email">Student email</FieldLabel>
              <Input
                id="student-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="student@example.com"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="student-name">Student name</FieldLabel>
              <Input
                id="student-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Optional"
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
            <Button type="submit" disabled={!email.trim()}>
              Add Student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface StudentProgressDialogProps {
  student: MockStudent | null;
  className: string;
  weakWords: MockClassDetails["problemWords"];
  onOpenChange: (open: boolean) => void;
}

function StudentProgressDialog({
  student,
  className,
  weakWords,
  onOpenChange,
}: StudentProgressDialogProps) {
  return (
    <Dialog open={Boolean(student)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{student?.name ?? "Student completion"}</DialogTitle>
          <DialogDescription>{className}</DialogDescription>
        </DialogHeader>

        {student && (
          <div className="grid gap-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-medium">{student.progress}%</span>
              </div>
              <Progress value={student.progress} className="mt-3 h-2" />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryMetric
                icon={Check}
                label="Correct"
                value={student.correctAnswers}
              />
              <SummaryMetric
                icon={TrendingDown}
                label="Wrong"
                value={student.wrongAnswers}
              />
              <SummaryMetric
                icon={BookText}
                label="Weak words"
                value={weakWords.length}
              />
            </div>

            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium">Weak words</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {weakWords.map((word) => (
                  <Badge key={word.id} variant="outline">
                    {word.term}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Last practice:{" "}
              <span className="font-medium text-foreground">
                {student.lastPracticedAt}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface StudentProfileInput {
  id: string;
  name: string;
  email: string;
}

interface EditStudentDialogProps {
  student: MockStudent | null;
  onOpenChange: (open: boolean) => void;
  onSave: (student: StudentProfileInput) => void;
}

function EditStudentDialog({
  student,
  onOpenChange,
  onSave,
}: EditStudentDialogProps) {
  const [name, setName] = useState(student?.name ?? "");
  const [email, setEmail] = useState(student?.email ?? "");

  useEffect(() => {
    if (!student) {
      return;
    }

    setName(student.name);
    setEmail(student.email);
  }, [student]);

  const handleOpenChange = (open: boolean) => {
    if (open && student) {
      setName(student.name);
      setEmail(student.email);
    }

    onOpenChange(open);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!student || !name.trim() || !email.trim()) {
      return;
    }

    onSave({
      id: student.id,
      name: name.trim(),
      email: email.trim(),
    });
  };

  return (
    <Dialog open={Boolean(student)} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student profile details.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            <Field>
              <FieldLabel htmlFor="edit-student-name">Name</FieldLabel>
              <Input
                id="edit-student-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Student name"
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-student-email">Email</FieldLabel>
              <Input
                id="edit-student-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="student@example.com"
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
            <Button type="submit" disabled={!name.trim() || !email.trim()}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface RemoveStudentDialogProps {
  student: MockStudent | null;
  onOpenChange: (open: boolean) => void;
  onRemove: () => void;
}

function RemoveStudentDialog({
  student,
  onOpenChange,
  onRemove,
}: RemoveStudentDialogProps) {
  return (
    <AlertDialog open={Boolean(student)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove student from this class?</AlertDialogTitle>
          <AlertDialogDescription>
            {student?.name} will lose access to assignments for this class.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={onRemove}
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface ClassOverviewInput {
  name: string;
  description: string;
  level: string;
}

interface EditClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue: ClassOverviewInput;
  onSave: (overview: ClassOverviewInput) => void;
}

function EditClassDialog({
  open,
  onOpenChange,
  initialValue,
  onSave,
}: EditClassDialogProps) {
  const [name, setName] = useState(initialValue.name);
  const [description, setDescription] = useState(initialValue.description);
  const [level, setLevel] = useState(initialValue.level);

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(initialValue.name);
    setDescription(initialValue.description);
    setLevel(initialValue.level);
  }, [initialValue.description, initialValue.level, initialValue.name, open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setName(initialValue.name);
      setDescription(initialValue.description);
      setLevel(initialValue.level);
    }

    onOpenChange(nextOpen);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !description.trim() || !level.trim()) {
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      level: level.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>
              Update the class name, description, and level tag.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            <Field>
              <FieldLabel htmlFor="class-name">Name</FieldLabel>
              <Input
                id="class-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g., English A2"
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="class-description">Description</FieldLabel>
              <Textarea
                id="class-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe this class"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="class-level">Tag</FieldLabel>
              <Input
                id="class-level"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                placeholder="e.g., A2"
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
            <Button
              type="submit"
              disabled={!name.trim() || !description.trim() || !level.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className: string;
  onDelete: () => void;
}

function DeleteClassDialog({
  open,
  onOpenChange,
  className,
  onDelete,
}: DeleteClassDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete class?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove {className} and its assignments. This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={onDelete}
          >
            Delete Class
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
