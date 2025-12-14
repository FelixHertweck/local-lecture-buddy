import type { WorkflowStep, WorkflowState } from "@/lib/types";
import { WorkflowStep_Array } from "@/lib/types";

export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "File must be an image" };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: "Image must be smaller than 10MB" };
  }

  return { valid: true };
}

export function validateTextInput(text: string): {
  valid: boolean;
  error?: string;
} {
  if (!text.trim()) {
    return { valid: false, error: "Text cannot be empty" };
  }

  // Check max length (adjust as needed)
  const maxLength = 50000;
  if (text.length > maxLength) {
    return {
      valid: false,
      error: `Text must be shorter than ${maxLength} characters`,
    };
  }

  return { valid: true };
}

export function canNavigateToStep(
  targetStep: WorkflowStep,
  currentState: WorkflowState,
): { allowed: boolean; reason?: string } {
  // Always allow backward navigation (unless locked)
  const currentIndex = WorkflowStep_Array.indexOf(currentState.currentStep);
  const targetIndex = WorkflowStep_Array.indexOf(targetStep);

  if (currentState.lockedSteps.has(targetStep)) {
    return { allowed: false, reason: "Step is currently processing" };
  }

  if (targetIndex <= currentIndex) {
    return { allowed: true };
  }

  // Forward navigation checks
  if (targetStep === "optimizer" && !currentState.inputData) {
    return { allowed: false, reason: "Please provide input first" };
  }

  if (targetStep === "tools") {
    if (currentState.isProcessing) {
      return {
        allowed: false,
        reason: "Data optimization is still processing",
      };
    }
    if (!currentState.optimizedData) {
      return { allowed: false, reason: "Please process data first" };
    }
  }

  return { allowed: true };
}
