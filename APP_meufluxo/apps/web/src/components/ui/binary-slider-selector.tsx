"use client";

import * as React from "react";

export function BinarySliderSelector<T extends string>({
  value,
  leftValue,
  rightValue,
  leftLabel,
  rightLabel,
  onChange,
}: {
  value: T;
  leftValue: T;
  rightValue: T;
  leftLabel: string;
  rightLabel: string;
  onChange: (next: T) => void;
}) {
  const rightActive = value === rightValue;

  return (
    <div className="flex h-10 items-center justify-center gap-3">
      <button
        type="button"
        className={`text-sm transition ${!rightActive ? "font-medium text-foreground" : "text-muted-foreground"}`}
        onClick={() => onChange(leftValue)}
      >
        {leftLabel}
      </button>

      <button
        type="button"
        aria-label={`${leftLabel} / ${rightLabel}`}
        className="relative h-6 w-12 overflow-hidden rounded-full border border-border/70 bg-muted/70 p-0.5 transition"
        onClick={() => onChange(rightActive ? leftValue : rightValue)}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full border border-border/50 bg-white shadow-sm transition-transform ${
            rightActive ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>

      <button
        type="button"
        className={`text-sm transition ${rightActive ? "font-medium text-foreground" : "text-muted-foreground"}`}
        onClick={() => onChange(rightValue)}
      >
        {rightLabel}
      </button>
    </div>
  );
}

