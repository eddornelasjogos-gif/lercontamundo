import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Status = "locked" | "unlocked" | "completed";

interface JourneyNodeProps {
  title: string;
  icon: React.ElementType;
  status: Status;
  onClick: () => void;
}

export const JourneyNode = ({ title, icon: Icon, status, onClick }: JourneyNodeProps) => {
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const isUnlocked = status === "unlocked";

  const nodeClasses = cn(
    "w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4 shadow-lg transition-all duration-300 cursor-pointer relative",
    {
      "bg-muted border-border text-muted-foreground grayscale cursor-not-allowed": isLocked,
      "gradient-primary border-white text-white hover:scale-110 animate-pulse-glow": isUnlocked,
      "bg-success border-white text-white hover:scale-110": isCompleted,
    }
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative"
        >
          <button onClick={isLocked ? undefined : onClick} className={nodeClasses} aria-label={title}>
            <Icon className="w-8 h-8 md:w-10 md:h-10" />
            {isLocked && (
              <div className="absolute -bottom-2 -right-2 bg-foreground text-background rounded-full p-1 border-2 border-white">
                <Lock className="w-3 h-3" />
              </div>
            )}
            {isCompleted && (
              <div className="absolute -bottom-2 -right-2 bg-white text-success rounded-full p-1 border-2 border-success">
                <Check className="w-4 h-4" />
              </div>
            )}
          </button>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-body font-semibold">{title}</p>
      </TooltipContent>
    </Tooltip>
  );
};