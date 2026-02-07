"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

// Welcome dialog providing information about the application
export function InformationDialog() {
  const [open, setOpen] = useState(() => {
    // Check if user has previously set "Don't Show Again"
    if (typeof window === "undefined") {
      return false;
    }
    const isDismissed = localStorage.getItem(
      "lecture-buddy-info-dialog-dismissed",
    );
    return !isDismissed;
  });
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Welcome to Lecture Buddy</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-base space-y-4 pt-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Local-Only Application
                </h3>
                <p>
                  Lecture Buddy runs completely locally in your browser using{" "}
                  <a
                    href="https://developer.chrome.com/docs/ai/built-in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Chrome&apos;s built-in AI capabilities
                  </a>
                  . Your data never leaves your device.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Browser Requirements
                </h3>
                <p>
                  This application currently works only on{" "}
                  <strong>Chrome 138+</strong>. While other browsers may receive
                  these features in the future, they are currently only
                  implemented in Chrome.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Device Compatibility
                </h3>
                <p>
                  The built-in Large Language Models (LLM) work exclusively on{" "}
                  <strong>Chrome Desktop</strong> and perform best on newer
                  devices with sufficient computational resources.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Experimental Features
                </h3>
                <p>
                  Some features, such as AI Chat, rely on experimental APIs like
                  the Prompt API. These features require an origin trial to be
                  activated. Please note that future Chrome versions may
                  introduce breaking changes to these experimental APIs.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Location & Language Detection
                </h3>
                <p>
                  This application uses your device&apos;s location to detect
                  your country and automatically extract your preferred language
                  for translation tool.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="dont-show-again"
              checked={dontShowAgain}
              onChange={(e) => {
                const checked = e.target.checked;
                setDontShowAgain(checked);
                if (checked) {
                  localStorage.setItem(
                    "lecture-buddy-info-dialog-dismissed",
                    "true",
                  );
                }
              }}
              className="w-4 h-4 rounded border-gray-300 cursor-pointer"
            />
            <Label htmlFor="dont-show-again" className="text-sm cursor-pointer">
              Don&apos;t Show Again
            </Label>
          </div>
          <AlertDialogAction onClick={handleClose}>Got It</AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
