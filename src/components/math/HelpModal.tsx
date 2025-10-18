import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { HelpContent, HelpStep } from "@/utils/math-generator";
import { Lightbulb, Blocks, Hand, Divide, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  helpContent: HelpContent;
}

const VisualAidIcon: React.FC<{ type?: string; className?: string }> = ({ type, className }) => {
  switch (type) {
    case 'blocks':
      return <Blocks className={cn("w-6 h-6 text-primary", className)} />;
    case 'fingers':
      return <Hand className={cn("w-6 h-6 text-secondary", className)} />;
    case 'decimal_shift':
      return <Divide className={cn("w-6 h-6 text-accent", className)} />;
    case 'groups':
      return <Blocks className={cn("w-6 h-6 text-primary", className)} />;
    case 'balance':
      return <Scale className={cn("w-6 h-6 text-destructive", className)} />;
    case 'division_long':
      return <Divide className={cn("w-6 h-6 text-accent", className)} />;
    default:
      return <Lightbulb className={cn("w-6 h-6 text-muted-foreground", className)} />;
  }
};

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, helpContent }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl p-6 bg-white/95 backdrop-blur-sm shadow-soft">
        <DialogHeader>
          <div className="flex items-center gap-3 text-primary">
            <Lightbulb className="w-8 h-8 fill-primary/10" />
            <DialogTitle className="text-2xl font-display font-bold text-foreground">
              {helpContent.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground font-body">
            Aprenda o passo a passo para resolver esta questão.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {helpContent.steps.map((step: HelpStep, index: number) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex-shrink-0 mt-1">
                <VisualAidIcon type={step.visualAid} />
              </div>
              <p className="text-sm font-body text-foreground">
                <span className="font-bold">{index + 1}.</span> {step.text}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpModal;