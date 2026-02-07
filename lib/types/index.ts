// User input types for different media
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

// Union type for all input modes
export type InputData = TextInput | ImageInput | AudioInput;

// Processed data with metadata from optimization step
export interface OptimizedData {
  originalInput: InputData;
  processedText: string;
  metadata?: {
    ocrConfidence?: number;
    processingTime?: number;
    editedManually?: boolean;
  };
}

// Multi-step workflow progression
export type WorkflowStep = "input" | "optimizer" | "tools";

export const WorkflowStep_Array: WorkflowStep[] = [
  "input",
  "optimizer",
  "tools",
];

// Global workflow state management
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

// Chat message structure for AI conversations
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Context input types for AI chat
export type ContextMode = "text" | "image" | "both";

// Summary generation configuration types
export type SummaryType = "key-points" | "tldr" | "teaser" | "headline";
export type SummaryFormat = "markdown" | "plain-text";
export type SummaryLength = "short" | "medium" | "long";
