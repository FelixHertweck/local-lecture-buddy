"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User } from "lucide-react";
import { useWorkflow } from "@/lib/contexts/WorkflowContext";
import { checkLanguageModelAvailability } from "@/lib/ai-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Message, ContextMode } from "@/lib/types";
import { MarkdownRenderer } from "@/components/custom-ui/MarkdownRenderer";

export function AIChat() {
  const { state, actions } = useWorkflow();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contextMode, setContextMode] = useState<ContextMode>("both");

  const [availability, setAvailability] = useState<Availability | null>(null);
  const [imageSupport, setImageSupport] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloadingModel, setIsDownloadingModel] = useState(false);
  const sessionRef = useRef<LanguageModel | null>(null);
  const downloadStartedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    (async () => {
      const r = await checkLanguageModelAvailability();
      setAvailability(r.availability as Availability);
      setImageSupport(r.imageSupport);
    })();
    const interval = setInterval(async () => {
      const r = await checkLanguageModelAvailability();
      const newAvailability = r.availability as Availability;
      setAvailability(newAvailability);
      setImageSupport(r.imageSupport);

      // Auto-start download when status changes to downloadable
      if (
        newAvailability === "downloadable" &&
        !sessionRef.current &&
        !downloadStartedRef.current
      ) {
        downloadStartedRef.current = true;
        setIsLoading(true);
        setDownloadProgress(0);
        setIsDownloadingModel(false);

        // Add system message about download
        const systemMessage: Message = {
          id: `system-${Date.now()}`,
          role: "assistant",
          content: "Preparing AI Chat model...",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, systemMessage]);

        void initializeSession();
      }
    }, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom only if user is near bottom
    if (messagesEndRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;

      if (isNearBottom || messages.length === 1) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages]);

  // availability checks handled via `checkLanguageModelAvailability` helper.
  // The helper function sets availability and imageSupport states.

  const initializeSession = async () => {
    if (sessionRef.current) return sessionRef.current;

    if (typeof LanguageModel === "undefined") {
      throw new Error("LanguageModel not available");
    }

    try {
      const systemPrompt = getSystemPrompt();
      const expectedInputs: LanguageModelExpected[] = [
        { type: "text", languages: ["en"] },
      ];
      if (contextMode === "image" || contextMode === "both") {
        expectedInputs.push({ type: "image" });
      }

      const session = await LanguageModel.create({
        expectedInputs,
        expectedOutputs: [{ type: "text", languages: ["en"] }],
        initialPrompts: [{ role: "system", content: systemPrompt }],
        monitor(m) {
          m.addEventListener("downloadprogress", (e) => {
            const progress = (e.loaded / e.total) * 100;
            setIsDownloadingModel(true);
            setDownloadProgress(Math.min(progress, 99));
            console.log(`Downloaded ${Math.round(progress)}%`);
          });
        },
      });

      setDownloadProgress(100);
      setIsDownloadingModel(false);
      sessionRef.current = session;
      return session;
    } catch (error) {
      toast.error("Failed to initialize AI session");
      throw error;
    }
  };

  const getSystemPrompt = (): string => {
    const { optimizedData } = state;

    if (contextMode === "text" && optimizedData) {
      return `You are an AI learning assistant helping students understand educational content. 

Your role:
- Answer questions about the provided text clearly and concisely
- Explain difficult concepts in simple terms
- Provide examples when helpful
- Break down complex topics into understandable parts
- Encourage critical thinking

Context (student's material):
${optimizedData.processedText}

Always base your answers on the provided context when relevant. If a question goes beyond the context, clearly indicate this.`;
    }

    if (contextMode === "image") {
      return `You are an AI learning assistant helping students analyze educational images.

Your role:
- Describe what you see in the image clearly
- Identify diagrams, charts, formulas, or important visual elements
- Explain the educational content shown
- Answer questions about the visual material
- Connect visual information to concepts when possible

Provide detailed, educational responses based on the image content.`;
    }

    if (contextMode === "both" && optimizedData) {
      return `You are an AI learning assistant helping students with multimodal educational content.

Your role:
- Combine information from both text and image to provide complete answers
- Reference specific parts of the text or image when explaining
- Connect visual and textual information
- Explain how the image relates to the text content
- Provide comprehensive educational support

Text context:
${optimizedData.processedText}

You also have access to an associated image. Use both sources to give thorough, well-rounded answers.`;
    }

    return `You are an AI learning assistant helping students with their studies.

Your role:
- Answer questions clearly and helpfully
- Explain concepts in an accessible way
- Encourage learning and understanding
- Ask clarifying questions when needed

Provide educational, supportive responses.`;
  };

  const sendMessage = async () => {
    if (!input.trim() || availability !== "available") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Create assistant message placeholder immediately
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(true);
    setDownloadProgress(0);
    setIsDownloadingModel(false);

    try {
      const session = await initializeSession();

      const userPromptContent: LanguageModelMessageContent[] = [
        { type: "text", value: input },
      ];
      if (
        (contextMode === "image" || contextMode === "both") &&
        state.inputData?.type === "image" &&
        imageRef.current
      ) {
        userPromptContent.push({ type: "image", value: imageRef.current });
      }

      // Build prompt with conversation history
      const historyMessages: LanguageModelMessage[] = messages
        .filter((m) => m.id !== assistantMessage.id) // Exclude the placeholder
        .map((m) => ({
          role: m.role,
          content:
            m.role === "user"
              ? m.content
              : [{ type: "text" as const, value: m.content }],
        }));

      const currentMessage: LanguageModelMessage = {
        role: "user",
        content: userPromptContent,
      };

      const prompt: LanguageModelMessage[] = [
        ...historyMessages,
        currentMessage,
      ];

      const stream = session.promptStreaming(prompt);
      const reader = stream.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = typeof value === "string" ? value : String(value);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: m.content + chunkText }
                : m,
            ),
          );
        }
      } finally {
        reader.releaseLock();
      }

      // Trim trailing whitespace from final message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? { ...m, content: m.content.trim() }
            : m,
        ),
      );
      // Mark tools as having changes
      actions.setToolsChanges(true);
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Chat error:", error);
      // Remove the empty assistant message on error
      setMessages((prev) => prev.filter((m) => m.id !== assistantMessage.id));
    } finally {
      setIsLoading(false);
      setDownloadProgress(0);
      setIsDownloadingModel(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !isLoading &&
      availability === "available"
    ) {
      e.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
        src={
          state.inputData && state.inputData.type === "image"
            ? state.inputData.data
            : ""
        }
        alt="context"
        style={{ display: "none" }}
      />
      {/* Status Badge */}
      <div className="flex-shrink-0 p-4 border-b flex items-center justify-between">
        <div>
          <Label className="pb-2">Context Mode</Label>
          <Select
            value={contextMode}
            onValueChange={(v) => setContextMode(v as ContextMode)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="both" disabled={!imageSupport}>
                Text & Image
              </SelectItem>
              <SelectItem value="text">Text Only</SelectItem>
              <SelectItem value="image" disabled={!imageSupport}>
                Image Only
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {availability && (
          <Badge
            variant={
              availability === "available"
                ? "default"
                : availability === "downloadable"
                  ? "secondary"
                  : "destructive"
            }
          >
            {availability === "available" && "Ready"}
            {availability === "downloadable" && "Preparing..."}
            {availability === "unavailable" && "Unavailable"}
            {!imageSupport && availability === "available" && " (Text only)"}
          </Badge>
        )}
      </div>

      {/* Messages Area (Scrollable) */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 scrollbar-thin"
      >
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <p>Start a conversation with the AI assistant</p>
              {state.optimizedData && (
                <p className="text-sm mt-2">
                  The AI has access to your {contextMode} content
                </p>
              )}
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback
                  className={
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-purple-500 text-white"
                  }
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </AvatarFallback>
              </Avatar>

              {/* Message Card */}
              <div className="flex flex-col gap-1 max-w-[75%]">
                <Card
                  className={`p-3 ${
                    msg.role === "user"
                      ? "bg-blue-100 dark:bg-slate-700 border-blue-200 dark:border-slate-600"
                      : "bg-muted"
                  }`}
                >
                  {msg.content ? (
                    <MarkdownRenderer content={msg.content} />
                  ) : (
                    isLoading &&
                    msg.role === "assistant" && (
                      <p className="text-muted-foreground italic">
                        Thinking...
                      </p>
                    )
                  )}
                </Card>
                <p
                  className={`text-xs text-muted-foreground px-1 ${msg.role === "user" ? "text-right" : "text-left"}`}
                >
                  {msg.timestamp.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Browser Support Warning */}
          {availability === "unavailable" && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                AI Chat is currently not supported in this browser.
                <br />
                Currently AI Chat is only supported in Chromium-based browsers.
                <br />
                Try to use the latest version of Chrome.
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area (Fixed Bottom) */}
      <div className="flex-shrink-0 p-4 border-t">
        {/* Download Progress Bar - Only replaces input during actual download */}
        {isDownloadingModel && downloadProgress > 0 ? (
          <div className="w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
            <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 mb-2">
              <div
                className="bg-gray-600 dark:bg-gray-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 text-center font-medium">
              {`Downloading Model: ${Math.round(downloadProgress)}%`}
            </p>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={
                isLoading || !input.trim() || availability !== "available"
              }
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
