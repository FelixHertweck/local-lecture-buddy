"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIChat } from "./AIChat";
import { AISummarizer } from "./AISummarizer";
import { APITranslator } from "./APITranslator";

export function ToolsContainer() {
  const [activeTab, setActiveTab] = useState<
    "chat" | "summarizer" | "translator"
  >("chat");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Tabs
        value={activeTab}
        onValueChange={(v) =>
          setActiveTab(v as "chat" | "summarizer" | "translator")
        }
        className="flex-1 min-h-0 flex flex-col"
      >
        <TabsList className="flex-shrink-0 grid w-full grid-cols-3">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="summarizer">Summarizer</TabsTrigger>
          <TabsTrigger value="translator">Translator</TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0 overflow-hidden relative">
          <div
            className={`h-full overflow-hidden ${activeTab !== "chat" ? "hidden" : ""}`}
          >
            <AIChat />
          </div>

          <div
            className={`h-full overflow-hidden absolute inset-0 ${activeTab !== "summarizer" ? "hidden" : ""}`}
          >
            <AISummarizer />
          </div>

          <div
            className={`h-full overflow-hidden absolute inset-0 ${activeTab !== "translator" ? "hidden" : ""}`}
          >
            <APITranslator />
          </div>
        </div>
      </Tabs>
    </div>
  );
}
