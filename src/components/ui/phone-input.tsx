"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

const COUNTRY_CODES = [
  { code: "+91", country: "India" },
  { code: "+1", country: "USA/Canada" },
  { code: "+44", country: "UK" },
  { code: "+971", country: "UAE" },
  { code: "+65", country: "Singapore" },
  { code: "+61", country: "Australia" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
];

interface PhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

// Parse a full phone number into country code and local number
function parsePhoneNumber(fullNumber: string): { countryCode: string; localNumber: string } {
  if (!fullNumber) {
    return { countryCode: "+91", localNumber: "" };
  }

  // Check if it starts with a known country code
  for (const { code } of COUNTRY_CODES) {
    if (fullNumber.startsWith(code)) {
      return {
        countryCode: code,
        localNumber: fullNumber.slice(code.length).replace(/\D/g, ""),
      };
    }
  }

  // If starts with + but not a known code, try to extract it
  if (fullNumber.startsWith("+")) {
    // Try common patterns: +1, +44, +91, +971, etc.
    const match = fullNumber.match(/^(\+\d{1,4})/);
    if (match) {
      const foundCode = COUNTRY_CODES.find((c) => c.code === match[1]);
      if (foundCode) {
        return {
          countryCode: foundCode.code,
          localNumber: fullNumber.slice(foundCode.code.length).replace(/\D/g, ""),
        };
      }
    }
    // Unknown country code, default to India and treat rest as number
    return { countryCode: "+91", localNumber: fullNumber.replace(/\D/g, "") };
  }

  // No country code, assume it's just the local number
  return { countryCode: "+91", localNumber: fullNumber.replace(/\D/g, "") };
}

export function PhoneInput({
  value,
  onChange,
  placeholder = "98765 43210",
  required,
  className,
  id,
  name,
}: PhoneInputProps) {
  const parsed = parsePhoneNumber(value);
  const [countryCode, setCountryCode] = useState(parsed.countryCode);
  const [localNumber, setLocalNumber] = useState(parsed.localNumber);

  // Sync internal state when value prop changes
  useEffect(() => {
    const parsed = parsePhoneNumber(value);
    setCountryCode(parsed.countryCode);
    setLocalNumber(parsed.localNumber);
  }, [value]);

  const handleCountryCodeChange = (newCode: string) => {
    setCountryCode(newCode);
    if (localNumber) {
      onChange(newCode + localNumber);
    }
  };

  const handleLocalNumberChange = (newLocalNumber: string) => {
    // Only allow digits
    const digits = newLocalNumber.replace(/\D/g, "");
    setLocalNumber(digits);
    if (digits) {
      onChange(countryCode + digits);
    } else {
      onChange("");
    }
  };

  return (
    <div className={`flex gap-2 ${className || ""}`}>
      <select
        value={countryCode}
        onChange={(e) => handleCountryCodeChange(e.target.value)}
        className="rounded-md border px-2 py-2 bg-white text-sm shrink-0"
        aria-label="Country code"
      >
        {COUNTRY_CODES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} {c.country}
          </option>
        ))}
      </select>
      <Input
        id={id}
        name={name}
        type="tel"
        value={localNumber}
        onChange={(e) => handleLocalNumberChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="flex-1"
      />
    </div>
  );
}

export { COUNTRY_CODES, parsePhoneNumber };
