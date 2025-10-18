import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Layers, Zap, Star, Sparkles, Gamepad2 } from 'lucide-react';
import { Difficulty, GameMode } from './types';
import { useMagicBubblesProgress } from '@/hooks/useMagicBubblesProgress';
import { Mascot } from '@/components/Mascot';
import { cn } from '@/lib/utils';

interface MagicBubblesMenuProps {
  onStartGame: (difficulty: Difficulty, mode: GameMode) => void;
}

const DIFFICULTY_OPTIONS: { id: Difficulty; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'easy', label: 'Fácil', icon: Sparkles },
  { id: 'medium', label: 'Médio', icon: Star },
  { id: 'hard', label: 'Difícil', icon: Zap },
];

const MODE_OPTIONS: { id: GameMode; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'time', label: 'Corrida contra o Tempo', icon: Clock },
  { id: 'levels', label: 'Níveis Mágicos', icon: Layers },
];

const MagicBubblesMenu: React.FC<MagicBubblesMenuProps> = ({ onStartGame }) => {
  const { lastDifficulty, lastMode, highScores } = useMagicBubblesProgress();
  
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(lastDifficulty);
  const [selectedMode, setSelectedMode] = useState<GameMode>(lastMode);

  const handleStart = () => {
    onStartGame(selectedDifficulty, selectedMode);
  };
  
  const getMascotMessage = () => {
      if (selectedMode === 'time') {
          const highScore = highScores.time[selectedDifficulty];
          return highScore > 0 
            ? `Seu recorde no modo Tempo (${DIFFICULTY_OPTIONS.find(d => d.id === selectedDifficulty)?.label}): ${highScore}!`
            : "Tente limpar o campo antes que o tempo acabe!";
      } else {
          const maxLevel = highScores.levels[selectedDifficulty];
          return maxLevel > 0 
            ? `Nível máximo alcançado (${DIFFICULTY_OPTIONS.find(d => d.id === selectedDifficulty)?.label}): ${maxLevel}. Avance mais!`
            : "Complete fases para desbloquear novos desafios.";
      }
  };

  return (
    <Card className="max-w-2xl mx-auto p-6 md:p-10 shadow-glow border-2 border-primary/20 bg-white/50 backdrop-blur-lg animate-scale-in">
      <div className="text-center space-y-6">
        <div className="flex justify-center items-center gap-4">
          <Gamepad2 className="w-12 h-12 text-primary" />
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">Bolhas Mágicas</h1>
            <p className="text-muted-foreground font-body">Junte 3 ou mais e faça a magia acontecer!</p>
          </div>
        </div>
        
        <Mascot message={getMascotMessage()} className="mx-auto" />

        {/* Seleção de Modo */}
        <div className="space-y-3 pt-4">
          <h3 className="text-lg font-display font-semibold text-foreground">Escolha o Modo de Jogo</h3>
          <div className="flex justify-center gap-3">
            {MODE_OPTIONS.map((mode) => (
              <Button
                key={mode.id}
                variant={selectedMode === mode.id ? "gradient" : "outline"}
                onClick={() => setSelectedMode(mode.id)}
                className={cn("flex-1 min-w-[150px]", selectedMode === mode.id && "shadow-soft")}
              >
                <mode.icon className="w-5 h-5 mr-2" />
                {mode.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Seleção de Dificuldade */}
        <div className="space-y-3 pt-4">
          <h3 className="text-lg font-display font-semibold text-foreground">Escolha a Dificuldade</h3>
          <div className="flex justify-center gap-3">
            {DIFFICULTY_OPTIONS.map((d) => (
              <Button
                key={d.id}
                variant={selectedDifficulty === d.id ? "gradient" : "outline"}
                onClick={() => setSelectedDifficulty(d.id)}
                className={cn("flex-1", selectedDifficulty === d.id && "shadow-soft")}
              >
                <d.icon className="w-5 h-5 mr-2" />
                {d.label}
              </Button>
            ))}
          </div>
        </div>

        <Button size="lg" className="w-full mt-6 gradient-primary shadow-soft" onClick={handleStart}>
          Começar Aventura Mágica
        </Button>
      </div>
    </Card>
  );
};

export default MagicBubblesMenu;