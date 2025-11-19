import React from "react";

interface BibleVerseProps {
  verse: string;
  chapter?: string;
}

function BibleVerse({ verse, chapter }: BibleVerseProps) {
  return (
    <div
      className="p-6 rounded-2xl text-center"
      style={{ background: "linear-gradient(to right, #fef6da, #cc8a20)" }}
    >
      <p className="text-amber-900 italic text-lg mb-2">"{verse}"</p>
      <p className="text-amber-800 font-medium">{chapter}</p>
    </div>
  );
}

export default BibleVerse;
