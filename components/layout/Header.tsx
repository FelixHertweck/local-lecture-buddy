"use client";

import { GraduationCap, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToolsWarningDialog } from "@/components/tools/ToolsWarningDialog";
import { useWorkflow } from "@/lib/contexts/WorkflowContext";

// Application header with logo, theme toggle, and reset functionality
export function Header() {
  const { setTheme } = useTheme();
  const { actions, state } = useWorkflow();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [dontShowResetWarning, setDontShowResetWarning] = useState(false);

  const handleLogoClick = () => {
    if (state.inputData || state.optimizedData) {
      setShowResetDialog(true);
    } else {
      actions.reset();
    }
  };

  const handleResetConfirm = () => {
    setShowResetDialog(false);
    actions.setDontShowToolsWarning(dontShowResetWarning);
    actions.reset();
  };

  const handleResetCancel = () => {
    setShowResetDialog(false);
    setDontShowResetWarning(false);
  };

  return (
    <header className="fixed top-0 w-full h-16 border-b bg-background z-50">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-full">
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <GraduationCap className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold">Local Lecture Buddy</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ToolsWarningDialog
          open={showResetDialog}
          onOpenChange={setShowResetDialog}
          dontShowAgain={dontShowResetWarning}
          onDontShowAgainChange={setDontShowResetWarning}
          onConfirm={handleResetConfirm}
          onCancel={handleResetCancel}
          dialogId="reset-warning"
        />
      </div>
    </header>
  );
}
