import { Gift } from 'lucide-react';
import { useProgress } from '@/contexts/ProgressContext';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const DailyRewardButton = () => {
  const { progress } = useProgress();
  const today = new Date().toISOString().split('T')[0];
  const isClaimed = progress.lastLoginDate === today;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-full transition-smooth",
          isClaimed
            ? "bg-success/20 text-success cursor-default"
            : "gradient-primary text-white shadow-soft animate-pulse-glow"
        )}>
          <Gift className="w-5 h-5" />
          <span className="text-xs md:text-sm font-body font-semibold">
            {isClaimed ? "Recebido!" : "Prêmio"}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isClaimed ? "Você já coletou sua recompensa hoje. Volte amanhã!" : "Sua recompensa diária de XP foi adicionada!"}</p>
      </TooltipContent>
    </Tooltip>
  );
};