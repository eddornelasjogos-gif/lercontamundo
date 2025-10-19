import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, RotateCcw, Home } from 'lucide-react';
import { Mascot } from '@/components/Mascot';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onRestart, onExit }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="max-w-md w-full p-8 shadow-glow border-2 border-primary/30 bg-white/95 animate-scale-in space-y-6 text-center">
        
        <Mascot message="Jogo Pausado!" className="mx-auto mb-4" />
        
        <h2 className="text-3xl font-display font-bold text-foreground">
          O que deseja fazer?
        </h2>

        <div className="space-y-4">
          <Button 
            size="lg" 
            onClick={onResume} // Chamando onResume
            className="w-full gradient-primary shadow-soft"
          >
            <Play className="w-5 h-5 mr-2" />
            Continuar Jogo
          </Button>
          
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={onRestart}
            className="w-full"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reiniciar
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            onClick={onExit}
            className="w-full"
          >
            <Home className="w-5 h-5 mr-2" />
            Voltar ao Menu
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PauseMenu;