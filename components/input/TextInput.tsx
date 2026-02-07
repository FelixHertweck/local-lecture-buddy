"use client";

import { useEffect, useRef } from "react";
import { useWorkflow } from "@/lib/contexts/WorkflowContext";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { validateTextInput } from "@/lib/validation";

// Text input component with validation and debounced updates
export function TextInput() {
  const { state, actions } = useWorkflow();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current text from state, or empty string if no text input yet
  const currentText =
    state.inputData?.type === "text" ? state.inputData.content : "";

  const handleTextChange = (text: string) => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const trimmedText = text.trim();
    // Validate before setting new timeout for debounced input
    if (trimmedText) {
      const validation = validateTextInput(text);
      if (validation.valid) {
        timeoutRef.current = setTimeout(() => {
          actions.setInput({
            type: "text",
            content: trimmedText,
            timestamp: new Date(),
          });
        }, 500);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Card className="p-6">
      <Label htmlFor="text-input">Enter your text</Label>
      <Textarea
        id="text-input"
        defaultValue={currentText}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder="Type or paste your text here..."
        className="min-h-[200px] mt-2"
      />
    </Card>
  );
}
