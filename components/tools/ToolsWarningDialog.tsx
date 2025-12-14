"use client";

import { Label } from "@/components/ui/label";
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

interface ToolsWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dontShowAgain: boolean;
  onDontShowAgainChange: (checked: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  dialogId?: string;
}

export function ToolsWarningDialog({
  open,
  onOpenChange,
  dontShowAgain,
  onDontShowAgainChange,
  onConfirm,
  onCancel,
  dialogId = "tools-warning",
}: ToolsWarningDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave Tools?</AlertDialogTitle>
          <AlertDialogDescription>
            All chat history and changes in the Tools will be deleted and cannot
            be recovered.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-center space-x-2 py-2">
          <input
            id={`dont-show-again-${dialogId}`}
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => onDontShowAgainChange(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <Label
            htmlFor={`dont-show-again-${dialogId}`}
            className="font-normal cursor-pointer"
          >
            Don&apos;t show again
          </Label>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Leave</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
