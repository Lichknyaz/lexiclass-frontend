"use client";

import { Users, BookText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export interface ClassData {
  id: string;
  name: string;
  students: number;
  wordSets: number;
  progress: number;
}

interface ClassCardProps {
  classData: ClassData;
  onOpen?: (classData: ClassData) => void;
}

export function ClassCard({ classData, onOpen }: ClassCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{classData.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="size-4" />
            <span>{classData.students} students</span>
          </div>
          <div className="flex items-center gap-2">
            <BookText className="size-4" />
            <span>{classData.wordSets} word sets</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-medium">{classData.progress}%</span>
          </div>
          <Progress value={classData.progress} className="h-2" />
        </div>

        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => onOpen?.(classData)}
        >
          Open
        </Button>
      </CardContent>
    </Card>
  );
}
