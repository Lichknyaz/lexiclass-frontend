"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  EmptyContent,
} from "@/components/ui/empty";
import { Sidebar } from "./sidebar";
import { MobileSidebar } from "./mobile-sidebar";
import { ClassCard, type ClassData } from "./class-card";
import { CreateClassDialog } from "./create-class-dialog";
import { mockClasses } from "@/lib/mock-data";

export function TeacherDashboard() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassData[]>(mockClasses);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateClass = (className: string) => {
    const newClass: ClassData = {
      id: Date.now().toString(),
      name: className,
      students: 0,
      wordSets: 0,
      progress: 0,
    };
    setClasses((prev) => [...prev, newClass]);
  };

  const handleOpenClass = (classData: ClassData) => {
    router.push(`/teacher/classes/${classData.id}`);
  };

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex" />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <MobileSidebar />
            <h1 className="text-xl font-semibold">My Classes</h1>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Create Class
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {classes.length === 0 ? (
            <Empty className="h-full border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BookOpen />
                </EmptyMedia>
                <EmptyTitle>No classes yet</EmptyTitle>
                <EmptyDescription>
                  Create your first class to start teaching vocabulary to your
                  students.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="size-4" />
                  Create Your First Class
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {classes.map((classItem) => (
                <ClassCard
                  key={classItem.id}
                  classData={classItem}
                  onOpen={handleOpenClass}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create Class Dialog */}
      <CreateClassDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreate={handleCreateClass}
      />
    </div>
  );
}
