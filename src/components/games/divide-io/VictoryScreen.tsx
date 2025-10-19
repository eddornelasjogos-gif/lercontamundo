import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, Home, Crown } from 'lucide-react';
import { Mascot } from '@/components/Mascot';

interface VictoryScreenProps {
  onRestart: () => void;
  onMenu: () => void;
  difficulty: string; // Recebe a dificuldade para exibir o nível
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({ onRestart, onMenu, difficulty }) => {
  const difficultyLabel = difficulty === 'very-easy' ? 'Muito Fácil' : 
                         difficulty === 'easy' ? 'Fácil' : 
                         difficulty === 'medium' ? 'Médio' : 'Difícil';

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
          Parabéns! Você alcançou 200.000 pontos e venceu o nível {difficultyLabel}!
        </p>

        <div className="space-y-4">
          <Button 
            size="lg" 
            onClick={onRestart} 
            className="w-full gradient-primary shadow-soft"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reiniciar no Mesmo Nível
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            onClick={onMenu}
            className="w-full"
          >
            <Home className="w-5 h-5 mr-2" />
            Voltar ao Menu Inicial
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default VictoryScreen;