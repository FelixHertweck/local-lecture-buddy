"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Tesseract from "tesseract.js";
import { useWorkflow } from "@/lib/contexts/WorkflowContext";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ImagePopup } from "@/components/ui/ImagePopup";
import { toast } from "sonner";

interface OCRProcessorProps {
  imageData: string;
}

// Optical character recognition processor for extracting text from images
export function OCRProcessor({ imageData }: OCRProcessorProps) {
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [rerunTrigger, setRerunTrigger] = useState(0);
  const { actions, state } = useWorkflow();

  const hasRunOCRRef = useRef(false);

  // Memoize the save function to prevent it from changing on every render
  const saveOptimizedData = useCallback(
    (text: string, confidence?: number) => {
      if (!state.inputData) return;

      actions.setOptimizedData({
        originalInput: state.inputData,
        processedText: text,
        metadata: {
          ocrConfidence: confidence || 0,
          processingTime: Date.now(),
        },
      });
    },
    [actions, state.inputData],
  );

  // Effect to load saved text or run OCR - only runs when image changes
  useEffect(() => {
    // Reset ref when image changes
    hasRunOCRRef.current = false;

    // If we have saved optimized data with processed text that matches the current image, load it
    const savedData = state.optimizedData;
    const savedInput = savedData?.originalInput;
    const isMatchingImage =
      savedInput &&
      savedInput.type === "image" &&
      savedInput.data === imageData;

    if (savedData?.processedText && isMatchingImage && rerunTrigger === 0) {
      setExtractedText(savedData.processedText);
      setIsProcessing(false);
      hasRunOCRRef.current = true;
      return;
    }

    // Otherwise, run OCR
    if (imageData && (!hasRunOCRRef.current || rerunTrigger > 0)) {
      let isMounted = true;

      const runOCR = async () => {
        setIsProcessing(true);
        setProgress(0);
        setExtractedText("");
        actions.lockStep("optimizer");
        actions.setProcessing(true);

        try {
          const result = await Tesseract.recognize(imageData, "eng", {
            logger: (m) => {
              if (m.status === "recognizing text") {
                setProgress(Math.round((m.progress || 0) * 100));
              }
            },
          });

          if (!isMounted) return;

          setExtractedText(result.data.text);
          hasRunOCRRef.current = true;

          // Save immediately after OCR completes
          saveOptimizedData(result.data.text, result.data.confidence);

          toast.success("OCR processing completed");
        } catch (error) {
          if (!isMounted) return;
          toast.error("OCR processing failed");
          console.error("OCR error:", error);
        } finally {
          if (isMounted) {
            setIsProcessing(false);
            actions.unlockStep("optimizer");
            actions.setProcessing(false);
          }
        }
      };

      void runOCR();

      return () => {
        isMounted = false;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageData, rerunTrigger, actions, saveOptimizedData]);

  // Debounced save effect - saves changes when user manually edits text
  useEffect(() => {
    if (!extractedText || !hasRunOCRRef.current) {
      return;
    }

    // Only save if the text differs from what's already saved
    if (state.optimizedData?.processedText === extractedText) {
      return;
    }

    const timeoutId = setTimeout(() => {
      saveOptimizedData(
        extractedText,
        state.optimizedData?.metadata?.ocrConfidence,
      );
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [extractedText, saveOptimizedData, state.optimizedData]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Image Preview (fixed height) */}
      <div
        className="flex-shrink-0 h-48 relative cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setIsPopupOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageData}
          alt="Input"
          className="w-full h-full object-contain"
        />
      </div>

      <ImagePopup
        src={imageData}
        alt="Image Preview"
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />

      {/* Progress Indicator and Extracted Text */}
      <div className="flex-1 m-4 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center flex-shrink-0">
          <Label htmlFor="extracted-text">OCR: Extracted Text</Label>
          <Button
            onClick={() => {
              setExtractedText("");
              setRerunTrigger((prev) => prev + 1);
            }}
            variant="outline"
            size="sm"
            disabled={isProcessing}
          >
            Re-run OCR
          </Button>
        </div>

        {isProcessing ? (
          <div className="flex-1 flex flex-col items-center justify-center mt-2">
            <Progress value={progress} className="w-full" />
            <p className="text-center mt-4 text-sm text-muted-foreground">
              Processing: {progress}% Complete
            </p>
          </div>
        ) : (
          <Textarea
            id="extracted-text"
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            className="flex-1 mt-2 resize-none border-0 focus:ring-0 p-3 overflow-y-auto "
          />
        )}
      </div>
    </div>
  );
}
