"use client";

import { useState } from "react";

export function SpoilerSummary({ text, hidden }) {
  const [revealed, setRevealed] = useState(!hidden);

  if (!text) return null;

  if (revealed) {
    return (
      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{text}</p>
    );
  }

  return (
    <div className="relative mb-3">
      <p
        className="text-sm text-muted-foreground line-clamp-3 blur-sm select-none"
        aria-hidden="true"
      >
        {text}
      </p>
      <button
        onClick={() => setRevealed(true)}
        className="absolute inset-0 flex items-center justify-center gap-1.5 text-xs font-medium bg-background/80 rounded-md hover:bg-background/95 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>🔒</span> Reveal summary (spoiler)
      </button>
    </div>
  );
}
