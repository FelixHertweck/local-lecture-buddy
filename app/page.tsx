"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { WorkflowProvider, useWorkflow } from "@/lib/contexts/WorkflowContext";
import { Header } from "@/components/layout/Header";
import { StepIndicator } from "@/components/layout/StepIndicator";
import { NavigationButtons } from "@/components/layout/NavigationButtons";
import { InputContainer } from "@/components/input/InputContainer";
import { OptimizerContainer } from "@/components/optimizer/OptimizerContainer";
import { ToolsContainer } from "@/components/tools/ToolsContainer";
import { InformationDialog } from "@/components/dialogs/InformationDialog";

export default function Page() {
  return (
    <WorkflowProvider>
      <Content />
    </WorkflowProvider>
  );
}

function Content() {
  const { state } = useWorkflow();

  // Warn user when closing tab if there's unsaved data
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.inputData || state.optimizedData) {
        e.preventDefault();
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state.inputData, state.optimizedData]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <InformationDialog />
      {/* Fixed Header - 64px */}
      <Header />

      {/* Main Content Area - Flexible */}
      <main className="flex-1 overflow-hidden pt-16 pb-20">
        <div className="h-full max-w-7xl mx-auto px-4">
          {/* Stepper - Fixed within content */}
          <StepIndicator />

          {/* Step Content - Scrollable */}
          <div className="h-[calc(100%-120px)] overflow-hidden">
            <AnimatePresence mode="wait">
              {state.currentStep === "input" && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <InputContainer />
                </motion.div>
              )}

              {state.currentStep === "optimizer" && (
                <motion.div
                  key="optimizer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <OptimizerContainer />
                </motion.div>
              )}

              {state.currentStep === "tools" && (
                <motion.div
                  key="tools"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <ToolsContainer />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Fixed Navigation - 80px */}
      <NavigationButtons />
    </div>
  );
}
