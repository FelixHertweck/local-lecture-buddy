"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Download } from "lucide-react";
import { useWorkflow } from "@/lib/contexts/WorkflowContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { checkSummarizerAvailability } from "@/lib/ai-helpers";
import type { SummaryType, SummaryFormat, SummaryLength } from "@/lib/types";
import { MarkdownRenderer } from "@/components/custom-ui/MarkdownRenderer";

function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </div>
  );
}

export function AISummarizer() {
  const { state, actions } = useWorkflow();
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [type, setType] = useState<SummaryType>("key-points");
  const [format, setFormat] = useState<SummaryFormat>("markdown");
  const [length, setLength] = useState<SummaryLength>("medium");

  const [availability, setAvailability] = useState<Availability>("unavailable");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloadingModel, setIsDownloadingModel] = useState(false);
  const downloadStartedRef = useRef(false);
  const summarizerRef = useRef<{
    summarizer: Summarizer;
    type: SummaryType;
    format: SummaryFormat;
    length: SummaryLength;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const r = await checkSummarizerAvailability();
      setAvailability(r.availability as Availability);
    })();
    const interval = setInterval(async () => {
      const r = await checkSummarizerAvailability();
      const newAvailability = r.availability as Availability;
      setAvailability(newAvailability);

      // Auto-start download when status changes to downloadable
      if (newAvailability === "downloadable" && !downloadStartedRef.current) {
        downloadStartedRef.current = true;
        setIsLoading(true);
        setDownloadProgress(0);
        setIsDownloadingModel(false);

        // Trigger download by initializing summarizer
        try {
          await initializeSummarizer();
        } catch (error) {
          console.error("Auto-download failed:", error);
          downloadStartedRef.current = false;
        } finally {
          setIsLoading(false);
          setDownloadProgress(0);
          setIsDownloadingModel(false);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeSummarizer = async (): Promise<Summarizer> => {
    if (typeof Summarizer === "undefined") {
      throw new Error("Summarizer not available");
    }

    try {
      // Check if we already have a summarizer with the same parameters
      // If parameters changed, create a new one
      if (
        summarizerRef.current &&
        summarizerRef.current.type === type &&
        summarizerRef.current.format === format &&
        summarizerRef.current.length === length
      ) {
        return summarizerRef.current.summarizer;
      }

      // Create a new summarizer with current parameters
      // (parameters can't be changed after creation)
      const summarizer = await Summarizer.create({
        type,
        format,
        length,
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
      summarizerRef.current = {
        summarizer,
        type,
        format,
        length,
      };

      return summarizer;
    } catch (error) {
      toast.error("Failed to initialize summarizer");
      throw error;
    }
  };

  const handleSummarize = async () => {
    if (!state.optimizedData?.processedText) {
      toast.error("No text to summarize");
      return;
    }

    if (availability !== "available") {
      toast.error("Summarizer is not available");
      return;
    }

    setIsLoading(true);
    setSummary("");
    setDownloadProgress(0);
    setIsDownloadingModel(false);

    actions.setToolsChanges(true);

    try {
      const summarizer = await initializeSummarizer();
      const stream = await summarizer.summarizeStreaming(
        state.optimizedData.processedText,
      );

      const reader = stream.getReader();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += value;
        setSummary(result);
      }

      toast.success("Summary generated");
    } catch (error) {
      toast.error("Summarization failed");
      console.error("Summarization error:", error);
    } finally {
      setIsLoading(false);
      setDownloadProgress(0);
      setIsDownloadingModel(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    toast.success("Copied to clipboard");
  };

  const handleDownload = () => {
    const isMarkdown = format === "markdown";
    const mimeType = isMarkdown ? "text/markdown" : "text/plain";
    const fileName = isMarkdown ? "summary.md" : "summary.txt";

    const blob = new Blob([summary], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded");
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Settings Row */}
      <div className="shrink-0 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <Label className="pb-2">Type</Label>
          <Select
            value={type}
            onValueChange={(v) => setType(v as SummaryType)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="key-points">Key Points</SelectItem>
              <SelectItem value="tldr">TL;DR</SelectItem>
              <SelectItem value="teaser">Teaser</SelectItem>
              <SelectItem value="headline">Headline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="pb-2">Length</Label>
          <Select
            value={length}
            onValueChange={(v) => setLength(v as SummaryLength)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="long">Long</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="pb-2">Format</Label>
          <Select
            value={format}
            onValueChange={(v) => setFormat(v as SummaryFormat)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="markdown">Markdown</SelectItem>
              <SelectItem value="plain-text">Plain Text</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Button and Download Progress */}
      <div className="shrink-0 mb-4">
        {/* Download Progress Bar - Only replaces button during actual download */}
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
          <Button
            onClick={handleSummarize}
            disabled={
              isLoading ||
              availability !== "available" ||
              !state.optimizedData?.processedText
            }
            className="w-full"
            title={
              availability === "unavailable"
                ? "Summarizer API is not available in this browser"
                : availability === "downloadable"
                  ? "Summarizer model needs to be downloaded"
                  : !state.optimizedData?.processedText
                    ? "No text to summarize"
                    : undefined
            }
          >
            {isLoading ? "Summarizing..." : "Summarize"}
          </Button>
        )}
      </div>

      {/* Output Area (Scrollable) */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full p-4 border rounded-md">
          {summary ? (
            <MarkdownRenderer content={summary} />
          ) : isLoading ? (
            <LoadingAnimation />
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>Click &apos;Summarize&apos; to begin</p>
            </div>
          )}

          {/* Browser Support Warning */}
          {availability === "unavailable" && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                Summarizer is currently not supported in this browser.
                <br />
                Currently AI Summarizer is only supported in Chromium-based
                browsers.
                <br />
                Try to use the latest version of Chrome.
              </p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Export Buttons */}
      {summary && !isLoading && (
        <div className="shrink-0 flex gap-2 mt-4">
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      )}
    </div>
  );
}
