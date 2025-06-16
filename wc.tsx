"use client";

import { tldListDetails } from "@/assets/tld-list-details";
import { useEffect, useState } from "react";

type TLDDetails = {
  type: string;
  punycode: string | null;
  language_code: string | null;
  translation: string | null;
  romanized: string | null;
  rtl: boolean;
  sponsor: string | null;
};

type TLDListDetails = {
  [key: string]: TLDDetails;
};

type DomainFilter = "all" | "latin" | "non-latin";

export default function Page() {
  const [selectedTab, setSelectedTab] = useState<string>("com");
  const [domainLength, setDomainLength] = useState(3);
  const [wordLength, setWordLength] = useState(1);
  const [formatType, setFormatType] = useState<"comma" | "newline">("comma");
  const [filteredDomains, setFilteredDomains] = useState<string[]>([]);
  const [generatedCombinations, setGeneratedCombinations] = useState<string[]>(
    []
  );
  const [domainFilter, setDomainFilter] = useState<DomainFilter>("all");

  // Get all TLDs from the list
  const allTLDs = Object.keys(tldListDetails);

  // Function to check if a domain is Latin (English alphabet only)
  const isLatinDomain = (domain: string) => /^[a-z]+$/.test(domain);

  // Get available lengths from the TLD list based on current filter
  const getFilteredTLDs = () => {
    switch (domainFilter) {
      case "latin":
        return allTLDs.filter(isLatinDomain);
      case "non-latin":
        return allTLDs.filter((domain) => !isLatinDomain(domain));
      default:
        return allTLDs;
    }
  };

  const filteredTLDs = getFilteredTLDs();
  const availableLengths = Array.from(
    new Set(filteredTLDs.map((domain) => domain.length))
  ).sort((a, b) => a - b);
  const minLength = Math.min(...availableLengths);
  const maxLength = Math.max(...availableLengths);

  // Update filtered domains when domain length or filter changes
  useEffect(() => {
    const filtered = filteredTLDs.filter(
      (domain) => domain.length === domainLength
    );
    setFilteredDomains(filtered);
    // Set the first filtered domain as selected tab if available
    if (filtered.length > 0) {
      setSelectedTab(filtered[0]);
    }
  }, [domainLength, domainFilter]);

  // Update combinations when filtered domains or word length changes
  useEffect(() => {
    if (filteredDomains.length > 0) {
      const combinations: string[] = [];
      const selectedDomain = selectedTab;
      const letters = "abcdefghijklmnopqrstuvwxyz";

      if (wordLength === 1) {
        // Generate simple letter.domain combinations
        for (let i = 0; i < letters.length; i++) {
          combinations.push(`${letters[i]}.${selectedDomain}`);
        }
      } else if (wordLength === 2) {
        for (let i = 0; i < letters.length; i++) {
          for (let j = 0; j < letters.length; j++) {
            combinations.push(`${letters[i]}${letters[j]}.${selectedDomain}`);
          }
        }
      } else if (wordLength === 3) {
        for (let i = 0; i < letters.length; i++) {
          for (let j = 0; j < letters.length; j++) {
            for (let k = 0; k < letters.length; k++) {
              combinations.push(
                `${letters[i]}${letters[j]}${letters[k]}.${selectedDomain}`
              );
            }
          }
        }
      }
      setGeneratedCombinations(combinations);
    }
  }, [filteredDomains, wordLength, selectedTab]);

  const copyToClipboard = () => {
    const text = generatedCombinations.join(
      formatType === "comma" ? ", " : "\n"
    );
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-8">
      {/* Domain Filter Options */}
      <div className="mb-8">
        <label className="block text-lg font-medium mb-2">Domain Type:</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="all"
              checked={domainFilter === "all"}
              onChange={() => setDomainFilter("all")}
              className="mr-2"
            />
            All Domains
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="latin"
              checked={domainFilter === "latin"}
              onChange={() => setDomainFilter("latin")}
              className="mr-2"
            />
            Latin Only
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="non-latin"
              checked={domainFilter === "non-latin"}
              onChange={() => setDomainFilter("non-latin")}
              className="mr-2"
            />
            Non-Latin Only
          </label>
        </div>
      </div>

      {/* Domain Length Slider */}
      <div className="mb-8">
        <label
          htmlFor="domain-length"
          className="block text-lg font-medium mb-2"
        >
          Domain Length: {domainLength} characters
        </label>
        <input
          id="domain-length"
          type="range"
          min={minLength}
          max={maxLength}
          step={1}
          value={domainLength}
          onChange={(e) => setDomainLength(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>{minLength} chars</span>
          <span>{maxLength} chars</span>
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Available lengths: {availableLengths.join(", ")}
        </div>
      </div>

      {/* TLD Tabs - Only shown when domains are filtered */}
      {filteredDomains.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {filteredDomains.map((tld) => (
              <button
                key={tld}
                onClick={() => setSelectedTab(tld)}
                className={`px-4 py-2 rounded-lg ${
                  selectedTab === tld
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                .{tld}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Word Length Slider */}
      <div className="mb-8">
        <label htmlFor="word-length" className="block text-lg font-medium mb-2">
          Word Length: {wordLength} character{wordLength > 1 ? "s" : ""}
        </label>
        <input
          id="word-length"
          type="range"
          min={1}
          max={3}
          step={1}
          value={wordLength}
          onChange={(e) => setWordLength(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Format Options */}
      <div className="mb-8">
        <label className="block text-lg font-medium mb-2">Format:</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="comma"
              checked={formatType === "comma"}
              onChange={() => setFormatType("comma")}
              className="mr-2"
            />
            Comma separated
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="newline"
              checked={formatType === "newline"}
              onChange={() => setFormatType("newline")}
              className="mr-2"
            />
            New line
          </label>
        </div>
      </div>

      {/* Generated Combinations */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Generated Combinations:</h2>
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Copy to Clipboard
          </button>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="whitespace-pre-wrap">
            {generatedCombinations.join(formatType === "comma" ? ", " : "\n")}
          </pre>
        </div>
      </div>
    </div>
  );
}
