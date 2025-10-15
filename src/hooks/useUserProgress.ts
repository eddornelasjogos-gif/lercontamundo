import { useState, useEffect } from 'react';

export interface UserProgress {
  xp: number;
  level: number;
  storiesRead: number;
  exercisesCompleted: number;
  achievements: string[];
  completedStories: number[];
  completedExercises: number[];
}

const DEFAULT_PROGRESS: UserProgress = {
  xp: 0,
  level: 1,
  storiesRead: 0,
  exercisesCompleted: 0,
  achievements: [],
  completedStories: [],
  completedExercises: [],
};

const STORAGE_KEY = 'ler-conta-mundo-progress';

export const useUserProgress = () => {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_PROGRESS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

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
