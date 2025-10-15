import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DifficultyCardProps {
  title: string;
  description: string;
  ageRange: string;
  icon: LucideIcon;
  color: string;
  onClick: () => void;
}

export const DifficultyCard = ({
  title,
  description,
  ageRange,
  icon: Icon,
  color,
  onClick,
}: DifficultyCardProps) => {
  return (
    <Card
      onClick={onClick}
      className={`p-6 cursor-pointer transition-smooth hover:scale-105 hover:shadow-glow border-2 ${color} bg-card shadow-card animate-scale-in group`}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 group-hover:animate-bounce-gentle">
          <Icon className="w-12 h-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-display font-bold text-foreground">
            {title}
          </h3>
          <p className="text-sm font-medium text-muted-foreground">{ageRange}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
};
