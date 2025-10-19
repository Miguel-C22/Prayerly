"use client";

import { Prayer } from "@/types/prayer";
import React, { useEffect, useState } from "react";
import BibleVerse from "./BibleVerse";
import Icon from "../icon/Icon";
import LoadingOverlay from "../loading/LoadingOverlay";
import useFetchBibleVerses from "@/hooks/useFetchBibleVerses";

interface AIBookVerseProps {
  prayerDetails: Prayer | null;
}

export default function AIBibleVerse({ prayerDetails }: AIBookVerseProps) {
  const [generatedVerses, setGeneratedVerses] = useState<
    Array<{ verse: string; chapter: string }>
  >([]);
  const [isGeneratingVerses, setIsGeneratingVerses] = useState(false);
  const [verseError, setVerseError] = useState("");
  const [excludedVerseRefs, setExcludedVerseRefs] = useState<string[]>([]);

  const generateVerses = useFetchBibleVerses({
    prayerDetails,
    excludedVerseRefs,
    setExcludedVerseRefs,
    setGeneratedVerses,
    setIsGeneratingVerses,
    setVerseError,
  });

  useEffect(() => {
    setGeneratedVerses([]);
    setVerseError("");
    setExcludedVerseRefs([]);
  }, [prayerDetails]);

  return (
    <>
      <LoadingOverlay
        isLoading={isGeneratingVerses}
        message="Generating verses..."
      />
      <div>
        {generatedVerses.length === 0 && !verseError ? (
          <div className="bg-backgrounds-white border border-border-gray rounded-lg p-6 text-center">
            <p className="text-text-grayPrimary mb-4">
              Generate Bible verses related to this prayer request.
            </p>
            <button
              className="btn bg-text-purplePrimary hover:bg-purple-600 text-white border-none"
              onClick={() => generateVerses(false)}
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
              onClick={() => generateVerses(false)}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {generatedVerses.map((verse, index) => (
              <BibleVerse
                key={index}
                verse={verse.verse}
                chapter={verse.chapter}
              />
            ))}
            <button
              className="btn btn-outline border-border-gray text-text-grayPrimary hover:bg-backgrounds-grayLight"
              onClick={() => generateVerses(true)}
            >
              Refresh Verses
            </button>
          </div>
        )}
      </div>
    </>
  );
}
