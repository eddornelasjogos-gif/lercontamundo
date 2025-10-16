import { useState, useEffect } from 'react';
import { toast } from "sonner";

export interface UserProgress {
  xp: number;
  level: number;
  storiesRead: number;
  exercisesCompleted: number;
  achievements: string[];
  completedStories: number[];
  completedExercises: number[];
  lastLoginDate: string | null;
  consecutiveDays: number;
}

const DEFAULT_PROGRESS: UserProgress = {
  xp: 0,
  level: 1,
  storiesRead: 0,
  exercisesCompleted: 0,
  achievements: [],
  completedStories: [],
  completedExercises: [],
  lastLoginDate: null,
  consecutiveDays: 0,
};

const STORAGE_KEY = 'ler-conta-mundo-progress';
const DAILY_REWARD_XP = 25;

// Novas trilhas de conquistas
const READING_ACHIEVEMENTS = [
  { id: 'reading-1', required: 5, title: 'Iniciante na Leitura' },
  { id: 'reading-2', required: 10, title: 'Leitor Casual' },
  { id: 'reading-3', required: 25, title: 'Leitor Voraz' },
  { id: 'reading-4', required: 50, title: 'Devorador de Livros' },
];

const MATH_ACHIEVEMENTS = [
  { id: 'math-1', required: 5, title: 'Iniciante nos Números' },
  { id: 'math-2', required: 10, title: 'Matemático Casual' },
  { id: 'math-3', required: 25, title: 'Mestre da Lógica' },
  { id: 'math-4', required: 50, title: 'Gênio dos Cálculos' },
];

export const useUserProgress = () => {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const storedProgress = JSON.parse(stored);
      return { ...DEFAULT_PROGRESS, ...storedProgress };
    }
    return DEFAULT_PROGRESS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (progress.lastLoginDate === todayStr) {
      return;
    }

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    setProgress((prev) => {
      let newConsecutiveDays = prev.consecutiveDays;
      let bonusXP = 0;
      const newAchievements = [...prev.achievements];

      if (prev.lastLoginDate === yesterdayStr) {
        newConsecutiveDays++;
        bonusXP = newConsecutiveDays * 5;
        toast.success(`🔥 Sequência de ${newConsecutiveDays} dias! +${bonusXP} XP bônus!`);

        if (newConsecutiveDays >= 3 && !newAchievements.includes('streak-3')) {
          newAchievements.push('streak-3');
          toast.info("🏆 Nova Conquista: Sequência de 3 dias!");
        }
        if (newConsecutiveDays >= 7 && !newAchievements.includes('streak-7')) {
          newAchievements.push('streak-7');
          toast.info("🏆 Nova Conquista: Sequência de 7 dias!");
        }
        if (newConsecutiveDays >= 15 && !newAchievements.includes('streak-15')) {
          newAchievements.push('streak-15');
          toast.info("🏆 Nova Conquista: Sequência de 15 dias!");
        }

      } else {
        newConsecutiveDays = 1;
      }

      const newXP = prev.xp + DAILY_REWARD_XP + bonusXP;
      const newLevel = Math.floor(newXP / 500) + 1;
      
      if (prev.lastLoginDate !== yesterdayStr) {
        toast.success(`🎁 Recompensa diária! Você ganhou ${DAILY_REWARD_XP} XP por voltar!`);
      }

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        lastLoginDate: todayStr,
        consecutiveDays: newConsecutiveDays,
        achievements: newAchievements,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addXP = (amount: number) => {
    setProgress((prev) => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 500) + 1;
      return { ...prev, xp: newXP, level: newLevel };
    });
  };

  const completeStory = (storyId: number, xpReward: number) => {
    setProgress((prev) => {
      if (prev.completedStories.includes(storyId)) return prev;
      
      const newXP = prev.xp + xpReward;
      const newLevel = Math.floor(newXP / 500) + 1;
      const newStoriesRead = prev.storiesRead + 1;
      
      const newAchievements = [...prev.achievements];
      
      // Verifica conquistas de leitura
      READING_ACHIEVEMENTS.forEach(ach => {
        if (newStoriesRead >= ach.required && !newAchievements.includes(ach.id)) {
          newAchievements.push(ach.id);
          toast.info(`🏆 Nova Conquista: ${ach.title}!`);
        }
      });
      
      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        storiesRead: newStoriesRead,
        completedStories: [...prev.completedStories, storyId],
        achievements: newAchievements,
      };
    });
  };

  const completeExercise = (exerciseId: number, xpReward: number) => {
    setProgress((prev) => {
      if (prev.completedExercises.includes(exerciseId)) return prev;
      
      const newXP = prev.xp + xpReward;
      const newLevel = Math.floor(newXP / 500) + 1;
      const newExercisesCompleted = prev.exercisesCompleted + 1;
      
      const newAchievements = [...prev.achievements];

      // Verifica conquistas de matemática
      MATH_ACHIEVEMENTS.forEach(ach => {
        if (newExercisesCompleted >= ach.required && !newAchievements.includes(ach.id)) {
          newAchievements.push(ach.id);
          toast.info(`🏆 Nova Conquista: ${ach.title}!`);
        }
      });
      
      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        exercisesCompleted: newExercisesCompleted,
        completedExercises: [...prev.completedExercises, exerciseId],
        achievements: newAchievements,
      };
    });
  };

  const resetProgress = () => {
    setProgress(DEFAULT_PROGRESS);
  };

  return {
    progress,
    addXP,
    completeStory,
    completeExercise,
    resetProgress,
  };
};