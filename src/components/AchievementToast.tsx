import { LucideIcon } from "lucide-react";

interface AchievementToastProps {
  icon: LucideIcon;
  title: string;
}

export const AchievementToast = ({ icon: Icon, title }: AchievementToastProps) => {
  return (
    <div className="flex items-center gap-4 p-4 w-80 rounded-2xl border-2 border-amber-300 shadow-glow gradient-trophy animate-scale-in cursor-pointer">
      <div className="flex-shrink-0 p-3 bg-white/30 rounded-full animate-pulse-glow">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div className="flex-grow">
        <p className="font-body font-bold text-sm text-white/90">🏆 Nova Conquista! 🎉</p>
        <h3 className="font-display font-extrabold text-lg text-white">{title}</h3>
      </div>
    </div>
  );
};