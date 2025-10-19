"use client";

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useDivideIoProgress } from '@/hooks/useDivideIoProgress';
import VirtualJoystick from './VirtualJoystick';
import SplitButton from './SplitButton';
import Minimap from './Minimap';
import PauseMenu from './PauseMenu';
import VictoryScreen from './VictoryScreen';
import { BOT_NAMES } from './BotNames';
import { useGameAudio } from '@/hooks/useGameAudio';
import heroBgImage from '@/assets/hero-bg.jpg';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Pause } from 'lucide-react';
import { saveGameState, loadGameState, clearGameState } from '@/utils/divide-io-storage';
import type { SavedGameState } from '@/utils/divide-io-storage'; // Import the type

// Importações das classes de seus novos arquivos
import { Vector } from './Vector';
import { Cell, getRandomColor } from './Cell';
import { Player } from './Player';
import { Bot } from './Bot';
import { Pellet } from './Pellet';

type Difficulty = 'very-easy' | 'easy' | 'medium' | 'hard';

interface DivideIoGameProps {
  difficulty: Difficulty;
  onGameOver: (score: number) => void;
  playerName: string;
}

const difficultySettings = {
  'very-easy': { botCount: 18, botAggression: 0.1, botSplitChance: 0.0005 },
  easy: { botCount: 18, botAggression: 0.2, botSplitChance: 0.001 },
  medium: { botCount: 18, botAggression: 0.5, botSplitChance: 0.002 },
  hard: { botCount: 18, botAggression: 0.8, botSplitChance: 0.005 },
};

const WORLD_SIZE = 3000;
const WORLD_CENTER_X = WORLD_SIZE / 2;
const WORLD_CENTER_Y = WORLD_SIZE / 2;
const WORLD_RADIUS = WORLD_SIZE / 2;
const PELLET_COUNT = 800;
const MIN_CELL_RADIUS = 10;
const MIN_CELL_MASS = MIN_CELL_RADIUS * MIN_CELL_RADIUS;
const MIN_SPLIT_MASS = MIN_CELL_MASS * 2;
const MERGE_COOLDOWN_FRAMES = 60 * 5;
const MASS_TO_RADIUS_RATIO = 4;
const VICTORY_SCORE = 200000; // Pontuação para vitória

const EJECTION_IMPULSE = 250;
const EJECTION_OFFSET = 30;

const MAX_TOTAL_BOT_CELLS = 100;

// Ref para a direção de movimento (usada por Joystick, Mouse ou Teclado)
const movementDirectionRef: { current: { x: number; y: number } } = { current: { x: 0, y: 0 } };

