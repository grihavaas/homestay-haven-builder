"use client";

import { useState, useRef, useEffect } from "react";

// Indian languages list
const INDIAN_LANGUAGES = [
  "Hindi",
  "English",
  "Bengali",
  "Telugu",
  "Marathi",
  "Tamil",
  "Gujarati",
  "Urdu",
  "Kannada",
  "Odia",
  "Malayalam",
  "Punjabi",
  "Assamese",
  "Sanskrit",
  "Konkani",
  "Manipuri",
  "Nepali",
  "Bodo",
  "Santhali",
  "Maithili",
  "Dogri",
  "Kashmiri",
  "Sindhi",
].sort();

interface LanguageTagInputProps {
  value: string[];
  onChange: (languages: string[]) => void;
  name?: string;
  disabled?: boolean;
}

export function LanguageTagInput({
  value,
  onChange,
  name,
  disabled = false,
}: LanguageTagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredLanguages = INDIAN_LANGUAGES.filter(
    (lang) =>
      lang.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(lang)
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleAddLanguage(language: string) {
    if (!value.includes(language)) {
      onChange([...value, language]);
      setInputValue("");
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  }

  function handleRemoveLanguage(language: string) {
    onChange(value.filter((lang) => lang !== language));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const matchingLang = INDIAN_LANGUAGES.find(
        (lang) =>
          lang.toLowerCase() === inputValue.trim().toLowerCase() &&
          !value.includes(lang)
      );
      if (matchingLang) {
        handleAddLanguage(matchingLang);
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      handleRemoveLanguage(value[value.length - 1]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={JSON.stringify(value)} />
      <div className="flex flex-wrap gap-2 min-h-[42px] p-2 border rounded-md bg-white">
        {value.map((language) => (
          <span
            key={language}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
          >
            {language}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemoveLanguage(language)}
                className="hover:bg-blue-200 rounded-full px-1 text-blue-800 font-bold"
                tabIndex={-1}
                aria-label={`Remove ${language}`}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {!disabled && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? "Type to add languages..." : ""}
            className="flex-1 min-w-[120px] outline-none text-sm"
          />
        )}
      </div>
      {showSuggestions && filteredLanguages.length > 0 && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredLanguages.map((language) => (
            <button
              key={language}
              type="button"
              onClick={() => handleAddLanguage(language)}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
            >
              {language}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
