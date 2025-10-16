import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'divide-io-progress';

type Difficulty = 'easy' | 'medium' | 'hard';

interface GameProgress {
  highScore: number;
  lastDifficulty: Difficulty;
}

const DEFAULT_PROGRESS: GameProgress = {
  highScore: 0,
  lastDifficulty: 'medium',
};

export const useDivideIoProgress = () => {
  const [progress, setProgress] = useState<GameProgress>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const storedProgress = JSON.parse(stored);
        return { ...DEFAULT_PROGRESS, ...storedProgress };
      }
    } catch (error) {
      console.error("Failed to parse progress from localStorage", error);
    }
    return DEFAULT_PROGRESS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error("Failed to save progress to localStorage", error);
    }
  }, [progress]);

  const updateHighScore = useCallback((score: number) => {
    setProgress((prev) => {
      if (score > prev.highScore) {
        return { ...prev, highScore: score };
      }
      return prev;
    });
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    setProgress((prev) => ({ ...prev, lastDifficulty: difficulty }));
  }, []);

  return {
    ...progress,
    updateHighScore,
    setDifficulty,
  };
};