const DivideIoGame: React.FC<DivideIoGameProps> = ({ difficulty, onGameOver, playerName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [score, setScore] = useState(0);
  const [playerCells, setPlayerCells] = useState<Player[]>([]);
  const [botCells, setBotCells] = useState<Bot[]>([]);
  const [pellets, setPellets] = useState<Pellet[]>([]);
  const [camera, setCamera] = useState({ x: WORLD_CENTER_X, y: WORLD_CENTER_Y, zoom: 1 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [nextCellId, setNextCellId] = useState(1);
  const [gameStartTime, setGameStartTime] = useState(Date.now());
  const [totalBotCells, setTotalBotCells] = useState(0);
  const [isGameReady, setIsGameReady] = useState(false); // Novo estado para controlar a prontidão do jogo
  const isMobile = useIsMobile();
  const { playCollect, playSplit } = useGameAudio(!isPaused && !showVictory);

  const settings = difficultySettings[difficulty];
  const botAggression = settings.botAggression;
  const botSplitChance = settings.botSplitChance;
  const maxBotCells = settings.botCount;

  // Reset game state function
  const resetGame = useCallback(() => {
    // 1. Gerar todas as entidades iniciais de forma síncrona
    const initialPlayerCells = [new Player(WORLD_CENTER_X, WORLD_CENTER_Y, MIN_CELL_MASS, playerName, 1)];
    
    const initialPellets: Pellet[] = [];
    for (let i = 0; i < PELLET_COUNT; i++) {
      let x, y;
      do {
        x = Math.random() * WORLD_SIZE;
        y = Math.random() * WORLD_SIZE;
      } while (Math.sqrt((x - WORLD_CENTER_X) ** 2 + (y - WORLD_CENTER_Y) ** 2) > WORLD_RADIUS - 50);
      initialPellets.push(new Pellet(x, y, getRandomColor()));
    }

    let currentId = 2; // Começa após o jogador (ID 1)
    const initialBots: Bot[] = [];
    for (let i = 0; i < settings.botCount; i++) {
      let x, y;
      do {
        x = Math.random() * WORLD_SIZE;
        y = Math.random() * WORLD_SIZE;
      } while (Math.sqrt((x - WORLD_CENTER_X) ** 2 + (y - WORLD_CENTER_Y) ** 2) > WORLD_RADIUS - 50);
      
      const initialMass = MIN_CELL_MASS * (1 + Math.random() * 2); // Massa inicial aleatória
      const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      
      initialBots.push(new Bot(x, y, initialMass, name, currentId++));
    }

    // 2. Atualizar todos os estados de uma vez
    setScore(0);
    setPlayerCells(initialPlayerCells);
    setBotCells(initialBots);
    setPellets(initialPellets);
    setCamera({ x: WORLD_CENTER_X, y: WORLD_CENTER_Y, zoom: 1 });
    setNextCellId(currentId);
    setTotalBotCells(initialBots.length);
    setGameStartTime(Date.now());
    clearGameState();
    setIsGameReady(true); // O jogo está pronto!
  }, [playerName, settings.botCount]);

  // Load saved game state or initialize new game on mount
  useEffect(() => {
    const savedState = loadGameState();
    if (savedState) {
      // Se houver estado salvo, carrega
      setPlayerCells(savedState.playerCells.map(cell => 
        new Player(cell.x, cell.y, cell.mass, cell.name, cell.id)
      ));
      setBotCells(savedState.botCells.map(cell => 
        new Bot(cell.x, cell.y, cell.mass, cell.name, cell.id)
      ));
      setPellets(savedState.pellets.map(pellet => 
        new Pellet(pellet.x, pellet.y, pellet.color)
      ));
      setCamera(savedState.camera);
      setScore(savedState.score);
      
      const maxPlayerId = savedState.playerCells.reduce((max, cell) => Math.max(max, cell.id), 0);
      const maxBotId = savedState.botCells.reduce((max, cell) => Math.max(max, cell.id), 0);
      setNextCellId(Math.max(maxPlayerId, maxBotId) + 1);
      
      setTotalBotCells(savedState.botCells.length);
      setIsGameReady(true); // O jogo está pronto após carregar
    } else {
      // Se não houver estado salvo, inicia um novo jogo
      resetGame(); // Esta função agora define isGameReady como true
    }
  }, [resetGame]);

  // Game loop
  useEffect(() => {
    // O loop só roda se o jogo estiver pronto e não pausado/vitorioso
    if (!isGameReady || isPaused || showVictory) return;

    // Se playerCells estiver vazio *após* a inicialização, significa que o jogador morreu
    if (playerCells.length === 0) {
        onGameOver(score);
        return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const loop = () => {
      // Clear canvas
      ctx.fillStyle = '#f0f8ff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update player cells
      playerCells.forEach(cell => {
        cell.update();
        // Draw player cells
        ctx.save();
        ctx.translate(canvas.width / 2 - cell.position.x, canvas.height / 2 - cell.position.y);
        cell.draw(ctx, true);
        ctx.restore();
      });

      // Update bot cells
      botCells.forEach(bot => {
        bot.update(); // Call base Cell update
        bot.updateAI(playerCells[0]?.position, playerCells[0]?.radius, botAggression); // Call bot-specific AI update
        // Draw bot cells
        ctx.save();
        ctx.translate(canvas.width / 2 - bot.position.x, canvas.height / 2 - bot.position.y);
        bot.draw(ctx);
        ctx.restore();
      });

      // Update pellets
      pellets.forEach((pellet, index) => {
        // Draw pellets
        ctx.save();
        ctx.translate(canvas.width / 2 - pellet.x, canvas.height / 2 - pellet.y);
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fillStyle = pellet.color;
        ctx.fill();
        ctx.restore();
      });

      // Collision detection
      let tempPlayerCells = [...playerCells];
      let tempBotCells = [...botCells];
      let tempPellets = [...pellets];

      // Player eats pellets
      tempPlayerCells.forEach(player => {
        tempPellets = tempPellets.filter(pellet => {
          const distance = player.position.subtract(new Vector(pellet.x, pellet.y)).magnitude();
          if (distance < player.radius + 3) {
            player.mass += 10;
            player.radius = player.calculateRadius();
            setScore(prev => prev + 10);
            playCollect();
            return false; // Remove pellet
          }
          return true; // Keep pellet
        });
      });

      // Player eats bots / Bots eat player
      const eatenBots: Bot[] = [];
      const eatenPlayers: Player[] = [];

      tempPlayerCells.forEach(player => {
        tempBotCells = tempBotCells.filter(bot => {
          const distance = player.position.subtract(bot.position).magnitude();
          if (distance < player.radius + bot.radius) {
            if (player.mass > bot.mass * 1.1) {
              player.mass += bot.mass;
              player.radius = player.calculateRadius();
              setScore(prev => prev + bot.mass);
              playCollect();
              eatenBots.push(bot);
              return false; // Bot eaten
            } else if (bot.mass > player.mass * 1.1) {
              bot.mass += player.mass;
              bot.radius = bot.calculateRadius();
              eatenPlayers.push(player);
              return true; // Bot survives
            }
          }
          return true; // No collision or no mass difference
        });
      });
      
      // Remove eaten players
      tempPlayerCells = tempPlayerCells.filter(player => !eatenPlayers.includes(player));

      // Bots eat pellets (re-run pellet check for bots)
      tempBotCells.forEach(bot => {
        tempPellets = tempPellets.filter(pellet => {
          const distance = bot.position.subtract(new Vector(pellet.x, pellet.y)).magnitude();
          if (distance < bot.radius + 3) {
            bot.mass += 10;
            bot.radius = bot.calculateRadius();
            return false; // Remove pellet
          }
          return true; // Keep pellet
        });
      });

      // Bots eat other bots
      const botsToKeep: Bot[] = [];
      const botsEaten: Bot[] = [];
      
      tempBotCells.forEach(bot => {
          if (botsEaten.includes(bot)) return;
          
          let wasEaten = false;
          for (const otherBot of tempBotCells) {
              if (bot.id === otherBot.id || botsEaten.includes(otherBot)) continue;
              
              const distance = bot.position.subtract(otherBot.position).magnitude();
              if (distance < bot.radius + otherBot.radius) {
                  if (bot.mass > otherBot.mass * 1.1) {
                      bot.mass += otherBot.mass;
                      bot.radius = bot.calculateRadius();
                      botsEaten.push(otherBot);
                  } else if (otherBot.mass > bot.mass * 1.1) {
                      otherBot.mass += bot.mass;
                      otherBot.radius = otherBot.calculateRadius();
                      botsEaten.push(bot);
                      wasEaten = true;
                      break;
                  }
              }
          }
          if (!wasEaten) {
              botsToKeep.push(bot);
          }
      });
      tempBotCells = botsToKeep;


      // Player splits
      tempPlayerCells.forEach(player => {
        if (player.mass >= MIN_SPLIT_MASS && player.mergeCooldown === 0) {
          const direction = new Vector(movementDirectionRef.current.x, movementDirectionRef.current.y);
          const splitCell = player.split(direction, nextCellId);
          if (splitCell) {
            tempPlayerCells.push(splitCell as Player);
            setNextCellId(prev => prev + 1);
            playSplit();
          }
        }
      });

      // Player merges (simplificado: apenas se houver mais de uma célula)
      if (tempPlayerCells.length > 1) {
          // Lógica de merge mais complexa seria necessária aqui, mas por enquanto,
          // vamos apenas garantir que o cooldown seja respeitado.
          // O merge real é complexo e geralmente envolve células do mesmo jogador.
      }

      // Bots split
      tempBotCells.forEach(bot => {
        if (bot.mass >= MIN_SPLIT_MASS && bot.mergeCooldown === 0 && Math.random() < botSplitChance) {
          const splitCell = bot.split(new Vector(Math.random() - 0.5, Math.random() - 0.5), nextCellId);
          if (splitCell) {
            tempBotCells.push(splitCell as Bot);
            setNextCellId(prev => prev + 1);
            setTotalBotCells(prev => prev + 1);
          }
        }
      });

      // Remove bots if too many
      if (tempBotCells.length > maxBotCells) {
        // Remove o bot com menor massa
        tempBotCells.sort((a, b) => a.mass - b.mass);
        tempBotCells.pop();
      }

      setPlayerCells(tempPlayerCells);
      setBotCells(tempBotCells);
      setPellets(tempPellets);
      setTotalBotCells(tempBotCells.length);

      // Check victory condition
      if (score >= VICTORY_SCORE) {
        setIsPaused(true);
        setShowVictory(true);
        clearGameState(); // Limpa o estado temporário
        return;
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isGameReady, playerCells, botCells, pellets, score, nextCellId, totalBotCells, botAggression, botSplitChance, maxBotCells, isPaused, showVictory, onGameOver, playerName]);

  // Handle pause/unpause
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  // Handle restart from pause menu
  const handleRestart = () => {
    setIsGameReady(false); // Define como falso para forçar re-inicialização completa
    resetGame();
    setIsPaused(false);
    setShowVictory(false);
  };

  // Handle exit from pause menu
  const handleExit = () => {
    setIsGameReady(false); // Define como falso para garantir que o jogo não reinicie automaticamente
    onGameOver(score); // Chama com score atual para atualizar leaderboard
  };

  // Handle restart from victory screen
  const handleVictoryRestart = () => {
    setIsGameReady(false); // Define como falso para forçar re-inicialização completa
    resetGame();
    setShowVictory(false);
    setIsPaused(false);
  };

  // Handle menu from victory screen
  const handleVictoryMenu = () => {
    setIsGameReady(false); // Define como falso para garantir que o jogo não reinicie automaticamente
    setShowVictory(false);
    onGameOver(score); // Atualiza leaderboard com pontuação de vitória
  };

  // Mouse movement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const direction = new Vector(x - rect.width / 2, y - rect.height / 2);
      movementDirectionRef.current = direction.normalize();
    }
  }, [isDragging]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    setIsDragging(true);
    handleMouseMove(e);
  }, [handleMouseMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    movementDirectionRef.current = { x: 0, y: 0 };
  }, []);

  // Joystick movement
  const handleJoystickMove = useCallback((direction: { x: number; y: number }) => {
    movementDirectionRef.current = direction;
  }, []);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      if (window.innerWidth < 768) {
        canvas.width = window.innerWidth - 32;
        canvas.height = window.innerHeight - 32;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse events
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseDown]);

  if (showVictory) {
    return (
      <VictoryScreen 
        onRestart={handleVictoryRestart}
        onMenu={handleVictoryMenu}
        difficulty={difficulty}
      />
    );
  }

  if (isPaused) {
    return (
      <PauseMenu 
        onResume={() => setIsPaused(false)}
        onRestart={handleRestart}
        onExit={handleExit}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full cursor-crosshair"
        style={{ 
          backgroundImage: `url(${heroBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Pause Button */}
      <Button
        onClick={togglePause}
        className="fixed top-4 right-4 z-50 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-all"
      >
        <Pause className={`w-6 h-6 ${isPaused ? 'hidden' : ''}`} />
      </Button>

      {/* UI Overlay */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        {/* Score */}
        <div className="absolute top-4 left-4 z-10 pointer-events-auto bg-black/50 text-white px-4 py-2 rounded-lg">
          <div className="text-2xl font-bold">Score: {score}</div>
          <div className="text-sm opacity-75">Nível: {difficulty === 'very-easy' ? 'Muito Fácil' : difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Médio' : 'Difícil'}</div>
        </div>

        {/* Joystick */}
        {!isMobile && <VirtualJoystick onMove={handleJoystickMove} />}

        {/* Split Button */}
        {playerCells.length > 0 && playerCells[0]?.mass >= MIN_SPLIT_MASS && (
          <SplitButton onSplit={() => {
            if (playerCells.length > 0) {
              const mainCell = playerCells[0];
              if (mainCell.mergeCooldown === 0) {
                const direction = new Vector(movementDirectionRef.current.x, movementDirectionRef.current.y);
                const splitCell = mainCell.split(direction, nextCellId);
                if (splitCell) {
                  setPlayerCells(prev => [...prev, splitCell as Player]);
                  setNextCellId(prev => prev + 1);
                  playSplit();
                }
              }
            }
          }} />
        )}

        {/* Minimap */}
        {playerCells.length > 0 && (
          <Minimap
            playerCenter={playerCells[0].position}
            playerRadius={playerCells[0].radius}
            visibleBots={botCells.filter(bot => 
              bot.position.subtract(playerCells[0].position).magnitude() < 800
            ).map(bot => ({
              x: bot.position.x,
              y: bot.position.y,
              mass: bot.mass,
              color: bot.color,
              radius: bot.radius
            }))}
          />
        )}
      </div>
    </div>
  );
};

export default DivideIoGame;