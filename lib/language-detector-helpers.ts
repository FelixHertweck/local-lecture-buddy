// Helper functions for language detection, geolocation, and country language mapping
import { feature } from "@rapideditor/country-coder";
import clm from "country-locale-map";

// Browser language information
export interface BrowserLanguageInfo {
  code: string;
  name: string;
}

export interface CountryLanguageInfo {
  countryCode: string;
  countryName: string;
  languageCode: string;
  languageName: string;
}

// Get the user's browser language and language code
export function getBrowserLanguage(): BrowserLanguageInfo {
  if (typeof window === "undefined") {
    return { code: "unknown", name: "Unknown" };
  }

  const browserLang = navigator.language || "en-US";
  const langCode = browserLang.split("-")[0];

  const languageNames = new Intl.DisplayNames(["en"], { type: "language" });
  const languageName = languageNames.of(langCode) || "Unknown";

  return {
    code: langCode,
    name: languageName,
  };
}

// Get country and language information by country name
export function getCountryLanguageByName(
  countryName: string,
): CountryLanguageInfo | null {
  try {
    // Try exact match first
    let countryData = clm.getCountryByName(countryName, false);

    // If not found, try fuzzy matching
    if (!countryData) {
      countryData = clm.getCountryByName(countryName, true);
    }

    if (!countryData) {
      return null;
    }

    const languageCode = countryData.languages?.[0] || "en";
    const languageNames = new Intl.DisplayNames(["en"], {
      type: "language",
    });
    const languageName = languageNames.of(languageCode) || "Unknown";

    return {
      countryCode: countryData.alpha2,
      countryName: countryData.name,
      languageCode,
      languageName,
    };
  } catch (error) {
    console.error(
      `Error getting country language for "${countryName}":`,
      error,
    );
    return null;
  }
}

// Get display name for a language code
export function getLanguageName(languageCode: string): string {
  try {
    const languageNames = new Intl.DisplayNames(["en"], {
      type: "language",
    });
    return languageNames.of(languageCode) || languageCode.toUpperCase();
  } catch (error) {
    console.error("Error getting language name:", error);
    return languageCode.toUpperCase();
  }
}

// Geolocation data with language and country information
export interface GeoLocationLanguageInfo {
  latitude: number;
  longitude: number;
  accuracy: number;
  country?: string;
  countryCode?: string;
  languageCode?: string;
  languageName?: string;
  error?: string;
}

// Get user's geolocation and infer language from country
export async function getGeolocationWithLanguage(): Promise<GeoLocationLanguageInfo> {
  if (typeof window === "undefined") {
    return {
      latitude: 0,
      longitude: 0,
      accuracy: 0,
      error: "Geolocation not available in server environment",
    };
  }

  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        latitude: 0,
        longitude: 0,
        accuracy: 0,
        error: "Geolocation API not supported",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        try {
          // Get country code from coordinates
          const geoFeature = feature([longitude, latitude]);

          if (!geoFeature?.properties) {
            resolve({
              latitude,
              longitude,
              accuracy,
              error: "Could not determine country from coordinates",
            });
            return;
          }

          // country-coder uses 'iso1A2' for the country code
          const countryCode = geoFeature.properties.iso1A2;

          if (!countryCode) {
            resolve({
              latitude,
              longitude,
              accuracy,
              error: "Could not determine country code from coordinates",
            });
            return;
          }

          // Get country data from country-locale-map
          const countryData = clm.getCountryByAlpha2(countryCode);

          if (!countryData) {
            resolve({
              latitude,
              longitude,
              accuracy,
              countryCode,
              error: "Could not find country data",
            });
            return;
          }

          const languageCode = countryData.languages?.[0] || "en";
          const languageNames = new Intl.DisplayNames(["en"], {
            type: "language",
          });
          const languageName = languageNames.of(languageCode) || "Unknown";
          const countryName = countryData.name || "Unknown";

          resolve({
            latitude,
            longitude,
            accuracy,
            country: countryName,
            countryCode,
            languageCode,
            languageName,
          });
        } catch (error) {
          console.error("Error processing geolocation:", error);
          resolve({
            latitude,
            longitude,
            accuracy,
            error: `Error processing location data: ${error instanceof Error ? error.message : "Unknown error"}`,
          });
        }
      },
      (error) => {
        resolve({
          latitude: 0,
          longitude: 0,
          accuracy: 0,
          error: `Geolocation error: ${error.message}`,
        });
      },
    );
  });
}
