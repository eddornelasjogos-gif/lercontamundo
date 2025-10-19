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
import { Vector } from './Vector';
import { Cell } from './Cell';
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
  const isMobile = useIsMobile();
  const { playCollect, playSplit } = useGameAudio(!isPaused && !showVictory);

  const settings = difficultySettings[difficulty];
  const botAggression = settings.botAggression;
  const botSplitChance = settings.botSplitChance;
  const maxBotCells = settings.botCount;

  // Reset game state function
  const resetGame = useCallback(() => {
    setScore(0);
    setPlayerCells([new Player(WORLD_CENTER_X, WORLD_CENTER_Y, MIN_CELL_MASS, playerName, 1)]);
    setBotCells([]);
    setPellets([]);
    setCamera({ x: WORLD_CENTER_X, y: WORLD_CENTER_Y, zoom: 1 });
    setNextCellId(1);
    setTotalBotCells(0);
    setGameStartTime(Date.now());
    clearGameState();
  }, [playerName]);

  // Load saved game state on mount
  useEffect(() => {
    const savedState = loadGameState();
    if (savedState) {
      setPlayerCells(savedState.playerCells.map((cell: any, index: number) => 
        new Player(cell.x, cell.y, cell.mass, cell.name, index + 1)
      ));
      setBotCells(savedState.botCells.map((cell: any, index: number) => 
        new Bot(cell.x, cell.y, cell.mass, cell.name, index + 1)
      ));
      setPellets(savedState.pellets.map((pellet: any) => 
        new Pellet(pellet.x, pellet.y, pellet.color)
      ));
      setCamera(savedState.camera);
      setScore(savedState.score);
      setNextCellId(Math.max(...savedState.playerCells.map((_: any, index: number) => index + 1), ...savedState.botCells.map((_: any, index: number) => index + 1)) + 1);
      setTotalBotCells(savedState.botCells.length);
    } else {
      // Initialize new game
      resetGame();
      generateInitialPellets();
    }
  }, [resetGame]);

  // Generate initial pellets
  const generateInitialPellets = useCallback(() => {
    const newPellets: Pellet[] = [];
    for (let i = 0; i < PELLET_COUNT; i++) {
      let x, y;
      do {
        x = Math.random() * WORLD_SIZE;
        y = Math.random() * WORLD_SIZE;
      } while (Math.sqrt((x - WORLD_CENTER_X) ** 2 + (y - WORLD_CENTER_Y) ** 2) > WORLD_RADIUS - 50);
      
      newPellets.push(new Pellet(x, y, getRandomColor()));
    }
    setPellets(newPellets);
  }, []);

  // Game loop
  useEffect(() => {
    if (isPaused || showVictory) return;

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
        bot.update(playerCells[0]?.position, playerCells[0]?.radius, botAggression);
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
      const newPlayerCells: Player[] = [];
      const newBotCells: Bot[] = [];
      const newPellets: Pellet[] = [];

      // Player eats pellets
      playerCells.forEach(player => {
        pellets.forEach((pellet, pelletIndex) => {
          const distance = player.position.subtract(new Vector(pellet.x, pellet.y)).magnitude();
          if (distance < player.radius + 3) {
            player.mass += 10;
            player.radius = player.calculateRadius();
            setScore(prev => prev + 10);
            playCollect();
          } else {
            newPellets.push(pellet);
          }
        });

        // Player eats bots
        botCells.forEach(bot => {
          const distance = player.position.subtract(bot.position).magnitude();
          if (distance < player.radius + bot.radius && player.mass > bot.mass * 1.1) {
            player.mass += bot.mass;
            player.radius = player.calculateRadius();
            setScore(prev => prev + bot.mass);
            playCollect();
          } else {
            newBotCells.push(bot);
          }
        });

        // Player splits
        if (player.mass >= MIN_SPLIT_MASS && player.mergeCooldown === 0) {
          const direction = new Vector(movementDirectionRef.current.x, movementDirectionRef.current.y);
          const splitCell = player.split(direction, nextCellId);
          if (splitCell) {
            setPlayerCells(prev => [...prev, splitCell as Player]);
            setNextCellId(prev => prev + 1);
            playSplit();
          }
        }

        // Player merges
        if (playerCells.length > 1 && player.mergeCooldown === 0) {
          const mergeTarget = playerCells.find(other => 
            player.position.subtract(other.position).magnitude() < player.radius + other.radius - 5 &&
            player.mass > other.mass * 1.1
          );
          if (mergeTarget) {
            player.mass += mergeTarget.mass;
            player.radius = player.calculateRadius();
            playerCells.splice(playerCells.indexOf(mergeTarget), 1);
            player.mergeCooldown = MERGE_COOLDOWN_FRAMES;
          }
        }

        newPlayerCells.push(player);
      });

      // Bots eat pellets
      botCells.forEach(bot => {
        pellets.forEach((pellet, pelletIndex) => {
          const distance = bot.position.subtract(new Vector(pellet.x, pellet.y)).magnitude();
          if (distance < bot.radius + 3) {
            bot.mass += 10;
            bot.radius = bot.calculateRadius();
          } else {
            newPellets.push(pellet);
          }
        });

        // Bots eat other bots
        botCells.forEach(otherBot => {
          if (bot.id !== otherBot.id) {
            const distance = bot.position.subtract(otherBot.position).magnitude();
            if (distance < bot.radius + otherBot.radius && bot.mass > otherBot.mass * 1.1) {
              bot.mass += otherBot.mass;
              bot.radius = bot.calculateRadius();
              // Remove the eaten bot
              const index = botCells.indexOf(otherBot);
              if (index > -1) {
                botCells.splice(index, 1);
              }
            }
          }
        });

        // Bots split
        if (bot.mass >= MIN_SPLIT_MASS && bot.mergeCooldown === 0 && Math.random() < botSplitChance) {
          const splitCell = bot.split(new Vector(Math.random() - 0.5, Math.random() - 0.5), nextCellId);
          if (splitCell) {
            setBotCells(prev => [...prev, splitCell as Bot]);
            setNextCellId(prev => prev + 1);
            setTotalBotCells(prev => prev + 1);
          }
        }

        // Bot merges
        if (botCells.length > 1 && bot.mergeCooldown === 0) {
          const mergeTarget = botCells.find(other => 
            bot.id !== other.id &&
            bot.position.subtract(other.position).magnitude() < bot.radius + other.radius - 5 &&
            bot.mass > other.mass * 1.1
          );
          if (mergeTarget) {
            bot.mass += mergeTarget.mass;
            bot.radius = bot.calculateRadius();
            const index = botCells.indexOf(mergeTarget);
            if (index > -1) {
              botCells.splice(index, 1);
            }
            bot.mergeCooldown = MERGE_COOLDOWN_FRAMES;
          }
        }

        // Remove bots if too many
        if (totalBotCells > maxBotCells) {
          const smallestBot = botCells.reduce((min, bot) => bot.mass < min.mass ? bot : min);
          const index = botCells.indexOf(smallestBot);
          if (index > -1) {
            botCells.splice(index, 1);
            setTotalBotCells(prev => prev - 1);
          }
        }

        newBotCells.push(bot);
      });

      setPlayerCells(newPlayerCells);
      setBotCells(newBotCells);
      setPellets(newPellets);
      setTotalBotCells(botCells.length);

      // Check victory condition
      if (score >= VICTORY_SCORE) {
        setIsPaused(true);
        setShowVictory(true);
        clearGameState(); // Limpa o estado temporário
        return;
      }

      // Check if player is dead (all player cells eaten)
      if (newPlayerCells.length === 0) {
        setIsPaused(true);
        onGameOver(score);
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
  }, [playerCells, botCells, pellets, score, nextCellId, totalBotCells, botAggression, botSplitChance, maxBotCells, isPaused, showVictory, onGameOver, playerName]);

  // Handle pause/unpause
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  // Handle restart from pause menu
  const handleRestart = () => {
    resetGame();
    setIsPaused(false);
    setShowVictory(false);
    // Não chama onGameOver, pois é reinício, não fim de jogo
  };

  // Handle exit from pause menu
  const handleExit = () => {
    onGameOver(score); // Chama com score atual para atualizar leaderboard
  };

  // Handle restart from victory screen
  const handleVictoryRestart = () => {
    resetGame();
    setShowVictory(false);
    setIsPaused(false);
    // Não chama onGameOver, pois é reinício
  };

  // Handle menu from victory screen
  const handleVictoryMenu = () => {
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