"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
} from "react";
import type {
  WorkflowState,
  WorkflowStep,
  InputData,
  OptimizedData,
} from "@/lib/types";

const TOOLS_WARNING_STORAGE_KEY = "dontShowToolsWarning";

interface WorkflowContextType {
  state: WorkflowState;
  actions: {
    setInput: (data: InputData) => void;
    setOptimizedData: (data: OptimizedData) => void;
    navigateToStep: (step: WorkflowStep) => void;
    lockStep: (step: WorkflowStep) => void;
    unlockStep: (step: WorkflowStep) => void;
    setProcessing: (isProcessing: boolean) => void;
    setSelectedInputType: (type: "image" | "text" | null) => void;
    setImageInputSource: (source: "upload" | "camera" | null) => void;
    setToolsChanges: (hasChanges: boolean) => void;
    setDontShowToolsWarning: (dontShow: boolean) => void;
    clearInput: () => void;
    reset: () => void;
  };
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(
  undefined,
);

type WorkflowAction =
  | { type: "SET_INPUT"; payload: InputData }
  | { type: "SET_OPTIMIZED_DATA"; payload: OptimizedData }
  | { type: "NAVIGATE_TO_STEP"; payload: WorkflowStep }
  | { type: "LOCK_STEP"; payload: WorkflowStep }
  | { type: "UNLOCK_STEP"; payload: WorkflowStep }
  | { type: "SET_PROCESSING"; payload: boolean }
  | { type: "SET_SELECTED_INPUT_TYPE"; payload: "image" | "text" | null }
  | { type: "SET_IMAGE_INPUT_SOURCE"; payload: "upload" | "camera" | null }
  | { type: "SET_TOOLS_CHANGES"; payload: boolean }
  | { type: "SET_DONT_SHOW_TOOLS_WARNING"; payload: boolean }
  | { type: "CLEAR_INPUT" }
  | { type: "RESET" };

const initialState: WorkflowState = {
  currentStep: "input",
  inputData: null,
  optimizedData: null,
  lockedSteps: new Set(),
  isProcessing: false,
  selectedInputType: null,
  imageInputSource: null,
  hasToolsChanges: false,
  dontShowToolsWarningAgain: false,
};

function workflowReducer(
  state: WorkflowState,
  action: WorkflowAction,
): WorkflowState {
  switch (action.type) {
    case "SET_INPUT":
      return {
        ...state,
        inputData: action.payload,
      };

    case "SET_OPTIMIZED_DATA":
      return {
        ...state,
        optimizedData: action.payload,
      };

    case "NAVIGATE_TO_STEP":
      return {
        ...state,
        currentStep: action.payload,
      };

    case "LOCK_STEP":
      const newLockedSteps = new Set(state.lockedSteps);
      newLockedSteps.add(action.payload);
      return {
        ...state,
        lockedSteps: newLockedSteps,
      };

    case "UNLOCK_STEP":
      const updatedLockedSteps = new Set(state.lockedSteps);
      updatedLockedSteps.delete(action.payload);
      return {
        ...state,
        lockedSteps: updatedLockedSteps,
      };

    case "SET_PROCESSING":
      return {
        ...state,
        isProcessing: action.payload,
      };

    case "SET_SELECTED_INPUT_TYPE":
      return {
        ...state,
        selectedInputType: action.payload,
      };

    case "SET_IMAGE_INPUT_SOURCE":
      return {
        ...state,
        imageInputSource: action.payload,
      };

    case "SET_TOOLS_CHANGES":
      return {
        ...state,
        hasToolsChanges: action.payload,
      };

    case "SET_DONT_SHOW_TOOLS_WARNING":
      return {
        ...state,
        dontShowToolsWarningAgain: action.payload,
      };

    case "CLEAR_INPUT":
      return {
        ...state,
        inputData: null,
        imageInputSource: null,
      };

    case "RESET":
      return {
        ...initialState,
        dontShowToolsWarningAgain: state.dontShowToolsWarningAgain,
      };

    default:
      return state;
  }
}

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  // Load dontShowToolsWarning from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPreference = localStorage.getItem(TOOLS_WARNING_STORAGE_KEY);
      if (savedPreference === "true") {
        dispatch({ type: "SET_DONT_SHOW_TOOLS_WARNING", payload: true });
      }
    }
  }, []);

  const actions = useMemo(
    () => ({
      setInput: (data: InputData) => {
        dispatch({ type: "SET_INPUT", payload: data });
      },

      setOptimizedData: (data: OptimizedData) => {
        dispatch({ type: "SET_OPTIMIZED_DATA", payload: data });
      },

      navigateToStep: (step: WorkflowStep) => {
        dispatch({ type: "NAVIGATE_TO_STEP", payload: step });
      },

      lockStep: (step: WorkflowStep) => {
        dispatch({ type: "LOCK_STEP", payload: step });
      },

      unlockStep: (step: WorkflowStep) => {
        dispatch({ type: "UNLOCK_STEP", payload: step });
      },

      setProcessing: (isProcessing: boolean) => {
        dispatch({ type: "SET_PROCESSING", payload: isProcessing });
      },

      setSelectedInputType: (type: "image" | "text" | null) => {
        dispatch({ type: "SET_SELECTED_INPUT_TYPE", payload: type });
      },

      setImageInputSource: (source: "upload" | "camera" | null) => {
        dispatch({ type: "SET_IMAGE_INPUT_SOURCE", payload: source });
      },

      setToolsChanges: (hasChanges: boolean) => {
        dispatch({ type: "SET_TOOLS_CHANGES", payload: hasChanges });
      },

      setDontShowToolsWarning: (dontShow: boolean) => {
        dispatch({ type: "SET_DONT_SHOW_TOOLS_WARNING", payload: dontShow });
        // Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(TOOLS_WARNING_STORAGE_KEY, String(dontShow));
        }
      },

      clearInput: () => {
        dispatch({ type: "CLEAR_INPUT" });
      },

      reset: () => {
        dispatch({ type: "RESET" });
      },
    }),
    [],
  );

  return (
    <WorkflowContext.Provider value={{ state, actions }}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error("useWorkflow must be used within WorkflowProvider");
  }
  return context;
}
