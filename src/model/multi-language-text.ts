export type Language = "en" | "fr" | "de"; // More to be added

export type MultiLanguageText = { [language in Language]?: string };

export const getText = (
    text: MultiLanguageText,
    expectedLanguage: Language
) => {
    const language = getBestLanguage(text, expectedLanguage);
    if (!language) return undefined;
    return text[language];
};

export const getBestLanguage = (
    text: MultiLanguageText,
    expectedLanguage: Language
): Language | undefined => {
    if (!text) return undefined;

    const languages = Object.keys(text) as Language[];

    // Best case: includes this language
    if (languages.includes(expectedLanguage)) return expectedLanguage;

    // Otherwise, try "default" language == English
    if (languages.includes("en")) return "en";

  // Last chance, return first language
  return languages[0];
};
