"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  ListChecks,
  MoreHorizontal,
  Pencil,
  Plus,
  Target,
  Trash2,
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
import { Checkbox } from "@/components/ui/checkbox";
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
import type {
  MockClassSummary,
  MockWord,
  MockWordSetDetails,
} from "@/types/mock";
import { getAverage } from "@/utils";

interface WordSetDetailsPageProps {
  wordSet: MockWordSetDetails;
  classes: MockClassSummary[];
  backHref: string;
  backLabel: string;
}

export function WordSetDetailsPage({
  wordSet,
  classes,
  backHref,
  backLabel,
}: WordSetDetailsPageProps) {
  const router = useRouter();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [addWordDialogOpen, setAddWordDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewWordDialogWord, setViewWordDialogWord] =
    useState<MockWord | null>(null);
  const [editWordDialogWord, setEditWordDialogWord] =
    useState<MockWord | null>(null);
  const [deleteWordDialogWord, setDeleteWordDialogWord] =
    useState<MockWord | null>(null);
  const [wordFilter, setWordFilter] = useState<WordFilter>("all");
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>([]);
  const [wordSetOverview, setWordSetOverview] = useState({
    title: wordSet.title,
    description: wordSet.description,
    tag: wordSet.className,
  });
  const [words, setWords] = useState<MockWord[]>(wordSet.wordsList);
  const [assignedClasses, setAssignedClasses] = useState<MockClassSummary[]>(
    classes.filter((classItem) => classItem.id === wordSet.classId),
  );

  const averageMastery = getAverage(words.map((word) => word.masteryLevel));
  const problemWordsCount = words.filter(
    (word) => word.masteryLevel < 60,
  ).length;
  const filteredWords = useMemo(
    () => words.filter((word) => matchesWordFilter(word, wordFilter)),
    [wordFilter, words],
  );
  const filteredWordIds = filteredWords.map((word) => word.id);
  const selectedFilteredWordIds = selectedWordIds.filter((wordId) =>
    filteredWordIds.includes(wordId),
  );
  const allFilteredWordsSelected =
    filteredWordIds.length > 0 &&
    filteredWordIds.every((wordId) => selectedWordIds.includes(wordId));
  const availableClasses = classes.filter(
    (classItem) =>
      !assignedClasses.some(
        (assignedClass) => assignedClass.id === classItem.id,
      ),
  );

  const handleAssignClass = (classItem: MockClassSummary) => {
    setAssignedClasses((currentClasses) => [...currentClasses, classItem]);
    setAssignDialogOpen(false);
  };

  const handleAddWords = (newWords: NewWordInput[]) => {
    setWords((currentWords) => [
      ...currentWords,
      ...newWords.map((word, index) => ({
        id: `${Date.now()}-${index}`,
        term: word.term,
        translation: word.translation,
        exampleSentence: word.exampleSentence,
        masteryLevel: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
      })),
    ]);
  };

  const handleUpdateWord = (updatedWord: WordInput) => {
    setWords((currentWords) =>
      currentWords.map((word) =>
        word.id === updatedWord.id
          ? {
              ...word,
              term: updatedWord.term,
              translation: updatedWord.translation,
              exampleSentence: updatedWord.exampleSentence,
            }
          : word,
      ),
    );
    setEditWordDialogWord(null);
  };

  const handleDeleteWord = () => {
    if (!deleteWordDialogWord) {
      return;
    }

    setWords((currentWords) =>
      currentWords.filter((word) => word.id !== deleteWordDialogWord.id),
    );
    setSelectedWordIds((currentIds) =>
      currentIds.filter((wordId) => wordId !== deleteWordDialogWord.id),
    );
    setDeleteWordDialogWord(null);
  };

  const handleToggleWord = (wordId: string, checked: boolean) => {
    setSelectedWordIds((currentIds) =>
      checked
        ? [...new Set([...currentIds, wordId])]
        : currentIds.filter((currentId) => currentId !== wordId),
    );
  };

  const handleToggleAllFilteredWords = (checked: boolean) => {
    setSelectedWordIds((currentIds) => {
      if (!checked) {
        return currentIds.filter((wordId) => !filteredWordIds.includes(wordId));
      }

      return [...new Set([...currentIds, ...filteredWordIds])];
    });
  };

  const handleDeleteSelectedWords = () => {
    setWords((currentWords) =>
      currentWords.filter((word) => !selectedWordIds.includes(word.id)),
    );
    setSelectedWordIds([]);
  };

  const handleUpdateWordSetOverview = (overview: WordSetOverviewInput) => {
    setWordSetOverview(overview);
    setEditDialogOpen(false);
  };

  const handleDeleteWordSet = () => {
    setDeleteDialogOpen(false);
    router.push("/teacher/word-sets");
  };

  return (
    <div className="flex h-screen">
      <Sidebar className="hidden lg:flex" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <MobileSidebar />
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href={backHref}>
                <ArrowLeft className="size-4" />
                <span className="sr-only">{backLabel}</span>
              </Link>
            </Button>
            <h1 className="truncate text-xl font-semibold">
              {wordSetOverview.title}
            </h1>
          </div>
          <Button onClick={() => setAssignDialogOpen(true)}>
            <Plus className="size-4" />
            Assign to Class
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="flex flex-col gap-4">
            <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle className="text-2xl">
                        {wordSetOverview.title}
                      </CardTitle>
                      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        {wordSetOverview.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="secondary">{wordSetOverview.tag}</Badge>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setEditDialogOpen(true)}
                        aria-label="Edit word set"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                        aria-label="Delete word set"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <SummaryMetric
                    icon={BookOpen}
                    label="Words"
                    value={words.length}
                  />
                  <SummaryMetric
                    icon={ListChecks}
                    label="Assigned classes"
                    value={assignedClasses.length}
                  />
                  <SummaryMetric
                    icon={Target}
                    label="Problem words"
                    value={problemWordsCount}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Set Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="text-3xl font-semibold">
                        {averageMastery}%
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        average mastery
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      Created
                      <div className="font-medium text-foreground">
                        {wordSet.createdAt}
                      </div>
                    </div>
                  </div>
                  <Progress value={averageMastery} className="mt-4 h-2" />
                </CardContent>
              </Card>
            </section>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle>Words</CardTitle>
                <Button size="sm" onClick={() => setAddWordDialogOpen(true)}>
                  <Plus className="size-4" />
                  Add Word
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {wordFilterOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        size="sm"
                        variant={
                          wordFilter === option.value ? "default" : "outline"
                        }
                        onClick={() => setWordFilter(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  {selectedWordIds.length > 0 && (
                    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedWordIds.length} selected
                      </span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDeleteSelectedWords}
                      >
                        <Trash2 className="size-4" />
                        Delete selected
                      </Button>
                    </div>
                  )}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={
                            allFilteredWordsSelected
                              ? true
                              : selectedFilteredWordIds.length > 0
                                ? "indeterminate"
                                : false
                          }
                          onCheckedChange={(checked) =>
                            handleToggleAllFilteredWords(checked === true)
                          }
                          aria-label="Select all words"
                        />
                      </TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Translation</TableHead>
                      <TableHead>Example</TableHead>
                      <TableHead>Mastery</TableHead>
                      <TableHead className="text-right">Answers</TableHead>
                      <TableHead className="w-12 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWords.map((word) => (
                      <TableRow key={word.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedWordIds.includes(word.id)}
                            onCheckedChange={(checked) =>
                              handleToggleWord(word.id, checked === true)
                            }
                            aria-label={`Select ${word.term}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {word.term}
                        </TableCell>
                        <TableCell>{word.translation}</TableCell>
                        <TableCell className="max-w-80 text-muted-foreground">
                          <span className="line-clamp-2">
                            {word.exampleSentence}
                          </span>
                        </TableCell>
                        <TableCell className="min-w-36">
                          <div className="flex items-center gap-3">
                            <Progress
                              value={word.masteryLevel}
                              className="h-2"
                            />
                            <span className="w-10 text-right text-sm font-medium">
                              {word.masteryLevel}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">
                            {word.correctAnswers}
                          </span>
                          <span className="text-muted-foreground">
                            {" "}
                            / {word.wrongAnswers} wrong
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <WordActionsMenu
                            word={word}
                            onView={setViewWordDialogWord}
                            onEdit={setEditWordDialogWord}
                            onDelete={setDeleteWordDialogWord}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <AssignClassDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        availableClasses={availableClasses}
        assignedClasses={assignedClasses}
        onAssign={handleAssignClass}
      />
      <AddWordDialog
        open={addWordDialogOpen}
        onOpenChange={setAddWordDialogOpen}
        onAddWords={handleAddWords}
      />
      <ViewWordDialog
        word={viewWordDialogWord}
        onOpenChange={(open) => {
          if (!open) {
            setViewWordDialogWord(null);
          }
        }}
      />
      <EditWordDialog
        word={editWordDialogWord}
        onOpenChange={(open) => {
          if (!open) {
            setEditWordDialogWord(null);
          }
        }}
        onSave={handleUpdateWord}
      />
      <DeleteWordDialog
        word={deleteWordDialogWord}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteWordDialogWord(null);
          }
        }}
        onDelete={handleDeleteWord}
      />
      <EditWordSetDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        initialValue={wordSetOverview}
        onSave={handleUpdateWordSetOverview}
      />
      <DeleteWordSetDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        wordSetTitle={wordSetOverview.title}
        onDelete={handleDeleteWordSet}
      />
    </div>
  );
}

interface SummaryMetricProps {
  icon: typeof BookOpen;
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

interface WordActionsMenuProps {
  word: MockWord;
  onView: (word: MockWord) => void;
  onEdit: (word: MockWord) => void;
  onDelete: (word: MockWord) => void;
}

function WordActionsMenu({
  word,
  onView,
  onEdit,
  onDelete,
}: WordActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Word actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => onView(word)}
        >
          <Eye className="size-4" />
          View word
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => onEdit(word)}
        >
          <Pencil className="size-4" />
          Edit word
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          variant="destructive"
          onClick={() => onDelete(word)}
        >
          <Trash2 className="size-4" />
          Delete word
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface NewWordInput {
  term: string;
  translation: string;
  exampleSentence: string;
}

type WordFilter = "all" | "weak" | "unlearned";

const wordFilterOptions: Array<{ label: string; value: WordFilter }> = [
  { label: "All", value: "all" },
  { label: "Weak (<50%)", value: "weak" },
  { label: "Unlearned", value: "unlearned" },
];

function matchesWordFilter(word: MockWord, filter: WordFilter) {
  if (filter === "weak") {
    return word.masteryLevel < 50;
  }

  if (filter === "unlearned") {
    return word.masteryLevel === 0;
  }

  return true;
}

function parseBulkWordInput(input: string): NewWordInput[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [term = "", translation = "", ...exampleParts] = line
        .split(",")
        .map((part) => part.trim());

      return {
        term,
        translation,
        exampleSentence: exampleParts.join(", ").trim(),
      };
    })
    .filter((word) => word.term && word.translation);
}

interface WordInput extends NewWordInput {
  id: string;
}

interface WordSetOverviewInput {
  title: string;
  description: string;
  tag: string;
}

interface AssignClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableClasses: MockClassSummary[];
  assignedClasses: MockClassSummary[];
  onAssign: (classItem: MockClassSummary) => void;
}

function AssignClassDialog({
  open,
  onOpenChange,
  availableClasses,
  assignedClasses,
  onAssign,
}: AssignClassDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Word Set to Class</DialogTitle>
          <DialogDescription>
            Choose a class that should practice this word set.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="rounded-lg border bg-muted/40 p-4">
            <div className="text-sm font-medium">Assigned classes</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {assignedClasses.map((classItem) => (
                <Badge key={classItem.id} variant="secondary">
                  {classItem.name}
                </Badge>
              ))}
            </div>
          </div>

          {availableClasses.length === 0 ? (
            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              This word set is already assigned to every class.
            </div>
          ) : (
            <div className="grid gap-3">
              {availableClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-medium">{classItem.name}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-4" />
                        {classItem.students} students
                      </span>
                      <span>{classItem.wordSets} word sets</span>
                      <span>{classItem.progress}% progress</span>
                    </div>
                  </div>
                  <Button onClick={() => onAssign(classItem)}>
                    <Plus className="size-4" />
                    Assign
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface AddWordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWords: (words: NewWordInput[]) => void;
}

function AddWordDialog({
  open,
  onOpenChange,
  onAddWords,
}: AddWordDialogProps) {
  const [term, setTerm] = useState("");
  const [translation, setTranslation] = useState("");
  const [exampleSentence, setExampleSentence] = useState("");
  const [bulkInput, setBulkInput] = useState("");

  const parsedBulkWords = useMemo(
    () => parseBulkWordInput(bulkInput),
    [bulkInput],
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (parsedBulkWords.length > 0) {
      onAddWords(parsedBulkWords);
      setBulkInput("");
      setTerm("");
      setTranslation("");
      setExampleSentence("");
      onOpenChange(false);
      return;
    }

    if (!term.trim() || !translation.trim()) {
      return;
    }

    onAddWords([
      {
        term: term.trim(),
        translation: translation.trim(),
        exampleSentence: exampleSentence.trim(),
      },
    ]);
    setTerm("");
    setTranslation("");
    setExampleSentence("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Word</DialogTitle>
            <DialogDescription>
              Add one word manually or paste multiple rows.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            <Field>
              <FieldLabel htmlFor="word-term">Term</FieldLabel>
              <Input
                id="word-term"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="e.g., appointment"
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="word-translation">Translation</FieldLabel>
              <Input
                id="word-translation"
                value={translation}
                onChange={(event) => setTranslation(event.target.value)}
                placeholder="e.g., scheduled meeting"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="word-example">Example Sentence</FieldLabel>
              <Textarea
                id="word-example"
                value={exampleSentence}
                onChange={(event) => setExampleSentence(event.target.value)}
                placeholder="Use the word in a short sentence."
              />
            </Field>

            <div className="flex items-center gap-3 text-xs uppercase text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              bulk input
              <div className="h-px flex-1 bg-border" />
            </div>

            <Field>
              <FieldLabel htmlFor="bulk-words">
                Paste words: term, translation, example
              </FieldLabel>
              <Textarea
                id="bulk-words"
                value={bulkInput}
                onChange={(event) => setBulkInput(event.target.value)}
                placeholder={"borrow, take and return later, Can I borrow your pen?\nreceipt, proof of payment, Keep the receipt."}
              />
            </Field>

            {parsedBulkWords.length > 0 && (
              <div className="rounded-lg border bg-muted/40 p-3">
                <div className="text-sm font-medium">
                  Parsed preview ({parsedBulkWords.length})
                </div>
                <div className="mt-2 max-h-32 space-y-2 overflow-y-auto text-sm">
                  {parsedBulkWords.map((word, index) => (
                    <div key={`${word.term}-${index}`} className="min-w-0">
                      <span className="font-medium">{word.term}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        - {word.translation}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              disabled={
                parsedBulkWords.length === 0 &&
                (!term.trim() || !translation.trim())
              }
            >
              Add Word
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ViewWordDialogProps {
  word: MockWord | null;
  onOpenChange: (open: boolean) => void;
}

function ViewWordDialog({ word, onOpenChange }: ViewWordDialogProps) {
  return (
    <Dialog open={Boolean(word)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{word?.term ?? "Word details"}</DialogTitle>
          <DialogDescription>Word performance and example usage.</DialogDescription>
        </DialogHeader>

        {word && (
          <div className="grid gap-4">
            <div className="grid gap-3 rounded-lg border p-4">
              <div>
                <div className="text-sm text-muted-foreground">Term</div>
                <div className="mt-1 font-medium">{word.term}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Translation
                </div>
                <div className="mt-1 font-medium">{word.translation}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Example sentence
                </div>
                <div className="mt-1 text-sm">{word.exampleSentence}</div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Mastery</span>
                <span className="font-medium">{word.masteryLevel}%</span>
              </div>
              <Progress value={word.masteryLevel} className="mt-3 h-2" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryMetric
                icon={Target}
                label="Correct answers"
                value={word.correctAnswers}
              />
              <SummaryMetric
                icon={Trash2}
                label="Wrong answers"
                value={word.wrongAnswers}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface EditWordDialogProps {
  word: MockWord | null;
  onOpenChange: (open: boolean) => void;
  onSave: (word: WordInput) => void;
}

function EditWordDialog({
  word,
  onOpenChange,
  onSave,
}: EditWordDialogProps) {
  const [term, setTerm] = useState(word?.term ?? "");
  const [translation, setTranslation] = useState(word?.translation ?? "");
  const [exampleSentence, setExampleSentence] = useState(
    word?.exampleSentence ?? "",
  );

  useEffect(() => {
    if (!word) {
      return;
    }

    setTerm(word.term);
    setTranslation(word.translation);
    setExampleSentence(word.exampleSentence);
  }, [word]);

  const handleOpenChange = (open: boolean) => {
    if (open && word) {
      setTerm(word.term);
      setTranslation(word.translation);
      setExampleSentence(word.exampleSentence);
    }

    onOpenChange(open);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!word || !term.trim() || !translation.trim()) {
      return;
    }

    onSave({
      id: word.id,
      term: term.trim(),
      translation: translation.trim(),
      exampleSentence: exampleSentence.trim(),
    });
  };

  return (
    <Dialog open={Boolean(word)} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Word</DialogTitle>
            <DialogDescription>
              Update the term, translation, and example sentence.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            <Field>
              <FieldLabel htmlFor="edit-word-term">Term</FieldLabel>
              <Input
                id="edit-word-term"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="e.g., appointment"
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-word-translation">
                Translation
              </FieldLabel>
              <Input
                id="edit-word-translation"
                value={translation}
                onChange={(event) => setTranslation(event.target.value)}
                placeholder="e.g., scheduled meeting"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-word-example">
                Example sentence
              </FieldLabel>
              <Textarea
                id="edit-word-example"
                value={exampleSentence}
                onChange={(event) => setExampleSentence(event.target.value)}
                placeholder="Use the word in a short sentence."
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
            <Button type="submit" disabled={!term.trim() || !translation.trim()}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteWordDialogProps {
  word: MockWord | null;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

function DeleteWordDialog({
  word,
  onOpenChange,
  onDelete,
}: DeleteWordDialogProps) {
  return (
    <AlertDialog open={Boolean(word)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this word?</AlertDialogTitle>
          <AlertDialogDescription>
            {word?.term} will be removed from this word set in the local mock
            view.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={onDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface EditWordSetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue: WordSetOverviewInput;
  onSave: (overview: WordSetOverviewInput) => void;
}

function EditWordSetDialog({
  open,
  onOpenChange,
  initialValue,
  onSave,
}: EditWordSetDialogProps) {
  const [title, setTitle] = useState(initialValue.title);
  const [description, setDescription] = useState(initialValue.description);
  const [tag, setTag] = useState(initialValue.tag);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitle(initialValue.title);
    setDescription(initialValue.description);
    setTag(initialValue.tag);
  }, [initialValue.description, initialValue.tag, initialValue.title, open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setTitle(initialValue.title);
      setDescription(initialValue.description);
      setTag(initialValue.tag);
    }

    onOpenChange(nextOpen);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!title.trim() || !description.trim() || !tag.trim()) {
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      tag: tag.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Word Set</DialogTitle>
            <DialogDescription>
              Update the word set title, description, and tag.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            <Field>
              <FieldLabel htmlFor="word-set-title">Title</FieldLabel>
              <Input
                id="word-set-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g., Daily routines"
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="word-set-description">
                Description
              </FieldLabel>
              <Textarea
                id="word-set-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe this word set"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="word-set-tag">Tag</FieldLabel>
              <Input
                id="word-set-tag"
                value={tag}
                onChange={(event) => setTag(event.target.value)}
                placeholder="e.g., English A2"
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
              disabled={!title.trim() || !description.trim() || !tag.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteWordSetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wordSetTitle: string;
  onDelete: () => void;
}

function DeleteWordSetDialog({
  open,
  onOpenChange,
  wordSetTitle,
  onDelete,
}: DeleteWordSetDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete word set?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove {wordSetTitle} from the local mock view. This
            action cannot be undone in this session.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={onDelete}
          >
            Delete Word Set
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
