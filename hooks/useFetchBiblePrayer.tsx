import { Prayer } from "@/types/prayer";
import axios from "axios";
import React from "react";

interface FetchBibleVersesProps {
  prayerDetails: Prayer | null;
  prayerExampleRef: string;
  setPrayerExampleRef: React.Dispatch<React.SetStateAction<string>>;
  setIsGeneratingVerses: React.Dispatch<React.SetStateAction<boolean>>;
  setVerseError: React.Dispatch<React.SetStateAction<string>>;
}

function useFetchBiblePrayer({
  prayerDetails,
  prayerExampleRef,
  setPrayerExampleRef,
  setIsGeneratingVerses,
  setVerseError,
}: FetchBibleVersesProps) {
  const generatePrayer = async (isRefresh = false) => {
    if (!prayerDetails?.description) {
      setVerseError(
        "Prayer needs a description, More detailed the description, better the verses."
      );
      return;
    }

    setIsGeneratingVerses(true);
    setVerseError("");

    try {
      const response = await axios.post("/api/prayer-example", {
        prayerTitle: prayerDetails.title || "",
        prayerDescription: prayerDetails.description || "",
        excludedVerses: isRefresh ? prayerExampleRef : "",
      });

      const data = response.data;
      if (data.prayerExample) {
        setPrayerExampleRef(data.prayerExample);
      }
    } catch (error) {
      console.error("Failed to generate verses:", error);
      setVerseError("Failed to generate verses. Please try again.");
    } finally {
      setIsGeneratingVerses(false);
    }
  };

  return generatePrayer;
}

export default useFetchBiblePrayer;
