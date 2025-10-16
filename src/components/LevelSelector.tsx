"use client";

import React from "react";

type Difficulty = "easy" | "medium" | "hard" | "very-hard";

interface LevelSelectorProps {
  value: Difficulty;
  onChange: (value: Difficulty) => void;
  className?: string;
}

const LABELS: Record<Difficulty, string> = {
  easy: "Fácil",
  medium: "Médio",
  hard: "Difícil",
  "very-hard": "Muito Difícil",
};

const LevelSelector: React.FC<LevelSelectorProps> = ({ value, onChange, className = "" }) => {
  const levels: Difficulty[] = ["easy", "medium", "hard", "very-hard"];

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {levels.map((level) => {
        const isActive = level === value;
        return (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            aria-pressed={isActive}
            className={`px-3 py-2 rounded-full text-sm font-semibold transition-smooth focus:outline-none focus:ring-2 focus:ring-primary/60 ${
              isActive
                ? "gradient-primary text-white shadow-soft"
                : "bg-white/60 text-foreground border border-border hover:brightness-95"
            }`}
          >
            {LABELS[level]}
          </button>
        );
      })}
    </div>
  );
};

export default LevelSelector;