// src/contexts/ProgressContext.tsx
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useUserProgress, UserProgress } from '../hooks/useUserProgress'; // Import relativo (resolve alias issues)

interface ProgressContextType {
  progress: UserProgress;
  addXP: (amount: number) => void;
  completeStory: (storyId: number, xpReward: number) => void;
  completeExercise: (exerciseId: number, xpReward: number) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const { userProgress, updateProgress } = useUserProgress(); // Usa o hook

  const [progress, setProgress] = useState<UserProgress>(userProgress);

  // Sincroniza com o hook
  useEffect(() => {
    setProgress(userProgress);
  }, [userProgress]);

  const addXP = (amount: number) => {
    const newXP = (progress.xp || 0) + amount;
    const newLevel = Math.floor(newXP / 500) + 1;
    updateProgress({ xp: newXP, level: newLevel });
  };

  const completeStory = (storyId: number, xpReward: number) => {
    updateProgress({
      storiesRead: (progress.storiesRead || 0) + 1,
      completedStories: [...(progress.completedStories || []), storyId],
      xp: (progress.xp || 0) + xpReward,
      achievements: [...(progress.achievements || []), `story-${storyId}`]
    });
  };

  const completeExercise = (exerciseId: number, xpReward: number) => {
    updateProgress({
      exercisesCompleted: (progress.exercisesCompleted || 0) + 1,
      xp: (progress.xp || 0) + xpReward,
      achievements: [...(progress.achievements || []), `exercise-${exerciseId}`]
    });
  };

  const resetProgress = () => {
    updateProgress({
      storiesRead: 0,
      exercisesCompleted: 0,
      consecutiveDays: 0,
      achievements: [],
      xp: 0,
      level: 1,
      completedStories: []
    });
  };

  // Provider value: objeto completo
  return (
    <ProgressContext.Provider value={{ progress, addXP, completeStory, completeExercise, resetProgress }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return context;
};