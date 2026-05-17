"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { getErrorMessage } from "@/utils";

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (className: string) => void | Promise<void>;
}

export function CreateClassDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateClassDialogProps) {
  const [className, setClassName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (className.trim()) {
      setIsSubmitting(true);
      setErrorMessage("");

      try {
        await onCreate(className.trim());
        setClassName("");
        onOpenChange(false);
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Could not create class"));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
            <DialogDescription>
              Enter a name for your new vocabulary class.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="grid gap-3">
              {errorMessage && (
                <div className="rounded-lg border border-destructive/30 px-3 py-2 text-sm text-destructive">
                  {errorMessage}
                </div>
              )}
              <Field>
                <FieldLabel htmlFor="class-name">Class Name</FieldLabel>
                <Input
                  id="class-name"
                  placeholder="e.g., English B2"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  autoFocus
                />
              </Field>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!className.trim() || isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
