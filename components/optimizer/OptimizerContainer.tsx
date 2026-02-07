"use client";

import { useWorkflow } from "@/lib/contexts/WorkflowContext";
import { OCRProcessor } from "./OCRProcessor";
import { NoOptimization } from "./NoOptimization";

// Second step container - data optimization (OCR for images, passthrough for text)
export function OptimizerContainer() {
  const { state } = useWorkflow();

  if (!state.inputData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">No input data available</p>
      </div>
    );
  }

  if (state.inputData.type === "image") {
    return <OCRProcessor imageData={state.inputData.data} />;
  }

  if (state.inputData.type === "text") {
    return <NoOptimization />;
  }

  return (
    <div className="h-full flex items-center justify-center">
      <p className="text-muted-foreground">Unsupported input type</p>
    </div>
  );
}
