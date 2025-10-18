import { useState, useEffect, useCallback } from 'react';
import { Difficulty, GameMode } from '@/components/games/magic-bubbles/types';

const STORAGE_KEY = 'magic-bubbles-progress';

interface HighScores {
  time: Record<Difficulty, number>;
  levels: Record<Difficulty, number>; // Nível máximo alcançado
}

interface GameProgress {
  highScores: HighScores;
  lastDifficulty: Difficulty;
  lastMode: GameMode;
}

const DEFAULT_PROGRESS: GameProgress = {
  highScores: {
    time: { easy: 0, medium: 0, hard: 0 },
    levels: { easy: 0, medium: 0, hard: 0 },
  },
  lastDifficulty: 'medium',
  lastMode: 'time',
};

export const useMagicBubblesProgress = () => {
  const [progress, setProgress] = useState<GameProgress>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const storedProgress = JSON.parse(stored);
        return { ...DEFAULT_PROGRESS, ...storedProgress };
      }
    } catch (error) {
      console.error("Failed to parse Magic Bubbles progress from localStorage", error);
    }
    return DEFAULT_PROGRESS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error("Failed to save Magic Bubbles progress to localStorage", error);
    }
  }, [progress]);

  const setLastSettings = useCallback((difficulty: Difficulty, mode: GameMode) => {
    setProgress((prev) => ({ ...prev, lastDifficulty: difficulty, lastMode: mode }));
  }, []);

  const updateHighScore = useCallback((mode: GameMode, difficulty: Difficulty, score: number) => {
    setProgress((prev) => {
      const currentScore = prev.highScores[mode][difficulty];
      if (score > currentScore) {
        return {
          ...prev,
          highScores: {
            ...prev.highScores,
            [mode]: {
              ...prev.highScores[mode],
              [difficulty]: score,
            },
          },
        };
      }
      return prev;
    });
  }, []);
  
  const updateMaxLevel = useCallback((difficulty: Difficulty, level: number) => {
    setProgress((prev) => {
      const currentMaxLevel = prev.highScores.levels[difficulty];
      if (level > currentMaxLevel) {
        return {
          ...prev,
          highScores: {
            ...prev.highScores,
            levels: {
              ...prev.highScores.levels,
              [difficulty]: level,
            },
          },
        };
      }
      return prev;
    });
  }, []);

  return {
    ...progress,
    setLastSettings,
    updateHighScore,
    updateMaxLevel,
  };
};