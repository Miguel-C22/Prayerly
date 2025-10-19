import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY ?? "" });

/*
  GPT-Recommended Verses + Pinecone Lookup

  1. GPT-4o-mini analyzes prayer and recommends specific verse references
  2. Parse those references (e.g., "Jeremiah 30:17")
  3. Look up exact verses in Pinecone by metadata filter
  4. Return those verses
  5. On refresh, exclude previously shown verses

  Reason for this approach rather than matching embeddings directly: 

  Vector embeddings don't understand theological context:
    - Matches "healing" but gets "gifts of healing" (wrong context)
    - Matches "health" but gets "saving health" (metaphorical)
    - Matches "promises" but gets unrelated spiritual transformation verses

  My Solution: 
  GPT-4o-mini already knows the Bible and can recommend the RIGHT verses contextually:
    - For healing: "Recommend Jeremiah 30:17, Isaiah 53:5, Psalm 103:3"
    - It understands the difference between "healing promise" vs "spiritual gifts"
    - It knows which verses are actually used for comfort/encouragement in that situation

  Still using Pinecone for the retrieval that way scripture cannot be "hallucinated" by the AI. 
*/

export async function POST(request: NextRequest) {
  try {
    const {
      prayerTitle,
      prayerDescription,
      excludedVerses = [],
    } = await request.json();

    if (!prayerTitle && !prayerDescription) {
      return NextResponse.json(
        { error: "Prayer title or description is required" },
        { status: 400 }
      );
    }

    const prayerContent =
      `${prayerTitle || ""} ${prayerDescription || ""}`.trim();

    // STEP 1: Prayer Content Cleanup - Fix spelling/grammar
    let cleanedPrayerContent = prayerContent;
    try {
      const cleanupResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              'You are a text cleaner. Fix spelling, grammar, and formatting in prayer content. Only return the corrected text, nothing else. Keep the same intent and meaning. Examples: "prayin for stregth" → "praying for strength", "help me with anxity" → "help me with anxiety", "need guidence" → "need guidance"',
          },
          { role: "user", content: prayerContent },
        ],
        max_tokens: 100,
      });

      cleanedPrayerContent =
        cleanupResponse.choices[0]?.message?.content?.trim() || prayerContent;
    } catch (cleanupError) {
      console.log(
        `Prayer cleanup failed, using original content:`,
        cleanupError
      );
    }

    // STEP 2: GPT-4o-mini Bible Verse Recommendation - Get specific verse references
    let recommendedVerseRefs: string[] = [];
    try {
      const excludedVersesText =
        excludedVerses.length > 0
          ? `\n\nDo NOT recommend these verses (already shown): ${excludedVerses.join(", ")}`
          : "";

      const verseRecommendationResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a Bible verse recommendation expert. Given a prayer request, recommend 5 specific Bible verses that are DIRECTLY relevant and appropriate for that specific need.

IMPORTANT RULES:
1. Return ONLY verse references in this EXACT format: "Book Chapter:Verse"
2. Use full book names (e.g., "Jeremiah" not "Jer", "Psalms" not "Ps", "1 Corinthians" not "1 Cor")
3. Separate multiple verses with commas
4. Choose verses that are PROMISES, DECLARATIONS, or INSTRUCTIONS - NOT historical narratives
5. For healing prayers, choose verses about God's healing power/promises, NOT stories of people being healed
6. Match the specific need precisely - don't be generic

GOOD Examples (healing prayer):
"Jeremiah 30:17, Exodus 15:26, Psalm 103:3, Isaiah 53:5, James 5:15"

BAD Examples:
"Luke 6:18, Mark 1:34" (these are narratives, not promises)
"1 Corinthians 12:9" (about spiritual gifts, not healing promises)

Return format: Just the verse references, comma-separated, nothing else.${excludedVersesText}`,
          },
          { role: "user", content: `Prayer: "${cleanedPrayerContent}"` },
        ],
        max_tokens: 150,
      });

      const recommendationText =
        verseRecommendationResponse.choices[0]?.message?.content?.trim() || "";

      // Parse the comma-separated verse references
      recommendedVerseRefs = recommendationText
        .split(",")
        .map((ref) => ref.trim())
        .filter((ref) => ref.length > 0);
    } catch (recommendError) {
      console.error("Verse recommendation failed:", recommendError);
      return NextResponse.json(
        { error: "Failed to get verse recommendations" },
        { status: 500 }
      );
    }

    // STEP 3: Parse verse references and lookup in Pinecone
    const finalDocuments: any[] = [];
    const index = pc.index(process.env.PINECONE_INDEX_NAME!);

    for (const verseRef of recommendedVerseRefs) {
      try {
        // Parse verse reference: "Jeremiah 30:17" → book="Jeremiah", chapter=30, verse=17
        const match = verseRef.match(/^(.+?)\s+(\d+):(\d+)$/);
        if (!match) {
          console.warn(`Could not parse verse reference: ${verseRef}`);
          continue;
        }

        const [, book, chapterStr, verseStr] = match;
        const chapter = parseInt(chapterStr);
        const verse = parseInt(verseStr);

        // Query Pinecone using metadata filter for exact verse
        // Provide a zero vector since we're filtering by metadata only
        const zeroVector = new Array(1536).fill(0);
        const queryResponse = await index.query({
          vector: zeroVector,
          filter: {
            book: { $eq: book },
            chapter: { $eq: chapter },
            verse: { $eq: verse },
          },
          topK: 1,
          includeMetadata: true,
        });

        if (queryResponse.matches && queryResponse.matches.length > 0) {
          const match = queryResponse.matches[0];
          finalDocuments.push({
            id: match.id,
            score: match.score || 1.0,
            text: match.metadata?.text || "No text available",
            abbrev: match.metadata?.abbrev,
            book: match.metadata?.book,
            chapter: match.metadata?.chapter,
            verse: match.metadata?.verse,
          });
        } else {
          console.warn(`Verse not found in Pinecone: ${verseRef}`);
        }

        // Limit to 3 verses
        if (finalDocuments.length >= 3) break;
      } catch (lookupError) {
        console.error(`Failed to lookup verse ${verseRef}:`, lookupError);
      }
    }

    // If we couldn't find enough verses, return error
    if (finalDocuments.length === 0) {
      return NextResponse.json(
        { error: "Could not find recommended verses in database" },
        { status: 404 }
      );
    }

    // STEP 4: Format verses for response
    const verses = finalDocuments
      .map((doc: any) => {
        const bookName = doc.book || doc.abbrev?.toUpperCase() || "";
        const cleanText = doc.text.replace(/\{([^}]*)\}/g, "$1");
        return `${bookName} ${doc.chapter}:${doc.verse} - ${cleanText}`;
      })
      .join("\n\n");

    // Build list of returned verse references for exclusion on next refresh
    const returnedVerseRefs = finalDocuments.map(
      (doc: any) => `${doc.book} ${doc.chapter}:${doc.verse}`
    );

    return NextResponse.json({
      prayerTitle,
      prayerDescription,
      prayerContent,
      recommendedRefs: recommendedVerseRefs, // What GPT recommended
      documents: finalDocuments,
      total: finalDocuments.length,
      verses: verses,
      returnedVerseRefs, // For excluding on refresh
    });
  } catch (error) {
    console.error("Error in bible-verses API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
