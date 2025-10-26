"use client";

import { Prayer } from "@/types/prayer";
import React, { useEffect, useState } from "react";
import BibleVerse from "./BibleVerse";
import Icon from "../icon/Icon";
import LoadingOverlay from "../loading/LoadingOverlay";
import useFetchBibleVerses from "@/hooks/useFetchBibleVerses";
import useFetchBiblePrayer from "@/hooks/useFetchBiblePrayer";

interface AIBookVerseProps {
  prayerDetails: Prayer | null;
  generateType: "verses" | "prayer";
}

export default function AIBibleVerse({
  prayerDetails,
  generateType,
}: AIBookVerseProps) {
  const [generatedVerses, setGeneratedVerses] = useState<
    Array<{ verse: string; chapter: string }>
  >([]);
  const [isGeneratingVerses, setIsGeneratingVerses] = useState(false);
  const [verseError, setVerseError] = useState("");
  const [excludedVerseRefs, setExcludedVerseRefs] = useState<string[]>([]);
  const [prayerExampleRef, setPrayerExampleRef] = useState<string>("");

  const generateVerses = useFetchBibleVerses({
    prayerDetails,
    excludedVerseRefs,
    setExcludedVerseRefs,
    setGeneratedVerses,
    setIsGeneratingVerses,
    setVerseError,
  });

  const generatePrayer = useFetchBiblePrayer({
    prayerDetails,
    prayerExampleRef,
    setPrayerExampleRef,
    setIsGeneratingVerses,
    setVerseError,
  });

  useEffect(() => {
    setGeneratedVerses([]);
    setVerseError("");
    setExcludedVerseRefs([]);
  }, [prayerDetails]);

  const handleSubmit = (generate: boolean) => {
    switch (generateType) {
      case "prayer":
        generatePrayer(generate);
        break;
      case "verses":
        generateVerses(generate);
        break;
      default:
        break;
    }
  };

  // For the response and the styling put in different components
  return (
    <>
      <LoadingOverlay
        isLoading={isGeneratingVerses}
        message="Generating verses..."
      />
      <div>
        {((generateType === "verses" && generatedVerses.length === 0) ||
          (generateType === "prayer" && !prayerExampleRef)) &&
        !verseError ? (
          <div className="bg-backgrounds-white border border-border-gray rounded-lg p-6 text-center">
            <p className="text-text-grayPrimary mb-4">
              {generateType === "verses"
                ? "Generate Bible verses related to this prayer request."
                : "Generate personalized prayer."}
            </p>
            <button
              className="btn bg-text-purplePrimary hover:bg-purple-600 text-white border-none"
              onClick={() => handleSubmit(false)}
            >
              <Icon icon="bible" className="w-4 h-4" />
              Generate Bible Verses
            </button>
          </div>
        ) : verseError ? (
          <div className="bg-backgrounds-white border border-red-300 rounded-lg p-6">
            <div className="alert alert-error mb-4">
              <span>{verseError}</span>
            </div>
            <button
              className="btn btn-outline border-border-gray text-text-grayPrimary hover:bg-backgrounds-grayLight w-full"
              onClick={() => handleSubmit(false)}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {generateType === "prayer" ? (
              <>
                <BibleVerse key={"prayer-example"} verse={prayerExampleRef} />
              </>
            ) : (
              <>
                {generatedVerses.map((verse, index) => (
                  <BibleVerse
                    key={index}
                    verse={verse.verse}
                    chapter={verse.chapter}
                  />
                ))}
              </>
            )}
            <button
              className="btn btn-outline border-border-gray text-text-grayPrimary hover:bg-backgrounds-grayLight"
              onClick={() => handleSubmit(true)}
            >
              Refresh Verses
            </button>
          </div>
        )}
      </div>
    </>
  );
}
