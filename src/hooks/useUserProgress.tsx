// src/hooks/useUserProgress.tsx
import { useState, useEffect } from 'react';

// Tipo para progresso do usuário (exportado)
export interface UserProgress {
  storiesRead: number;
  exercisesCompleted: number;
  consecutiveDays: number;
  achievements: string[];
  xp: number;
  level: number;
  completedStories: number[]; // Para compatibilidade com Story/Reading
}

// Hook para gerenciar progresso (exportado)
export const useUserProgress = () => {
  // Estado inicial
  const [userProgress, setUserProgress] = useState<UserProgress>({
    storiesRead: 0,
    exercisesCompleted: 0,
    consecutiveDays: 0,
    achievements: [],
    xp: 0,
    level: 1,
    completedStories: []
  });

  // Carrega do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('userProgress');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUserProgress({
          storiesRead: parsed.storiesRead || 0,
          exercisesCompleted: parsed.exercisesCompleted || 0,
          consecutiveDays: parsed.consecutiveDays || 0,
          achievements: parsed.achievements || [],
          xp: parsed.xp || 0,
          level: parsed.level || 1,
          completedStories: parsed.completedStories || []
        });
      }
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
  }, []);

  // Salva no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('userProgress', JSON.stringify(userProgress));
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }
  }, [userProgress]);

  // Função para atualizar
  const updateProgress = (updates: Partial<UserProgress>) => {
    setUserProgress(prev => ({ ...prev, ...updates }));
  };

  return { userProgress, updateProgress };
};