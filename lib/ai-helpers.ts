/// <reference types="@types/dom-chromium-ai" />

// Check if Chrome's Language Model API is available and supports text/image input
export async function checkLanguageModelAvailability() {
  if (typeof window === "undefined") {
    return { available: false, imageSupport: false };
  }
  if (typeof LanguageModel === "undefined") {
    return {
      available: false,
      imageSupport: false,
      availability: "unavailable" as Availability,
    };
  }

  try {
    const textAvailability = await LanguageModel.availability({
      expectedInputs: [{ type: "text", languages: ["en"] }],
    });

    let imageSupport;
    try {
      const imageAvailability = await LanguageModel.availability({
        expectedInputs: [
          { type: "text", languages: ["en"] },
          { type: "image" },
        ],
      });
      imageSupport = imageAvailability !== "unavailable";
    } catch (e) {
      console.error("Image support check error:", e);
      imageSupport = false;
    }

    const available = textAvailability !== "unavailable";

    return {
      available,
      availability: (available ? "available" : "unavailable") as Availability,
      imageSupport,
    };
  } catch (error) {
    console.error("Language Model availability check error:", error);
    return {
      available: false,
      imageSupport: false,
      availability: "unavailable" as Availability,
    };
  }
}

// Check if Chrome's Summarizer API is available
export async function checkSummarizerAvailability() {
  if (typeof window === "undefined") {
    return { available: false, availability: "unavailable" as Availability };
  }
  if (typeof Summarizer === "undefined") {
    return { available: false, availability: "unavailable" as Availability };
  }

  try {
    const available = await Summarizer.availability();

    const isAvailable = available !== "unavailable";
    return {
      available: isAvailable,
      availability: (isAvailable ? "available" : "unavailable") as Availability,
    };
  } catch (error) {
    console.error("Summarizer availability check error:", error);
    return { available: false, availability: "unavailable" as Availability };
  }
}

// Check if Chrome's Language Detector API is available
export async function checkLanguageDetectorAvailability() {
  if (typeof window === "undefined") {
    return { available: false };
  }

  if (typeof LanguageDetector === "undefined") {
    return { available: false };
  }

  try {
    const availability = await LanguageDetector.availability();
    return {
      available: availability !== "unavailable",
      availability,
    };
  } catch (error) {
    console.error("Language Detector availability check error:", error);
    return { available: false };
  }
}

// Detected language with confidence score
export interface DetectedLanguage {
  detectedLanguage: string | undefined;
  confidence: number;
}

// Detect language of given text using Language Detector API
export async function detectTextLanguage(
  text: string,
): Promise<DetectedLanguage[]> {
  if (
    typeof window === "undefined" ||
    typeof LanguageDetector === "undefined"
  ) {
    throw new Error("Language Detector API is not available");
  }

  try {
    const detector = await LanguageDetector.create();
    const results = await detector.detect(text);
    return results as DetectedLanguage[];
  } catch (error) {
    console.error("Language detection error:", error);
    throw error;
  }
}

// Translator API
export async function checkTranslatorAvailability() {
  if (typeof window === "undefined" || typeof self === "undefined") {
    return { available: false };
  }

  try {
    const available = "Translator" in self;
    return { available };
  } catch (error) {
    console.error("Translator availability check error:", error);
    return { available: false };
  }
}

export async function checkTranslationLanguagePairSupport(
  sourceLanguage: string,
  targetLanguage: string,
): Promise<{
  available: boolean;
  canDownload: boolean;
  downloading?: boolean;
}> {
  if (typeof window === "undefined" || !("Translator" in self)) {
    return { available: false, canDownload: false };
  }

  try {
    const availability = await Translator.availability({
      sourceLanguage,
      targetLanguage,
    });

    return {
      available: availability === "available",
      canDownload: availability === "downloadable",
      downloading: availability === "downloading",
    };
  } catch (error) {
    console.error("Language pair support check error:", error);
    return { available: false, canDownload: false };
  }
}

export interface TranslationOptions {
  sourceLanguage: string;
  targetLanguage: string;
  onProgress?: (progress: number) => void;
}

export async function createTranslator(options: TranslationOptions) {
  if (!("Translator" in self)) {
    throw new Error("Translator API is not supported in this browser");
  }

  try {
    return await Translator.create({
      sourceLanguage: options.sourceLanguage,
      targetLanguage: options.targetLanguage,
      monitor(m: DownloadProgressMonitor) {
        m.addEventListener("downloadprogress", (e: DownloadProgressEvent) => {
          if (options.onProgress) {
            const progress = (e.loaded / e.total) * 100;
            options.onProgress(progress);
          }
        });
      },
    });
  } catch (error) {
    console.error("Failed to create translator:", error);
    throw error;
  }
}

export async function translateText(
  translator: Translator,
  text: string,
): Promise<string> {
  if (!text || !translator) {
    throw new Error("Invalid parameters for translation");
  }

  try {
    return await translator.translate(text);
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}

export interface DownloadProgressEvent extends Event {
  loaded: number;
  total: number;
}

export interface DownloadProgressMonitor {
  addEventListener(
    type: "downloadprogress",
    listener: (event: DownloadProgressEvent) => void,
  ): void;
  removeEventListener(
    type: "downloadprogress",
    listener: (event: DownloadProgressEvent) => void,
  ): void;
}

export interface TranslatorInstance {
  translate(text: string): Promise<string>;
  translateStreaming(text: string): AsyncIterable<string>;
}
