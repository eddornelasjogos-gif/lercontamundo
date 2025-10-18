import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EjectButtonProps {
  onEject: () => void;
  className?: string;
}

const EjectButton: React.FC<EjectButtonProps> = ({ onEject, className }) => {
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEject();
  };

  return (
    <button
      onClick={handleClick}
      onTouchStart={handleClick}
      className={cn(
        "fixed bottom-4 right-32 z-50 w-16 h-16 rounded-full bg-yellow-500/70 backdrop-blur-sm flex items-center justify-center text-white shadow-lg transition-transform active:scale-90",
        className
      )}
      aria-label="Ejetar massa"
    >
      <ArrowUpRight size={30} />
    </button>
  );
};

export default EjectButton;