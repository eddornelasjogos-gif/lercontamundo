import React, { useRef, useEffect, useCallback } from 'react';
import { useDivideIoProgress } from '@/hooks/useDivideIoProgress';
import VirtualJoystick from './VirtualJoystick';
import SplitButton from './SplitButton';
import Minimap from './Minimap';
import { BOT_NAMES } from './BotNames';
import { useGameAudio } from '@/hooks/useGameAudio';
import heroBgImage from '@/assets/hero-bg.jpg';
import { useIsMobile } from '@/hooks/use-mobile'; // Importando o hook

type Difficulty = 'easy' | 'medium' | 'hard';

interface DivideIoGameProps {
  difficulty: Difficulty;
  onGameOver: (score: number) => void;
  playerName: string;
}

// ... (restante do código)

const DivideIoGame: React.FC<DivideIoGameProps> = ({ difficulty, onGameOver, playerName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { highScore } = useDivideIoProgress();
  const animationFrameId = useRef<number>();
  const isMobile = useIsMobile(); // Usando o hook para detectar dispositivo
  
  const [isPlaying, setIsPlaying] = React.useState(true);
  const { playCollect, playSplit } = useGameAudio(isPlaying, 'divide-io'); // CORREÇÃO: Adiciona 'divide-io'
  
  const initialBotCount = difficultySettings[difficulty].botCount;
// ... (restante do código)