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

export const useUserProgress = () => {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_PROGRESS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (progress.lastLoginDate === todayStr) {
      return; // Já logou hoje, não faz nada
    }

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    setProgress((prev) => {
      let newConsecutiveDays = prev.consecutiveDays;
      let bonusXP = 0;
      const newAchievements = [...prev.achievements];

      if (prev.lastLoginDate === yesterdayStr) {
        // Continua a sequência
        newConsecutiveDays++;
        bonusXP = newConsecutiveDays * 5; // Bônus de 5 XP por dia de sequência
        toast.success(`🔥 Sequência de ${newConsecutiveDays} dias! +${bonusXP} XP bônus!`);

        // Checar conquistas de sequência
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
        // Quebrou a sequência ou é o primeiro login
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
      if (newStoriesRead === 1 && !newAchievements.includes('first-read')) {
        newAchievements.push('first-read');
      }
      if (newStoriesRead === 10 && !newAchievements.includes('dedicated-reader')) {
        newAchievements.push('dedicated-reader');
      }
      
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
      if (newExercisesCompleted === 50 && !newAchievements.includes('number-master')) {
        newAchievements.push('number-master');
      }
      
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