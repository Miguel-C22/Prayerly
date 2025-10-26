import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/*
    GPT-4o-mini Prayer Example Generator
    
    1. Cleans up prayer content for spelling/grammar
    2. Uses GPT-4o-mini to generate a relevant prayer example based on the cleaned content
*/

export async function POST(request: NextRequest) {
  try {
    const { prayerTitle, prayerDescription } = await request.json();

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
    let prayerExample: string = "";
    try {
      const prayerExampleResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a Christian prayer assistant. Create a concise, heartfelt prayer (2-3 sentences) based on the user's request. The prayer must be rooted in Biblical truth, Christ-centered, and sincere. Keep it brief but complete with a proper closing.",
          },
          { role: "user", content: `Prayer: "${cleanedPrayerContent}"` },
        ],
        max_tokens: 150,
      });

      const recommendationText =
        prayerExampleResponse.choices[0]?.message?.content?.trim() || "";

      // Parse the comma-separated verse references
      prayerExample = recommendationText;
    } catch (recommendError) {
      console.error("Prayer Example Failed:", recommendError);
      return NextResponse.json(
        { error: "Failed to deliver prayer example." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        prayerExample,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /prayer-example:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
