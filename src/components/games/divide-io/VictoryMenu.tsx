import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, Home, Crown } from 'lucide-react';
import { Mascot } from '@/components/Mascot';

interface VictoryMenuProps {
  onRestart: () => void;
  onMenu: () => void;
}

const VictoryMenu: React.FC<VictoryMenuProps> = ({ onRestart, onMenu }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="max-w-md w-full p-8 shadow-glow border-2 border-primary/30 bg-white/95 animate-scale-in space-y-6 text-center">
        
        <Mascot message="Você Venceu! 🎉" className="mx-auto mb-4" />
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="w-8 h-8 text-yellow-500 animate-bounce" />
          <h2 className="text-3xl font-display font-bold text-foreground">
            Vitória!
          </h2>
        </div>

        <p className="text-lg font-body text-muted-foreground mb-6">
          Parabéns! Você alcançou 200.000 pontos e venceu o nível!
        </p>

        <div className="space-y-4">
          <Button 
            size="lg" 
            onClick={onRestart} 
            className="w-full gradient-primary shadow-soft"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reiniciar (Pontuação Zero)
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            onClick={onMenu}
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

export default VictoryMenu;