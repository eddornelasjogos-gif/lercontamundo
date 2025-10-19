import React, { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'divide-io-progress';

type Difficulty = 'very-easy' | 'easy' | 'medium' | 'hard';

interface LeaderboardEntry {
  name: string;
  score: number;
}

interface GameProgress {
  highScore: number;
  lastDifficulty: Difficulty;
  playerName: string;
  leaderboard: LeaderboardEntry[];
}

const DEFAULT_PROGRESS: GameProgress = {
  highScore: 0,
  lastDifficulty: 'medium',
  playerName: 'Jogador',
  leaderboard: [],
};

export const useDivideIoProgress = () => {
  const [progress, setProgress] = useState<GameProgress>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const storedProgress = JSON.parse(stored);
        // Garante que a estrutura padrão seja mantida se o localStorage estiver incompleto
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
  
  const setPlayerName = useCallback((name: string) => {
    setProgress((prev) => ({ ...prev, playerName: name }));
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    setProgress((prev) => ({ ...prev, lastDifficulty: difficulty }));
  }, []);
  
  const updateLeaderboard = useCallback((name: string, score: number) => {
    setProgress((prev) => {
      const newEntry: LeaderboardEntry = { name, score };
      
      // Remove entradas antigas do mesmo nome
      let newLeaderboard = prev.leaderboard.filter(entry => entry.name !== name);
      
      // Adiciona a nova entrada
      newLeaderboard = [...newLeaderboard, newEntry];
      
      // Ordena por score (maior primeiro) e mantém apenas o top 10
      newLeaderboard.sort((a, b) => b.score - a.score);
      newLeaderboard = newLeaderboard.slice(0, 10);
      
      return { ...prev, leaderboard: newLeaderboard };
    });
  }, []);

  return {
    ...progress,
    updateHighScore,
    setDifficulty,
    setPlayerName,
    updateLeaderboard,
  };
};