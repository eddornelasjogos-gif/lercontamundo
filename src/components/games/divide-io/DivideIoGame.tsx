"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import { useDivideIoProgress } from '@/hooks/useDivideIoProgress';
import VirtualJoystick from './VirtualJoystick';
import SplitButton from './SplitButton';
import Minimap from './Minimap';
import VictoryScreen from './VictoryScreen';
import { BOT_NAMES } from './BotNames';
import { useGameAudio } from '@/hooks/useGameAudio';
import heroBgImage from '@/assets/hero-bg.jpg';
import { useIsMobile } from '@/hooks/use-mobile';
import PauseMenu from './PauseMenu';
import { Button } from '@/components/ui/button';
import { Pause } from 'lucide-react';
import { saveGameState, loadGameState, clearGameState } from '@/utils/divide-io-storage'; // Importando utilitários

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

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Exportando classes para uso no utilitário de storage
export class Vector {
  constructor(public x: number, public y: number) {}

  add(v: Vector) {
    return new Vector(this.x + v.x, this.y + v.y);
  }

  subtract(v: Vector) {
    return new Vector(this.x - v.x, this.y - v.y);
  }

  multiply(scalar: number) {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const mag = this.magnitude();
    return mag > 0 ? new Vector(this.x / mag, this.y / mag) : new Vector(0, 0);
  }
}

// Ref para a direção de movimento (usada por Joystick, Mouse ou Teclado)
const movementDirectionRef: { current: { x: number; y: number } } = { current: { x: 0, y: 0 } };

export class Cell {
  public position: Vector;
  public mass: number;
  public radius: number;
  public velocity: Vector;
  public mergeCooldown = 0;
  public name: string;
  public id: number; 
  public isBot: boolean;

  constructor(x: number, y: number, public color: string, initialMass: number, name: string = 'Cell', id: number, isBot: boolean = false) {
    this.position = new Vector(x, y);
    this.mass = initialMass;
    this.radius = this.calculateRadius();
    this.velocity = new Vector(0, 0);
    this.name = name;
    this.id = id;
    this.isBot = isBot;
  }

  calculateRadius() {
    return Math.sqrt(this.mass / Math.PI) * MASS_TO_RADIUS_RATIO;
  }

  update() {
    if (this.mergeCooldown > 0) {
      this.mergeCooldown--;
    }
    this.velocity = this.velocity.multiply(0.92);
    this.position = this.position.add(this.velocity);
    
    const center = new Vector(WORLD_CENTER_X, WORLD_CENTER_Y);
    const distanceFromCenter = this.position.subtract(center).magnitude();
    if (distanceFromCenter + this.radius > WORLD_RADIUS) {
      const direction = this.position.subtract(center).normalize();
      this.position = center.add(direction.multiply(WORLD_RADIUS - this.radius));
    }
  }

  draw(ctx: CanvasRenderingContext2D, isPlayer: boolean = false) {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = Math.max(1, this.radius * 0.05);
    ctx.stroke();
    ctx.closePath();
    
    if (this.radius > 15) {
        ctx.fillStyle = isPlayer ? '#fff' : '#333';
        ctx.font = `${Math.max(12, this.radius / 3)}px Quicksand`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.name, this.position.x, this.position.y);
    }
  }
  
  split(directionVector: Vector, nextCellId: number): Cell | null {
    if (this.mass >= MIN_SPLIT_MASS) {
        const splitMass = this.mass / 2;
        this.mass = splitMass;
        this.radius = this.calculateRadius();
        this.mergeCooldown = MERGE_COOLDOWN_FRAMES;
        
        const direction = directionVector.magnitude() > 0.1
            ? directionVector.normalize()
            : this.velocity.magnitude() ><think>
I need to create a separate victory screen that appears when the player reaches 200k points, instead of showing the pause menu. The victory screen should have options to restart the game (resetting the score to zero) or return to the games menu.

Currently, when the score reaches 200k, the pause menu is shown. I need to modify the game loop to detect this condition and show the victory screen instead.

The victory screen should be a separate component that displays a congratulatory message and provides two buttons: one to restart the game (clearing the current game state and starting over with zero score) and one to return to the games menu.

In the game loop, when the score reaches 200k, I need to:
1. Pause the game
2. Show the victory screen
3. Clear the saved game state
4. Handle the two options:
   - Restart: clear state, reset score to 0, and continue playing
   - Menu: return to the games menu

The current `handleGameOver` function in Games.tsx needs to be updated to handle the victory case differently. When the score is >= 200000, it should return to the menu without showing the game over screen, but now we want a specific victory screen.

I need to modify the `onGameOver` callback to distinguish between different types of game ending:
- Normal game over (death): show game over screen
- Victory: show victory screen
- Restart: force remount with zero score
- Exit: return to menu

I'll update the `handleGameOver` function to accept a parameter indicating the type of game end.

For the victory screen, I'll create a new component `VictoryScreen` that shows the victory message and two buttons.

In the game loop, when score >= VICTORY_SCORE, I'll:
1. Set `showVictory` to true
2. Set `isPaused` to true
3. Call `clearGameState()`

The `VictoryScreen` component will receive handlers for restart and menu actions.

For restart: clear state, reset score to 0, and continue playing (call `onGameOver(-1)`)

For menu: clear state and return to menu (call `onGameOver(VICTORY_SCORE)`)

In Games.tsx, when `onGameOver` receives VICTORY_SCORE, it should return to menu without showing game over.

When it receives -1, it should force remount for restart.

When it receives a normal score (death), show game over.

I need to update the `handleGameOver` logic in Games.tsx accordingly.

Also, ensure that when victory happens, the leaderboard is updated with the victory score.

The victory screen should be shown instead of the pause menu when the victory condition is met.
</think>

<dyad-write path="src/components/games/divide-io/VictoryScreen.tsx">
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, Home, Crown } from 'lucide-react';
import { Mascot } from '@/components/Mascot';

interface VictoryScreenProps {
  onRestart: () => void;
  onMenu: () => void;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({ onRestart, onMenu }) => {
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

export default VictoryScreen;