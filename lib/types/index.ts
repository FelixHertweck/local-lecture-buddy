export interface TextInput {
  type: "text";
  content: string;
  timestamp: Date;
}

export interface ImageInput {
  type: "image";
  data: string; // Base64 or Blob URL
  source: "upload" | "camera";
  timestamp: Date;
}

export interface AudioInput {
  type: "audio";
  data: Blob;
  timestamp: Date;
}

export type InputData = TextInput | ImageInput | AudioInput;

// Optimized Data
export interface OptimizedData {
  originalInput: InputData;
  processedText: string;
  metadata?: {
    ocrConfidence?: number;
    processingTime?: number;
    editedManually?: boolean;
  };
}

// Workflow State
export type WorkflowStep = "input" | "optimizer" | "tools";

export const WorkflowStep_Array: WorkflowStep[] = [
  "input",
  "optimizer",
  "tools",
];

export interface WorkflowState {
  currentStep: WorkflowStep;
  inputData: InputData | null;
  optimizedData: OptimizedData | null;
  lockedSteps: Set<WorkflowStep>;
  isProcessing: boolean;
  selectedInputType: "image" | "text" | null;
  imageInputSource: "upload" | "camera" | null;
  hasToolsChanges: boolean;
  dontShowToolsWarningAgain: boolean;
}

// AI Chat Types
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export type ContextMode = "text" | "image" | "both";

// Summarizer Types
export type SummaryType = "key-points" | "tldr" | "teaser" | "headline";
export type SummaryFormat = "markdown" | "plain-text";
export type SummaryLength = "short" | "medium" | "long";
