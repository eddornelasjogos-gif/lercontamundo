import React from 'react';
import { GitCommitHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SplitButtonProps {
  onSplit: () => void;
  className?: string;
}

const SplitButton: React.FC<SplitButtonProps> = ({ onSplit, className }) => {
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSplit();
  };

  return (
    <button
      onClick={handleClick}
      onTouchStart={handleClick}
      className={cn(
        "fixed bottom-4 right-10 z-50 w-20 h-20 rounded-full bg-red-500/70 backdrop-blur-sm flex items-center justify-center text-white shadow-lg transition-transform active:scale-90",
        className
      )}
      aria-label="Dividir célula"
    >
      <GitCommitHorizontal size={40} />
    </button>
  );
};

export default SplitButton;