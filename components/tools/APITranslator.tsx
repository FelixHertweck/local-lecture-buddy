"use client";

import { useState, useEffect } from "react";
import { useWorkflow } from "@/lib/contexts/WorkflowContext";
import {
  detectTextLanguage,
  checkLanguageDetectorAvailability,
  DetectedLanguage,
  checkTranslatorAvailability,
  checkTranslationLanguagePairSupport,
  createTranslator,
  translateText,
} from "@/lib/ai-helpers";
import {
  getBrowserLanguage,
  getGeolocationWithLanguage,
  getCountryLanguageByName,
  getLanguageName,
  BrowserLanguageInfo,
  GeoLocationLanguageInfo,
  CountryLanguageInfo,
} from "@/lib/language-detector-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Text translator with language detection and multi-language support
export function APITranslator() {
  const { state, actions } = useWorkflow();
  const [detectionResults, setDetectionResults] = useState<DetectedLanguage[]>(
    [],
  );
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectorAvailable, setDetectorAvailable] = useState(false);
  const [browserLanguage, setBrowserLanguage] = useState<BrowserLanguageInfo>({
    code: "unknown",
    name: "Unknown",
  });
  const [geolocationData, setGeolocationData] =
    useState<GeoLocationLanguageInfo>({
      latitude: 0,
      longitude: 0,
      accuracy: 0,
    });
  const [selectedSourceLanguage, setSelectedSourceLanguage] =
    useState<string>("");
  const [selectedTargetLanguage, setSelectedTargetLanguage] =
    useState<string>("");
  const [countryInput, setCountryInput] = useState<string>("");
  const [countryLanguageData, setCountryLanguageData] =
    useState<CountryLanguageInfo | null>(null);
  const [countryError, setCountryError] = useState<string>("");

  // Translator API states
  const [translatorAvailable, setTranslatorAvailable] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [isDownloadingModel, setIsDownloadingModel] = useState(false);
  const [translatedText, setTranslatedText] = useState<string>("");
  const [translationError, setTranslationError] = useState<string>("");
  const [languagePairSupport, setLanguagePairSupport] = useState({
    available: false,
    canDownload: false,
  });

  // Check Language Detector availability on mount
  useEffect(() => {
    const checkAvailability = async () => {
      const availability = await checkLanguageDetectorAvailability();
      setDetectorAvailable(availability.available);
    };
    void checkAvailability();

    // Get browser language
    const browserLang = getBrowserLanguage();
    setBrowserLanguage(browserLang);

    // Get geolocation automatically
    const getGeo = async () => {
      try {
        const geoData = await getGeolocationWithLanguage();
        setGeolocationData(geoData);

        if (geoData.error) {
          toast.error(`Location error: ${geoData.error}`);
        }
      } catch (error) {
        toast.error("Failed to retrieve location");
        console.error(error);
      }
    };
    void getGeo();

    // Check Translator API availability
    const checkTranslator = async () => {
      const translatorCheck = await checkTranslatorAvailability();
      setTranslatorAvailable(translatorCheck.available);

      if (!translatorCheck.available) {
        toast.error("Translator API is not supported in this browser");
      }
    };
    void checkTranslator();
  }, []);

  // Auto-detect language when text becomes available
  useEffect(() => {
    const autoDetect = async () => {
      if (
        state.optimizedData?.processedText &&
        detectorAvailable &&
        detectionResults.length === 0 &&
        !isDetecting
      ) {
        setIsDetecting(true);
        try {
          const results = await detectTextLanguage(
            state.optimizedData.processedText,
          );
          setDetectionResults(results);
          // Auto-select the first detected language as source
          if (results.length > 0) {
            setSelectedSourceLanguage(results[0].detectedLanguage || "");
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsDetecting(false);
        }
      }
    };

    void autoDetect();
  }, [
    state.optimizedData?.processedText,
    detectorAvailable,
    detectionResults.length,
    isDetecting,
  ]);

  const handleCountrySearch = () => {
    if (!countryInput.trim()) {
      setCountryError("Please enter a country name");
      return;
    }

    const result = getCountryLanguageByName(countryInput);

    if (!result) {
      setCountryError(`Country "${countryInput}" not found`);
      setCountryLanguageData(null);
      return;
    }

    setCountryLanguageData(result);
    setCountryError("");
    toast.success(`Country found: ${result.countryName}`);
  };

  // Check language pair support when both languages are selected
  useEffect(() => {
    const checkSupport = async () => {
      if (selectedSourceLanguage && selectedTargetLanguage) {
        try {
          const support = await checkTranslationLanguagePairSupport(
            selectedSourceLanguage,
            selectedTargetLanguage,
          );
          setLanguagePairSupport(support);
        } catch (error) {
          console.error("Error checking language pair support:", error);
        }
      }
    };

    void checkSupport();
  }, [selectedSourceLanguage, selectedTargetLanguage]);

  const handleTranslate = async () => {
    if (!selectedSourceLanguage || !selectedTargetLanguage) {
      toast.error("Please select both source and target languages");
      return;
    }

    if (!state.optimizedData?.processedText) {
      toast.error("No text to translate");
      return;
    }

    if (!translatorAvailable) {
      toast.error("Translator API is not supported in this browser");
      return;
    }

    setIsTranslating(true);
    setTranslationError("");
    setTranslatedText("");
    setTranslationProgress(0);
    setIsDownloadingModel(false);

    try {
      // Check if language pair is supported
      if (!languagePairSupport.available && !languagePairSupport.canDownload) {
        const unsupportedPairMessage = `The language pair (${selectedSourceLanguage} → ${selectedTargetLanguage}) is not supported`;
        setTranslationError(unsupportedPairMessage);
        toast.error(unsupportedPairMessage);
        setIsTranslating(false);
        return;
      }

      // Create translator with progress tracking
      const translator = await createTranslator({
        sourceLanguage: selectedSourceLanguage,
        targetLanguage: selectedTargetLanguage,
        onProgress: (progress) => {
          setIsDownloadingModel(true);
          setTranslationProgress(Math.min(progress, 99));
        },
      });

      setTranslationProgress(100);

      // Perform translation
      const result = await translateText(
        translator,
        state.optimizedData.processedText,
      );
      setTranslatedText(result);
      toast.success("Text translated successfully");
      // Mark tools as having changes
      actions.setToolsChanges(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Translation failed";
      setTranslationError(errorMessage);
      toast.error(`Translation error: ${errorMessage}`);
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
      setTranslationProgress(0);
      setIsDownloadingModel(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-transparent">
      <div className="h-full flex flex-col p-6">
        {/* Language Selection and Controls - Fixed Top */}
        <div className="shrink-0 space-y-6 mb-6">
          <div className="flex items-end gap-4">
            {/* Left Side - Source Language */}
            <div className="flex-1 flex flex-col items-start">
              <label className="text-sm font-medium dark:text-gray-300 text-gray-700 mb-2 block">
                From
              </label>
              {isDetecting ? (
                <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg w-full">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-2" />
                  <p className="text-sm text-blue-700">Detecting...</p>
                </div>
              ) : (
                <Select
                  value={selectedSourceLanguage}
                  onValueChange={setSelectedSourceLanguage}
                >
                  <SelectTrigger className="text-base w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {detectionResults.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No languages detected
                      </SelectItem>
                    ) : (
                      detectionResults
                        .filter((result) => result.confidence >= 0.01)
                        .slice(0, 10)
                        .map((result) => (
                          <SelectItem
                            key={result.detectedLanguage}
                            value={result.detectedLanguage || ""}
                          >
                            {getLanguageName(result.detectedLanguage || "")} (
                            {(result.confidence * 100).toFixed(0)}%)
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Arrow */}
            <div className="text-2xl text-gray-400 pb-1">→</div>

            {/* Right Side - Target Language with Custom Input */}
            <div className="flex-1 flex flex-col items-end">
              <label className="text-sm font-medium dark:text-gray-300 text-gray-700 mb-2 block w-full">
                To
              </label>
              <Select
                value={selectedTargetLanguage}
                onValueChange={setSelectedTargetLanguage}
              >
                <SelectTrigger className="text-base w-full">
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent>
                  {/* Browser Language Option */}
                  <SelectItem value={browserLanguage.code}>
                    <span>
                      {browserLanguage.name} (
                      {geolocationData.languageCode === browserLanguage.code
                        ? "from browser & location"
                        : "from browser"}
                      )
                    </span>
                  </SelectItem>

                  {/* Location Language Option - only show if different from browser */}
                  {geolocationData.languageCode &&
                    geolocationData.languageCode !== browserLanguage.code && (
                      <SelectItem value={geolocationData.languageCode || ""}>
                        <span>
                          {geolocationData.languageName} (from location)
                        </span>
                      </SelectItem>
                    )}

                  {/* Country Search Result Option */}
                  {countryLanguageData && (
                    <SelectItem value={countryLanguageData.languageCode}>
                      <span>
                        {countryLanguageData.languageName} (from{" "}
                        {countryLanguageData.countryName})
                      </span>
                    </SelectItem>
                  )}

                  {/* Custom Input Option */}
                  <div className="border-t my-2" />
                  <div className="p-2">
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Country name..."
                        value={countryInput}
                        onChange={(e) => {
                          setCountryInput(e.target.value);
                          setCountryError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleCountrySearch();
                          }
                        }}
                        className="text-sm"
                      />
                      <Button
                        onClick={handleCountrySearch}
                        size="sm"
                        variant="outline"
                      >
                        Search
                      </Button>
                    </div>
                    {countryError && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                        {countryError}
                      </div>
                    )}
                  </div>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Translate Button */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleTranslate}
              disabled={
                !translatorAvailable ||
                isTranslating ||
                !state.optimizedData?.processedText ||
                !selectedSourceLanguage ||
                !selectedTargetLanguage
              }
              className="w-full"
              size="lg"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Translating...
                </>
              ) : (
                "Translate"
              )}
            </Button>

            {/* Translation Progress Bar */}
            {isTranslating && translationProgress > 0 && (
              <div className="w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg mt-4">
                <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 mb-2">
                  <div
                    className="bg-gray-600 dark:bg-gray-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${translationProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 text-center font-medium">
                  {isDownloadingModel && translationProgress < 100
                    ? `Downloading Model: ${Math.round(translationProgress)}%`
                    : "Translating..."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Output Area - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
          {/* Translation Error */}
          {translationError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">
                Translation Error
              </p>
              <p className="text-red-700 text-sm mt-1">{translationError}</p>
            </div>
          )}

          {/* Translated Text Result */}
          {translatedText && (
            <div className="p-4 bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Translated Text:
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {translatedText}
              </p>
              <Button
                onClick={async () => {
                  await navigator.clipboard.writeText(translatedText);
                  toast.success("Copied to clipboard");
                }}
                size="sm"
                variant="outline"
              >
                Copy to Clipboard
              </Button>
            </div>
          )}

          {/* Browser Support Warning */}
          {!translatorAvailable && (
            <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                Translator is currently not supported in this browser.
                <br />
                Currently AI Translator is only supported in Chromium-based
                browsers.
                <br />
                Try to use the latest version of Chrome.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
