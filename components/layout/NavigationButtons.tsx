"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useWorkflow } from "@/lib/contexts/WorkflowContext";
import { Button } from "@/components/ui/button";
import { ToolsWarningDialog } from "@/components/tools/ToolsWarningDialog";
import type { WorkflowStep } from "@/lib/types";
import { WorkflowStep_Array } from "@/lib/types";

export function NavigationButtons() {
  const { state, actions } = useWorkflow();
  const [showWarning, setShowWarning] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [nextStep, setNextStep] = useState<WorkflowStep | null>(null);

  const currentIndex = WorkflowStep_Array.indexOf(state.currentStep);
  const showBack = currentIndex > 0;
  const showNext = currentIndex < WorkflowStep_Array.length - 1;

  const canProceed = () => {
    if (state.currentStep === "input") return !!state.inputData;
    if (state.currentStep === "optimizer") return !!state.optimizedData;
    return false;
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const targetStep = WorkflowStep_Array[currentIndex - 1];
      // Only show warning if coming from tools with changes
      if (
        state.currentStep === "tools" &&
        state.hasToolsChanges &&
        !state.dontShowToolsWarningAgain
      ) {
        setNextStep(targetStep);
        setShowWarning(true);
      } else {
        actions.navigateToStep(targetStep);
        // Reset tools changes when leaving tools
        if (state.currentStep === "tools") {
          actions.setToolsChanges(false);
        }
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < WorkflowStep_Array.length - 1 && canProceed()) {
      const targetStep = WorkflowStep_Array[currentIndex + 1];
      // Show warning if leaving tools with changes
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
      <div className="fixed bottom-0 w-full border-t bg-background p-4 z-40">
        <div className="max-w-7xl mx-auto flex justify-between">
          {showBack ? (
            <Button
              onClick={handleBack}
              variant="outline"
              disabled={state.isProcessing}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {showNext && (
            <Button
              onClick={handleNext}
              disabled={!canProceed() || state.isProcessing}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      <ToolsWarningDialog
        open={showWarning}
        onOpenChange={setShowWarning}
        dontShowAgain={dontShowAgain}
        onDontShowAgainChange={setDontShowAgain}
        onConfirm={handleWarningConfirm}
        onCancel={handleWarningCancel}
        dialogId="navigation"
      />
    </>
  );
}
