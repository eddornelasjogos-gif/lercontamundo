import React from 'react';
import { Clock, Star, Trophy, Volume2, VolumeX } from 'lucide-react';
import { Difficulty, GameMode, GAME_SETTINGS } from './types';
import { cn } from '@/lib/utils';

interface HUDProps {
  score: number;
  timeRemaining: number;
  difficulty: Difficulty;
  mode: GameMode;
  isSoundOn: boolean;
  onToggleSound: () => void;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Fácil",
  medium: "Médio",
  hard: "Difícil",
};

const MODE_LABELS: Record<GameMode, string> = {
  time: "Contra o Tempo",
  levels: "Níveis Mágicos",
};

const HUD: React.FC<HUDProps> = ({ score, timeRemaining, difficulty, mode, isSoundOn, onToggleSound }) => {
  const maxTime = GAME_SETTINGS[difficulty].timeLimitSeconds;
  // const timePercentage = (timeRemaining / maxTime) * 100; // Não usado no momento
  
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = Math.floor(timeRemaining % 60).toString().padStart(2, '0');

  return (
    <div className="absolute top-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm shadow-md flex justify-between items-center z-20">
      
      {/* Info Esquerda: Modo e Dificuldade */}
      <div className="flex flex-col text-sm font-body">
        <span className="font-bold text-primary">{MODE_LABELS[mode]}</span>
        <span className="text-muted-foreground">Nível: {DIFFICULTY_LABELS[difficulty]}</span>
      </div>

      {/* Centro: Pontuação e Tempo */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 font-display font-bold text-xl text-foreground">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span>{score}</span>
        </div>
        
        {mode === 'time' && (
            <div className="flex items-center gap-1 text-sm font-body">
                <Clock className="w-4 h-4 text-secondary" />
                <span className={cn(timeRemaining < 10 && 'text-destructive font-bold animate-pulse')}>{minutes}:{seconds}</span>
            </div>
        )}
      </div>

      {/* Direita: Controles */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSound}
          className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          aria-label={isSoundOn ? "Desligar som" : "Ligar som"}
        >
          {isSoundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default HUD;