import { createContext, useContext, ReactNode } from 'react';
import { useUserProgress, UserProgress } from '@/hooks/useUserProgress';

interface ProgressContextType {
  progress: UserProgress;
  addXP: (amount: number) => void;
  completeStory: (storyId: number, xpReward: number) => void;
  completeExercise: (exerciseId: number, xpReward: number) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const userProgress = useUserProgress();

  return (
    <ProgressContext.Provider value={userProgress}>
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
