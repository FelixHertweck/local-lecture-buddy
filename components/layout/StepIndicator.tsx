"use client";

import React, { useState } from "react";
import { Upload, Settings, Wrench } from "lucide-react";
import { useWorkflow } from "@/lib/contexts/WorkflowContext";
import { canNavigateToStep } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ToolsWarningDialog } from "@/components/tools/ToolsWarningDialog";
import type { WorkflowStep } from "@/lib/types";

const STEP_CONFIG = [
  { id: "input" as WorkflowStep, label: "Input", icon: Upload },
  {
    id: "optimizer" as WorkflowStep,
    label: "Data Optimization",
    icon: Settings,
  },
  { id: "tools" as WorkflowStep, label: "Tools", icon: Wrench },
];

export function StepIndicator() {
  const { state, actions } = useWorkflow();
  const [showWarning, setShowWarning] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [nextStep, setNextStep] = useState<WorkflowStep | null>(null);

  const handleStepClick = (targetStep: WorkflowStep) => {
    const validation = canNavigateToStep(targetStep, state);

    if (!validation.allowed) {
      toast.error(validation.reason || "Cannot navigate to this step");
      return;
    }

    // Check if leaving from tools with changes
    if (
      state.currentStep === "tools" &&
      state.hasToolsChanges &&
      !state.dontShowToolsWarningAgain
    ) {
      setNextStep(targetStep);
      setShowWarning(true);
      return;
    }

    actions.navigateToStep(targetStep);
    // Reset tools changes when leaving tools
    if (state.currentStep === "tools") {
      actions.setToolsChanges(false);
    }
  };

  const handleWarningConfirm = () => {
    if (nextStep) {
      if (dontShowAgain) {
        actions.setDontShowToolsWarning(true);
      }
      actions.navigateToStep(nextStep);
      actions.setToolsChanges(false);
      setShowWarning(false);
      setDontShowAgain(false);
      setNextStep(null);
    }
  };

  const handleWarningCancel = () => {
    setShowWarning(false);
    setDontShowAgain(false);
    setNextStep(null);
  };

  return (
    <>
      <div className="flex justify-center items-center gap-4 py-6">
        {STEP_CONFIG.map((step, index) => {
          const isActive = state.currentStep === step.id;
          const currentIndex = STEP_CONFIG.findIndex(
            (s) => s.id === state.currentStep,
          );
          const stepIndex = STEP_CONFIG.findIndex((s) => s.id === step.id);
          const isCompleted = stepIndex < currentIndex;
          const isLocked = state.lockedSteps.has(step.id);
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => handleStepClick(step.id)}
                  disabled={isLocked}
                  className={cn(
                    "w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center",
                    isActive &&
                      "bg-primary text-primary-foreground border-primary",
                    isCompleted && !isActive && "bg-primary/20 border-primary",
                    !isActive && !isCompleted && "border-muted-foreground/30",
                    isLocked && "opacity-50 cursor-not-allowed",
                    !isLocked && "hover:scale-110 cursor-pointer",
                  )}
                >
                  <Icon className="w-5 h-5" />
                </button>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isActive && "text-primary",
                    !isActive && "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>

              {index < STEP_CONFIG.length - 1 && (
                <div
                  className={cn(
                    "h-1 w-32 transition-colors rounded-full",
                    isCompleted ? "bg-primary" : "bg-muted",
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <ToolsWarningDialog
        open={showWarning}
        onOpenChange={setShowWarning}
        dontShowAgain={dontShowAgain}
        onDontShowAgainChange={setDontShowAgain}
        onConfirm={handleWarningConfirm}
        onCancel={handleWarningCancel}
        dialogId="stepper"
      />
    </>
  );
}
