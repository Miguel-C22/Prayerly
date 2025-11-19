"use client";

import { Prayer } from "@/types/prayer";
import React, { useEffect, useState } from "react";
import BibleVerse from "./BibleVerse";
import Icon from "@/components/ui/icon/Icon";
import LoadingOverlay from "@/components/ui/loading/LoadingOverlay";
import useFetchBibleVerses from "@/hooks/useFetchBibleVerses";
import useFetchBiblePrayer from "@/hooks/useFetchBiblePrayer";
import Button from "@/components/ui/button/Button";

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
    setPrayerExampleRef("");
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
            <Button
              variant="primary"
              onClick={() => handleSubmit(false)}
              icon={<Icon icon="bible" className="w-4 h-4" />}
            >
              Generate Bible Verses
            </Button>
          </div>
        ) : verseError ? (
          <div className="bg-backgrounds-white border border-red-300 rounded-lg p-6">
            <div className="alert alert-error mb-4">
              <span>{verseError}</span>
            </div>
            <Button
              variant="outline"
              onClick={() => handleSubmit(false)}
              fullWidth
            >
              Try Again
            </Button>
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
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
            >
              Refresh Verses
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
