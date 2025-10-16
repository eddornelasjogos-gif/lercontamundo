import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, Trophy as TrophyIcon } from "lucide-react";

interface TrophyProps {
  icon: LucideIcon;
  title: string;
  description: string;
  unlocked: boolean;
}

export const Trophy = ({ icon: Icon, title, description, unlocked }: TrophyProps) => {
  return (
    <Card
      className={cn(
        "flex flex-col items-center text-center p-4 md:p-6 rounded-2xl border-2 transition-smooth group",
        unlocked
          ? "bg-card border-primary/30 shadow-card hover:shadow-glow hover:-translate-y-2"
          : "bg-muted/50 border-border opacity-60 grayscale"
      )}
    >
      <div
        className={cn(
          "relative w-20 h-20 flex items-center justify-center rounded-full mb-4",
          unlocked ? "gradient-primary shadow-soft" : "bg-muted"
        )}
      >
        <Icon className={cn("w-10 h-10", unlocked ? "text-white" : "text-muted-foreground")} />
        {unlocked && (
          <div className="absolute -top-1 -right-1 p-1 bg-white rounded-full shadow-md">
            <TrophyIcon className="w-4 h-4 text-secondary fill-secondary" />
          </div>
        )}
      </div>
      <h4 className="text-lg font-display font-bold text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground font-body">{description}</p>
    </Card>
  );
};