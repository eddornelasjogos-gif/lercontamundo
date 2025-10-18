import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, initializeGameState, updateGame, launchBubble, processCollision } from './GameEngine';
import { GameSettings, BUBBLE_COLORS, CANVAS_WIDTH, CANVAS_HEIGHT, BUBBLE_RADIUS, BUBBLE_DIAMETER, Bubble, Difficulty, GameMode } from './types';
import HUD from './HUD';
import BubbleLauncher from './BubbleLauncher';
import { useGameAudio } from '@/hooks/useGameAudio';
import { useMagicBubblesProgress } from '@/hooks/useMagicBubblesProgress';
import { toast } from 'sonner';

interface MagicBubblesGameProps {
  settings: GameSettings;
  onGameOver: (score: number) => void;
  onGameWon: (score: number) => void;
}

const FPS = 60;
const GAME_SPEED_MULTIPLIER = 0.01; // Ajuste para deltaTime

const MagicBubblesGame: React.FC<MagicBubblesGameProps> = ({ settings, onGameOver, onGameWon }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const lastTimeRef = useRef<number>(performance.now());
  const gameStateRef = useRef<GameState>(initializeGameState(settings));
  
  const [isSoundOn, setIsSoundOn] = useState(true);
  const { playPop, playShoot } = useGameAudio(true, 'magic-bubbles');
  const { updateHighScore, updateMaxLevel } = useMagicBubblesProgress();
  
  const [timeRemaining, setTimeRemaining] = useState(settings.timeLimitSeconds);
  const [isGameActive, setIsGameActive] = useState(true);

  // --- Game Loop Functions ---
  
  const handlePop = useCallback((count: number) => {
    if (isSoundOn) {
        playPop();
    }
    // Feedback visual de partículas (simulado)
    if (count > 3) {
        toast.info(`Combo! +${count * 10} pontos!`, { duration: 1500 });
    }
  }, [isSoundOn, playPop]);

  const handleLaunch = useCallback((angleRadians: number) => {
    if (!isGameActive || gameStateRef.current.shootingBubble) return;
    
    if (isSoundOn) {
        playShoot();
    }
    
    const speed = gameStateRef.current.settings.initialSpeed;
    gameStateRef.current = launchBubble(gameStateRef.current, angleRadians, speed);
  }, [isGameActive, isSoundOn, playShoot]);

  const drawBubble = (ctx: CanvasRenderingContext2D, bubble: Bubble) => {
    const colorHex = BUBBLE_COLORS[bubble.color];
    
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    
    // Gradiente para efeito 3D sutil
    const gradient = ctx.createRadialGradient(
        bubble.x - bubble.radius * 0.3, bubble.y - bubble.radius * 0.3, 0,
        bubble.x, bubble.y, bubble.radius
    );
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(0.8, colorHex);
    gradient.addColorStop(1, colorHex);
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
  };

  const drawGame = useCallback((ctx: CanvasRenderingContext2D) => {
    const { grid, shootingBubble } = gameStateRef.current;
    
    // Limpa o canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Desenha a linha de Game Over
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    const gameOverThreshold = CANVAS_HEIGHT - BUBBLE_DIAMETER * 2;
    ctx.beginPath();
    ctx.moveTo(0, gameOverThreshold);
    ctx.lineTo(CANVAS_WIDTH, gameOverThreshold);
    ctx.stroke();

    // Desenha todas as bolhas ativas (fixas e caindo)
    const allBubbles = gameStateRef.current.grid.flat().filter(b => b) as Bubble[];
    
    allBubbles.forEach(bubble => {
        if (bubble) drawBubble(ctx, bubble);
    });
    
    // Desenha bolha de tiro
    if (shootingBubble) {
        drawBubble(ctx, shootingBubble);
    }
    
    // Desenha o lançador (apenas um círculo de base)
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT, BUBBLE_RADIUS * 1.5, Math.PI, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fill();
    ctx.closePath();

  }, []);

  const gameLoop = useCallback((currentTime: number) => {
    if (!isGameActive) return;

    const deltaTime = (currentTime - lastTimeRef.current) * GAME_SPEED_MULTIPLIER;
    lastTimeRef.current = currentTime;

    // 1. Atualiza o estado do jogo (movimento, gravidade)
    gameStateRef.current = updateGame(gameStateRef.current, deltaTime);
    
    // 2. Verifica e processa colisões
    if (gameStateRef.current.shootingBubble) {
        gameStateRef.current = processCollision(gameStateRef.current, handlePop);
    }
    
    // 3. Verifica condições de fim de jogo
    if (gameStateRef.current.isGameOver) {
        setIsGameActive(false);
        onGameOver(gameStateRef.current.score);
        updateHighScore(settings.mode, settings.difficulty, gameStateRef.current.score);
        toast.error("Fim de Jogo! As bolhas caíram muito.");
        return;
    }
    
    if (gameStateRef.current.isGameWon) {
        setIsGameActive(false);
        onGameWon(gameStateRef.current.score);
        updateHighScore(settings.mode, settings.difficulty, gameStateRef.current.score);
        // Se for modo níveis, atualiza o nível máximo
        if (settings.mode === 'levels') {
            updateMaxLevel(settings.difficulty, settings.rows + 1); // Exemplo: próximo nível
        }
        toast.success("Vitória Mágica! Campo limpo!");
        return;
    }

    // 4. Desenha
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        drawGame(ctx);
    }

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [isGameActive, drawGame, handlePop, onGameOver, onGameWon, settings.mode, settings.difficulty, updateHighScore, updateMaxLevel]);

  // --- Efeitos ---

  // Inicialização do Canvas e Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    lastTimeRef.current = performance.now();
    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameLoop]);
  
  // Timer para Modo Tempo
  useEffect(() => {
    if (settings.mode !== 'time' || !isGameActive) return;
    
    const timer = setInterval(() => {
        setTimeRemaining(prev => {
            if (prev <= 1) {
                setIsGameActive(false);
                onGameOver(gameStateRef.current.score);
                updateHighScore(settings.mode, settings.difficulty, gameStateRef.current.score);
                toast.error("Tempo esgotado!");
                clearInterval(timer);
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [settings.mode, isGameActive, onGameOver, settings.difficulty, updateHighScore]);

  const currentScore = gameStateRef.current.score;
  const nextBubble = gameStateRef.current.nextBubble;

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-white/70 rounded-xl shadow-xl overflow-hidden border-4 border-primary/50">
      
      {/* HUD */}
      <HUD 
        score={currentScore} 
        timeRemaining={timeRemaining} 
        difficulty={settings.difficulty} 
        mode={settings.mode}
        isSoundOn={isSoundOn}
        onToggleSound={() => setIsSoundOn(prev => !prev)}
      />
      
      {/* Canvas do Jogo */}
      <div className="relative mx-auto mt-16" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
        <canvas ref={canvasRef} style={{ display: 'block' }} />
        
        {/* Lançador e Mira (Componente React sobre o Canvas) */}
        {isGameActive && nextBubble && (
            <BubbleLauncher nextBubble={nextBubble} onLaunch={handleLaunch} />
        )}
      </div>
      
      
      {/* Tela de Fim de Jogo (Placeholder) */}
      {!isGameActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-30">
            <div className="text-center p-8 bg-white rounded-xl shadow-2xl">
                <h2 className="text-4xl font-display font-bold text-primary mb-4">
                    {gameStateRef.current.isGameWon ? "Vitória!" : "Fim de Jogo"}
                </h2>
                <p className="text-xl font-body text-foreground">Pontuação Final: {currentScore}</p>
                <button 
                    onClick={() => window.location.reload()} // Simplificação: recarrega para voltar ao menu
                    className="mt-6 px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-colors"
                >
                    Voltar ao Menu
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default MagicBubblesGame;