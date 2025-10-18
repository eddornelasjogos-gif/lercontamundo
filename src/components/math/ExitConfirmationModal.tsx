import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Mascot } from "@/components/Mascot";

interface ExitConfirmationModalProps {
  isOpen: boolean;
  onConfirmExit: () => void;
  onCancel: () => void;
}

export const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({
  isOpen,
  onConfirmExit,
  onCancel,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="rounded-2xl p-6 bg-white/95 backdrop-blur-sm shadow-soft max-w-sm">
        <AlertDialogHeader className="text-center">
          <Mascot message="Tem certeza que deseja sair?" className="mx-auto mb-4" />
          <AlertDialogTitle className="text-2xl font-display font-bold text-destructive">
            Progresso será perdido!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground font-body">
            Se você sair agora, o progresso do seu teste de matemática será perdido.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
          <AlertDialogCancel 
            onClick={onCancel}
            className="w-full sm:w-auto border-2 border-primary/30 hover:bg-primary/10"
          >
            Continuar Teste
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirmExit}
            className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-white"
          >
            Confirmar Saída
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};