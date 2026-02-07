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

// Main page component wrapped with workflow context provider
export default function Page() {
  return (
    <WorkflowProvider>
      <Content />
    </WorkflowProvider>
  );
}

// Main content component with multi-step workflow layout
function Content() {
  const { state } = useWorkflow();

  // Prevent accidental tab closure when there's unsaved data
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
      {/* Fixed Header */}
      <Header />

      {/* Main content area with step-based workflow */}
      <main className="flex-1 overflow-hidden pt-16 pb-20">
        <div className="h-full max-w-7xl mx-auto px-4">
          {/* Step indicator showing current progress */}
          <StepIndicator />

          {/* Animated step content - switches between input, optimizer, and tools */}
          <div className="h-[calc(100%-120px)] overflow-hidden">
            <AnimatePresence mode="wait">
              {/* Step 1: Image input and upload */}
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

              {/* Step 2: Image processing and optimization */}
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

              {/* Step 3: AI-powered tools (chat, summarizer, translator) */}
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

      {/* Fixed navigation buttons for step progression */}
      <NavigationButtons />
    </div>
  );
}
