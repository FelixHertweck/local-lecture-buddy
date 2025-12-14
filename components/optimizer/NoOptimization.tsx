"use client";

import { useEffect } from "react";
import { useWorkflow } from "@/lib/contexts/WorkflowContext";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
export function NoOptimization() {
  const { actions, state } = useWorkflow();

  // Set optimized data so next button is enabled
  useEffect(() => {
    if (state.inputData && !state.optimizedData) {
      actions.setOptimizedData({
        originalInput: state.inputData,
        processedText:
          state.inputData.type === "text" ? state.inputData.content : "",
        metadata: { editedManually: false },
      });
    }
  }, [state.inputData, state.optimizedData, actions]);

  return (
    <ScrollArea className="h-full">
      <Card className="m-4 p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-lg text-muted-foreground">No optimization needed</p>
      </Card>
    </ScrollArea>
  );
}
