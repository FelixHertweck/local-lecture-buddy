"use client";

import { FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWorkflow } from "@/lib/contexts/WorkflowContext";
import { ImageInput } from "./ImageInput";
import { TextInput } from "./TextInput";

export function InputContainer() {
  const { state, actions } = useWorkflow();
  const selectedType = state.selectedInputType;

  return (
    <div className="h-full flex flex-col">
      {/* Top: Selection Buttons */}
      <div className="border-b p-4 space-y-2">
        <div className="flex gap-4 flex-wrap">
          <Button
            onClick={() => actions.setSelectedInputType("image")}
            variant={selectedType === "image" ? "default" : "outline"}
            className="gap-2"
            size="lg"
          >
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image className="w-5 h-5" />
            Image Input
          </Button>

          <Button
            onClick={() => actions.setSelectedInputType("text")}
            variant={selectedType === "text" ? "default" : "outline"}
            className="gap-2"
            size="lg"
          >
            <FileText className="w-5 h-5" />
            Text Input
          </Button>

          {selectedType && (
            <Button
              onClick={() => {
                actions.setSelectedInputType(null);
                actions.reset();
              }}
              variant="ghost"
              className="ml-auto"
            >
              Clear Selection
            </Button>
          )}
        </div>
        {!selectedType && (
          <p className="text-sm text-muted-foreground">
            Select how you want to provide your content
          </p>
        )}
      </div>

      {/* Bottom: Content Area with Scrollbar */}
      {selectedType === "image" ? (
        <div className="flex-1 overflow-hidden p-6">
          <ImageInput />
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-6">
            {selectedType === "text" && <TextInput />}

            {!selectedType && (
              <div className="text-center space-y-4 text-muted-foreground">
                <p className="text-lg">
                  Please select an input type from above to get started
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
