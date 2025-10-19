import { Prayer } from "@/types/prayer";
import axios from "axios";
import React from "react";

interface FetchBibleVersesProps {
  prayerDetails: Prayer | null;
  excludedVerseRefs: string[];
  setExcludedVerseRefs: React.Dispatch<React.SetStateAction<string[]>>;
  setGeneratedVerses: React.Dispatch<
    React.SetStateAction<Array<{ verse: string; chapter: string }>>
  >;
  setIsGeneratingVerses: React.Dispatch<React.SetStateAction<boolean>>;
  setVerseError: React.Dispatch<React.SetStateAction<string>>;
}

function useFetchBibleVerses({
  prayerDetails,
  excludedVerseRefs,
  setExcludedVerseRefs,
  setGeneratedVerses,
  setIsGeneratingVerses,
  setVerseError,
}: FetchBibleVersesProps) {
  const generateVerses = async (isRefresh = false) => {
    if (!prayerDetails?.description) {
      setVerseError(
        "Prayer needs a description, More detailed the description, better the verses."
      );
      return;
    }

    setIsGeneratingVerses(true);
    setVerseError("");

    try {
      const response = await axios.post("/api/bible-verses", {
        prayerTitle: prayerDetails.title || "",
        prayerDescription: prayerDetails.description || "",
        excludedVerses: isRefresh ? excludedVerseRefs : [],
      });

      const data = response.data;

      // Transform documents to BibleVerse format
      if (data.documents && data.documents.length > 0) {
        const verses = data.documents.map((doc: any) => {
          const bookName = doc.book || doc.abbrev?.toUpperCase() || "";
          const cleanText = doc.text.replace(/\{([^}]*)\}/g, "$1");
          return {
            verse: cleanText,
            chapter: `${bookName} ${doc.chapter}:${doc.verse}`,
          };
        });
        setGeneratedVerses(verses);

        // Update excluded verse refs for next refresh
        if (data.returnedVerseRefs) {
          if (isRefresh) {
            setExcludedVerseRefs([
              ...excludedVerseRefs,
              ...data.returnedVerseRefs,
            ]);
          } else {
            setExcludedVerseRefs(data.returnedVerseRefs);
          }
        }
      } else {
        setVerseError(
          "No relevant verses found. Try adding more details to your prayer."
        );
      }
    } catch (error) {
      console.error("Failed to generate verses:", error);
      setVerseError("Failed to generate verses. Please try again.");
    } finally {
      setIsGeneratingVerses(false);
    }
  };

  return generateVerses;
}

export default useFetchBibleVerses;
