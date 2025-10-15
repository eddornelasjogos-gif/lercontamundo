import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface ProgressBarProps {
  currentXP: number;
  requiredXP: number;
  level: number;
}

export const ProgressBar = ({ currentXP, requiredXP, level }: ProgressBarProps) => {
  const percentage = (currentXP / requiredXP) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full gradient-primary">
            <Star className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            Nível {level}
          </span>
        </div>
        <span className="text-sm font-body font-medium text-muted-foreground">
          {currentXP} / {requiredXP} XP
        </span>
      </div>
      <div className="relative">
        <Progress value={percentage} className="h-3" />
      </div>
    </div>
  );
};
