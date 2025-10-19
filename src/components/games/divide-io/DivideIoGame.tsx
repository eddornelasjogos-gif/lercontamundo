"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import { useDivideIoProgress } from '@/hooks/useDivideIoProgress';
import VirtualJoystick from './VirtualJoystick';
import SplitButton from './SplitButton';
import Minimap from './Minimap';
import { BOT_NAMES } from './BotNames';
import { useGameAudio } from '@/hooks/useGameAudio';
import heroBgImage from '@/assets/hero-bg.jpg';
import { useIsMobile } from '@/hooks/use-mobile'; // Importando o hook

type Difficulty = 'very-easy' | 'easy' | 'medium' | 'hard';

interface DivideIoGameProps {
  difficulty: Difficulty;
  onGameOver: (score: number) => void;
  playerName: string;
}

const difficultySettings = {
  'very-easy': { botCount: 18, botAggression: 0.1, botSplitChance: 0.0005 }, // UPDATED: Same bot count as easy
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

// Virus constants (stationary, consumed when eaten)
const VIRUS_RADIUS = 60; 
const VIRUS_MASS = VIRUS_RADIUS * VIRUS_RADIUS / MASS_TO_RADIUS_RATIO; 
const VIRUS_COUNT = 8;
const VIRUS_COLOR = '#FF4136';

// Distância mínima de segurança para o respawn do vírus
const MIN_VIRUS_RESPAWN_DISTANCE = VIRUS_RADIUS + 100; 

// Ajuste de Impulso para Divisão (REDUCED for slower gameplay)
const EJECTION_IMPULSE = 250; // REDUCED: from 400 to 250
const EJECTION_OFFSET = 30;

// Ejection speed for split cells from virus (REDUCED)
const VIRUS_SPLIT_EJECTION_SPEED = 150; // REDUCED: from 200 to 150

// Repulsion force for small cells (REDUCED)
const VIRUS_REPEL_FORCE = 200; // REDUCED: from 300 to 200

// Safety limit for total bot cells to prevent performance issues
const MAX_TOTAL_BOT_CELLS = 100;

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

class Vector {
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

class Cell {
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
    // Apply friction to slow down over time (INCREASED friction for slower gameplay)
    this.velocity = this.velocity.multiply(0.92); // INCREASED: from 0.95 to 0.92
    this.position = this.position.add(this.velocity);
    
    // UPDATED: Circular boundary clamping
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
    
    // Draw name
    if (this.radius > 15) {
        ctx.fillStyle = isPlayer ? '#fff' : '#333';
        ctx.font = `${Math.max(12, this.radius / 3)}px Quicksand`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.name, this.position.x, this.position.y);
    }
  }
  
  // Método split genérico usado por Bots
  split(directionVector: Vector, nextCellId: number): Cell | null {
    if (this.mass >= MIN_SPLIT_MASS) {
        const splitMass = this.mass / 2;
        this.mass = splitMass;
        this.radius = this.calculateRadius();
        this.mergeCooldown = MERGE_COOLDOWN_FRAMES;
        
        // Determine the direction for the impulse
        const direction = directionVector.magnitude() > 0.1
            ? directionVector.normalize()
            : this.velocity.magnitude() > 0.1 
                ? this.velocity.normalize() 
                : new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();

        // Calculate initial position offset to ensure separation
        const offsetDistance = this.radius + EJECTION_OFFSET; 
        const offset = direction.multiply(offsetDistance);

        const newCell = new Cell(
            this.position.x + offset.x, 
            this.position.y + offset.y, 
            this.color, 
            splitMass,
            this.name,
            nextCellId,
            this.isBot
        );
        
        // Apply a strong impulse to the new cell
        newCell.velocity = this.velocity.add(direction.multiply(EJECTION_IMPULSE));
        newCell.mergeCooldown = MERGE_COOLDOWN_FRAMES;
        
        // Apply a slight counter-impulse to the original cell
        this.velocity = this.velocity.add(direction.multiply(-EJECTION_IMPULSE * 0.1));

        // UPDATED: Ensure new cell is within circular bounds
        const center = new Vector(WORLD_CENTER_X, WORLD_CENTER_Y);
        const distanceFromCenter = newCell.position.subtract(center).magnitude();
        if (distanceFromCenter + newCell.radius > WORLD_RADIUS) {
          const directionToCenter = newCell.position.subtract(center).normalize();
          newCell.position = center.add(directionToCenter.multiply(WORLD_RADIUS - newCell.radius));
        }

        return newCell;
    }
    return null;
  }
}

let nextCellId = 1;
const getNextCellId = () => nextCellId++;

class Player extends Cell {
    constructor(x: number, y: number, color: string, initialMass: number, name: string) {
        super(x, y, color, initialMass, name, getNextCellId(), false);
    }
    
    split(): Player | null {
        if (this.mass < MIN_SPLIT_MASS) {
            return null;
        }
        
        const splitMass = this.mass / 2;
        this.mass = splitMass;
        this.radius = this.calculateRadius();
        this.mergeCooldown = MERGE_COOLDOWN_FRAMES;
        
        const directionVec = new Vector(movementDirectionRef.current.x, movementDirectionRef.current.y);
        
        // Determine the direction for the impulse
        const direction = directionVec.magnitude() > 0.1
            ? directionVec.normalize()
            : this.velocity.magnitude() > 0.1 
                ? this.velocity.normalize() 
                : new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();

        // Calculate initial position offset to ensure separation
        const offsetDistance = this.radius + EJECTION_OFFSET; 
        const offset = direction.multiply(offsetDistance);

        // Cria uma nova instância de Player
        const newCell = new Player(
            this.position.x + offset.x, 
            this.position.y + offset.y, 
            this.color, 
            splitMass,
            this.name
        );
        
        // Aplica impulso e cooldown
        newCell.velocity = this.velocity.add(direction.multiply(EJECTION_IMPULSE));
        newCell.mergeCooldown = MERGE_COOLDOWN_FRAMES;
        
        // Aplica contra-impulso na célula original
        this.velocity = this.velocity.add(direction.multiply(-EJECTION_IMPULSE * 0.1));

        // UPDATED: Ensure new cell is within circular bounds
        const center = new Vector(WORLD_CENTER_X, WORLD_CENTER_Y);
        const distanceFromCenter = newCell.position.subtract(center).magnitude();
        if (distanceFromCenter + newCell.radius > WORLD_RADIUS) {
          const directionToCenter = newCell.position.subtract(center).normalize();
          newCell.position = center.add(directionToCenter.multiply(WORLD_RADIUS - newCell.radius));
        }

        return newCell;
    }
}

// Virus class (stationary, consumed when eaten)
class Virus {
  public position: Vector;
  public radius: number;
  public mass: number;
  public color: string;
  public id: number;

  constructor(x: number, y: number, id: number) {
    this.position = new Vector(x, y);
    this.radius = VIRUS_RADIUS;
    this.mass = VIRUS_MASS;
    this.color = VIRUS_COLOR;
    this.id = id;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const numSpikes = 20;
    const innerRadius = this.radius * 0.8;
    const outerRadius = this.radius * 1.1;
    
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    
    ctx.beginPath();
    
    for (let i = 0; i < numSpikes * 2; i++) {
        const angle = (i * Math.PI) / numSpikes;
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.closePath();
    
    // Preenchimento
    ctx.fillStyle = this.color;
    ctx.fill();
    
    // Borda
    ctx.strokeStyle = '#A00000'; 
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.restore();
  }
}

// Lógica de Bot
const botLogic = {
    target: new Map<string, Vector | null>(),
    threat: new Map<string, Vector | null>(),
    explorationTarget: new Map<string, Vector | null>(),
    decisionTimer: new Map<string, number>(),
    
    findBestTarget(botCells: Cell[], pellets: Pellet[], otherCells: Cell[], aggression: number, botName: string) {
        const totalMass = botCells.reduce((sum, c) => sum + c.mass, 0);
        // FIX: Usar 'botCells' em vez de 'cells'
        const avgRadius = botCells.reduce((sum, c) => sum + c.radius, 0) / botCells.length; 
        const center = botCells.reduce((sum, c) => sum.add(c.position.multiply(c.mass)), new Vector(0, 0)).multiply(1 / totalMass);

        let bestTarget: Pellet | Cell | null = null;
        let minTargetDist = Infinity;
        let closestThreat: Cell | null = null;
        let minThreatDist = Infinity;

        const perceptionRadius = avgRadius * 15; 

        for (const cell of otherCells) {
            if (cell.name === botName) continue;
            const dist = center.subtract(cell.position).magnitude();
            if (dist > perceptionRadius) continue;

            if (cell.mass > totalMass * 1.15) {
                if (dist < minThreatDist) {
                    minThreatDist = dist;
                    closestThreat = cell;
                }
            } else if (totalMass > cell.mass * 1.15) {
                if (dist < minTargetDist && Math.random() < aggression) {
                    minTargetDist = dist;
                    bestTarget = cell;
                }
            }
        }

        if (closestThreat && minThreatDist < avgRadius * 5) {
            this.threat.set(botName, closestThreat.position);
            this.target.set(botName, null);
            this.explorationTarget.set(botName, null);
            return;
        }

        if (!bestTarget) {
            // Otimização: Apenas procura por pellets se não houver células alvo/ameaça próximas
            for (const pellet of pellets) {
                const dist = center.subtract(pellet.position).magnitude();
                if (dist < minTargetDist) {
                    minTargetDist = dist;
                    bestTarget = pellet;
                }
            }
        }
        
        this.threat.set(botName, null);
        this.target.set(botName, bestTarget ? bestTarget.position : null);
        
        if (!bestTarget) {
            let currentExplorationTarget = this.explorationTarget.get(botName);
            
            if (!currentExplorationTarget || center.subtract(currentExplorationTarget).magnitude() < WORLD_RADIUS * 0.1) {
                // UPDATED: Spawn within circular bounds
                let angle = Math.random() * Math.PI * 2;
                let distance = Math.random() * (WORLD_RADIUS * 0.8) + WORLD_RADIUS * 0.1;
                let newTarget = new Vector(
                    WORLD_CENTER_X + Math.cos(angle) * distance,
                    WORLD_CENTER_Y + Math.sin(angle) * distance
                );
                this.explorationTarget.set(botName, newTarget);
            }
        } else {
            this.explorationTarget.set(botName, null);
        }
    },
    
    getMovementDirection(botName: string, center: Vector): Vector {
        const threat = this.threat.get(botName);
        const target = this.target.get(botName);
        const explorationTarget = this.explorationTarget.get(botName);
        
        if (threat) {
            return center.subtract(threat).normalize();
        } else if (target) {
            return target.subtract(center).normalize();
        } else if (explorationTarget) {
            return explorationTarget.subtract(center).normalize();
        }
        
        return new Vector(0, 0);
    }
};


class Pellet {
  public position: Vector;
  public radius = 3;
  constructor(public color: string) {
    // UPDATED: Spawn within circular bounds
    let angle = Math.random() * Math.PI * 2;
    let distance = Math.random() * (WORLD_RADIUS * 0.8) + WORLD_RADIUS * 0.1;
    this.position = new Vector(
      WORLD_CENTER_X + Math.cos(angle) * distance,
      WORLD_CENTER_Y + Math.sin(angle) * distance
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

const PELLET_MASS_VALUE = 10;

const generatePelletsFromMass = (mass: number, position: Vector) => {
    const pellets: Pellet[] = [];
    const pelletCount = Math.floor(mass / PELLET_MASS_VALUE);
    
    for (let i = 0; i < pelletCount; i++) {
        const pellet = new Pellet(getRandomColor());
        
        const angle = Math.random() * Math.PI * 2;
        const explosionRadius = Math.sqrt(mass / Math.PI) * MASS_TO_RADIUS_RATIO;
        const distance = Math.random() * explosionRadius * 1.5; 
        
        pellet.position = position.add(new Vector(Math.cos(angle) * distance, Math.sin(angle) * distance));
        
        // UPDATED: Circular boundary clamping for pellets
        const center = new Vector(WORLD_CENTER_X, WORLD_CENTER_Y);
        const distanceFromCenter = pellet.position.subtract(center).magnitude();
        if (distanceFromCenter + pellet.radius > WORLD_RADIUS) {
          const direction = pellet.position.subtract(center).normalize();
          pellet.position = center.add(direction.multiply(WORLD_RADIUS - pellet.radius));
        }
        
        pellets.push(pellet);
    }
    return pellets;
};


// Função auxiliar para gerar nomes de bot
const generateBotNames = (count: number) => {
    const baseNames = [...BOT_NAMES];
    const shuffleArray = (array: string[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };
    shuffleArray(baseNames);

    const uniqueBotNames: string[] = [];
    
    for (let i = 0; i < count; i++) {
        const baseName = baseNames[i % baseNames.length];
        
        if (i >= baseNames.length) {
            const secondaryIndex = Math.floor(i / baseNames.length) - 1;
            const secondaryName = baseNames[secondaryIndex % baseNames.length];
            
            const combinationIndex = i % baseNames.length;
            const combinedName = `${baseNames[combinationIndex]} ${secondaryName}`;
            
            let finalName = combinedName;
            let suffix = 0;
            while (uniqueBotNames.includes(finalName)) {
                suffix++;
                finalName = `${combinedName} ${String.fromCharCode(65 + suffix)}`; 
            }
            uniqueBotNames.push(finalName);
        } else {
            uniqueBotNames.push(baseName);
        }
    }
    return uniqueBotNames.slice(0, count);
};

// Função para encontrar uma posição segura para o vírus
const findSafeVirusPosition = (allCells: Cell[], viruses: Virus[]): Vector => {
    let safePosition: Vector | null = null;
    let attempts = 0;
    const maxAttempts = 50;

    while (safePosition === null && attempts < maxAttempts) {
        attempts++;
        
        // UPDATED: Spawn within circular bounds
        let angle = Math.random() * Math.PI * 2;
        let distance = Math.random() * (WORLD_RADIUS * 0.8) + WORLD_RADIUS * 0.1;
        const potentialPosition = new Vector(
          WORLD_CENTER_X + Math.cos(angle) * distance,
          WORLD_CENTER_Y + Math.sin(angle) * distance
        );
        
        let isSafe = true;

        for (const cell of allCells) {
            const distance = potentialPosition.subtract(cell.position).magnitude();
            if (distance < cell.radius + VIRUS_RADIUS + MIN_VIRUS_RESPAWN_DISTANCE) {
                isSafe = false;
                break;
            }
        }
        
        if (isSafe) {
            for (const virus of viruses) {
                const distance = potentialPosition.subtract(virus.position).magnitude();
                if (distance < VIRUS_RADIUS * 2.5) {
                    isSafe = false;
                    break;
                }
            }
        }

        if (isSafe) {
            safePosition = potentialPosition;
        }
    }

    if (safePosition === null) {
        console.warn("Failed to find a safe virus spawn position, using random fallback.");
        // UPDATED: Fallback within circular bounds
        let angle = Math.random() * Math.PI * 2;
        let distance = Math.random() * (WORLD_RADIUS * 0.8) + WORLD_RADIUS * 0.1;
        return new Vector(
            WORLD_CENTER_X + Math.cos(angle) * distance,
            WORLD_CENTER_Y + Math.sin(angle) * distance
        );
    }
    
    return safePosition;
};


const DivideIoGame: React.FC<DivideIoGameProps> = ({ difficulty, onGameOver, playerName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { highScore } = useDivideIoProgress();
  const animationFrameId = useRef<number>();
  const isMobile = useIsMobile(); // Usando o hook para detectar dispositivo
  
  const [isPlaying, setIsPlaying] = React.useState(true);
  const { playCollect, playSplit } = useGameAudio(isPlaying); 
  
  const initialBotCount = difficultySettings[difficulty].botCount;
  const botNamesRef = useRef<string[]>([]);
  
  const bgImgRef = useRef<HTMLImageElement | null>(null);

  const [minimapData, setMinimapData] = React.useState({
    playerCenter: { x: WORLD_CENTER_X, y: WORLD_CENTER_Y },
    playerRadius: MIN_CELL_RADIUS, 
    visibleBots: [] as Array<{ x: number; y: number; mass: number; color: string; radius: number }>,
  });

  const gameInstance = useRef({
    playerCells: [] as Player[],
    botCells: [] as Cell[], 
    pellets: [] as Pellet[],
    viruses: [] as Virus[],
    // Definimos o zoom inicial como 1 (sem zoom) e ele será ajustado no useEffect
    camera: { x: WORLD_CENTER_X, y: WORLD_CENTER_Y, zoom: 1 }, 
    score: 0,
    maxScore: 0, 
    mousePosition: new Vector(0, 0), // Posição do mouse na tela
  }).current;
  
  // NEW REFS FOR KEYBOARD CONTROL
  const keyboardDirectionRef = useRef({ x: 0, y: 0 });
  const isKeyboardActiveRef = useRef(false);

  // --- Handlers de Movimento ---
  
  // Usado pelo VirtualJoystick (Mobile)
  const handleJoystickMove = useCallback((direction: { x: number; y: number }) => {
    movementDirectionRef.current = direction;
    isKeyboardActiveRef.current = false; // Joystick takes precedence over keyboard/mouse state
  }, []);
  
  // Usado pelo Mouse (Desktop)
  const handleMouseMove = useCallback((event: MouseEvent) => {
    // Se o teclado estiver ativo, ignoramos o mouse para movimento
    if (!canvasRef.current || isKeyboardActiveRef.current) return; 
    
    // Armazena a posição do mouse na tela
    gameInstance.mousePosition.x = event.clientX;
    gameInstance.mousePosition.y = event.clientY;
    
    // A direção é do centro da tela para o mouse
    const canvas = canvasRef.current;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    
    // Define a direção normalizada (ou zero se estiver muito perto do centro)
    if (magnitude > 10) { // Dead zone de 10px
        movementDirectionRef.current = { x: dx / magnitude, y: dy / magnitude };
    } else {
        movementDirectionRef.current = { x: 0, y: 0 };
    }
  }, [gameInstance]);
  
  // --- Handler de Divisão ---

  const handleSplit = useCallback(() => {
    const newCells: Player[] = [];
    const cellsToSplit = [...gameInstance.playerCells]; 
    
    cellsToSplit.forEach(cell => {
      if (gameInstance.playerCells.includes(cell)) {
        const newCell = cell.split(); 
        if (newCell) {
          newCells.push(newCell);
          playSplit();
        }
      }
    });
    
    gameInstance.playerCells.push(...newCells);
  }, [gameInstance, playSplit]);

  // Efeito para escutar a tecla Espaço (PC) e o movimento do mouse/teclado
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isPlaying && event.code === 'Space') {
        event.preventDefault();
        handleSplit();
      }
      
      if (isMobile) return; // Keyboard movement only for desktop

      let x = keyboardDirectionRef.current.x;
      let y = keyboardDirectionRef.current.y;
      let changed = false;

      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (y !== -1) { y = -1; changed = true; }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (y !== 1) { y = 1; changed = true; }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (x !== -1) { x = -1; changed = true; }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (x !== 1) { x = 1; changed = true; }
          break;
      }
      
      if (changed) {
          keyboardDirectionRef.current = { x, y };
          
          // Normalize the combined keyboard vector (e.g., diagonal movement)
          const magnitude = Math.sqrt(x * x + y * y);
          if (magnitude > 0) {
              movementDirectionRef.current = { x: x / magnitude, y: y / magnitude };
              isKeyboardActiveRef.current = true;
          } else {
              // Should only happen if keys cancel each other out (e.g., pressing up and down simultaneously)
              movementDirectionRef.current = { x: 0, y: 0 };
              isKeyboardActiveRef.current = false;
          }
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
        if (isMobile) return; // Keyboard movement only for desktop

        let x = keyboardDirectionRef.current.x;
        let y = keyboardDirectionRef.current.y;
        let changed = false;

        switch (event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (y === -1) { y = 0; changed = true; }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (y === 1) { y = 0; changed = true; }
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (x === -1) { x = 0; changed = true; }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (x === 1) { x = 0; changed = true; }
                break;
        }
        
        if (changed) {
            keyboardDirectionRef.current = { x, y };
            
            const magnitude = Math.sqrt(x * x + y * y);
            if (magnitude > 0) {
                // If other keys are still pressed (e.g., released 'left' but still holding 'up')
                movementDirectionRef.current = { x: x / magnitude, y: y / magnitude };
                isKeyboardActiveRef.current = true;
            } else {
                // Keyboard input stopped. Reset movement direction and flag.
                movementDirectionRef.current = { x: 0, y: 0 };
                isKeyboardActiveRef.current = false;
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    if (!isMobile) {
        // Adiciona listener de mouse APENAS no desktop
        window.addEventListener('mousemove', handleMouseMove);
    } else {
        // Garante que o movimento do mouse seja resetado se for mobile
        movementDirectionRef.current = { x: 0, y: 0 };
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isPlaying, handleSplit, isMobile, handleMouseMove]);

  // Variável para armazenar o zoom fixo calculado
  const fixedZoomRef = useRef<number>(1);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
        animationFrameId.current = requestAnimationFrame(gameLoop);
        return;
    }

    const { playerCells, botCells, pellets, viruses, camera } = gameInstance;
    
    if (playerCells.length === 0) {
      setIsPlaying(false);
      onGameOver(gameInstance.maxScore);
      animationFrameId.current = requestAnimationFrame(gameLoop); // Continue loop even if game over
      return;
    }

    try {
        let allCells: Cell[] = [...playerCells, ...botCells];

        const settings = difficultySettings[difficulty];

        // --- 1. Lógica do Jogador ---
        const playerDirection = new Vector(movementDirectionRef.current.x, movementDirectionRef.current.y);
        
        const totalPlayerMass = playerCells.reduce((sum, cell) => sum + cell.mass, 0);
        const playerCenterOfMass = playerCells.reduce((sum, c) => sum.add(c.position.multiply(c.mass)), new Vector(0, 0)).multiply(1 / totalPlayerMass);
        const avgPlayerRadius = playerCells.reduce((sum, cell) => sum + cell.radius, 0) / playerCells.length;

        playerCells.forEach(playerCell => {
            // 1a. Movimento do Jogador (Input) (REDUCED acceleration for slower gameplay)
            const acceleration = 0.3; // REDUCED: from 0.5 to 0.3
            const force = playerDirection.multiply(acceleration);
            playerCell.velocity = playerCell.velocity.add(force);

            const maxSpeed = 50 / (playerCell.radius * 0.1 + 10); 
            if (playerCell.velocity.magnitude() > maxSpeed) {
                playerCell.velocity = playerCell.velocity.normalize().multiply(maxSpeed);
            }
            
            // 1b. Força de Atração (para fusão automática)
            if (playerCells.length > 1) {
                const attractionVector = playerCenterOfMass.subtract(playerCell.position).normalize();
                
                const mergeProgress = 1 - (playerCell.mergeCooldown / MERGE_COOLDOWN_FRAMES);
                const attractionFactor = Math.max(0, mergeProgress);
                
                const attractionForce = 0.5 * (avgPlayerRadius / playerCell.radius) * attractionFactor; 
                playerCell.velocity = playerCell.velocity.add(attractionVector.multiply(attractionForce));
            }
        });

        // --- 2. Lógica dos Bots ---
        
        const botGroups = new Map<string, Cell[]>();
        botCells.forEach(cell => {
            if (!botGroups.has(cell.name)) {
                botGroups.set(cell.name, []);
            }
            botGroups.get(cell.name)!.push(cell);
        });
        
        const newBotCells: Cell[] = [];

        botGroups.forEach((cells, botName) => {
            const totalMass = cells.reduce((sum, c) => sum + c.mass, 0);
            const avgRadius = cells.reduce((sum, c) => sum + c.radius, 0) / cells.length;
            // FIXED: Calculate centerOfMass for this specific bot group
            const centerOfMass = cells.reduce((sum, c) => sum.add(c.position.multiply(c.mass)), new Vector(0, 0)).multiply(1 / totalMass);
            
            let decisionTimer = botLogic.decisionTimer.get(botName) || 0;
            if (decisionTimer <= 0) {
                // Passa apenas os pellets visíveis para a lógica do bot para otimizar
                const visiblePellets = pellets.filter(p => {
                    const dist = centerOfMass.subtract(p.position).magnitude();
                    return dist < avgRadius * 15; // Percepção do bot
                });
                botLogic.findBestTarget(cells, visiblePellets, allCells.filter(c => c.name !== botName), settings.botAggression, botName);
                decisionTimer = 30;
            }
            botLogic.decisionTimer.set(botName, decisionTimer - 1);

            const targetDirection = botLogic.getMovementDirection(botName, centerOfMass);
            
            cells.forEach(cell => {
                // 2a. Movimento Coordenado (REDUCED acceleration for slower gameplay)
                const acceleration = 0.3; // REDUCED: from 0.5 to 0.3
                const force = targetDirection.multiply(acceleration);
                cell.velocity = cell.velocity.add(force);
                
                const maxSpeed = 50 / (cell.radius * 0.1 + 10); 
                if (cell.velocity.magnitude() > maxSpeed) {
                    cell.velocity = cell.velocity.normalize().multiply(maxSpeed);
                }
                
                // 2b. Força de Atração (para fusão)
                if (cells.length > 1) {
                    const attractionVector = centerOfMass.subtract(cell.position).normalize();
                    
                    const mergeProgress = 1 - (cell.mergeCooldown / MERGE_COOLDOWN_FRAMES);
                    const attractionFactor = Math.max(0, mergeProgress); 
                    
                    const attractionForce = 0.5 * (avgRadius / cell.radius) * attractionFactor; 
                    cell.velocity = cell.velocity.add(attractionVector.multiply(attractionForce));
                }
                
                // 2c. Lógica de Divisão
                if (totalMass > MIN_SPLIT_MASS * 2 && cells.length === 1 && Math.random() < settings.botSplitChance) {
                    const newCell = cell.split(targetDirection, getNextCellId());
                    if (newCell) {
                        newBotCells.push(newCell);
                    }
                }
                
                cell.update();
            });
            
            // 2d. Fusão de Células de Bot
            for (let i = cells.length - 1; i >= 0; i--) {
                for (let j = i - 1; j >= 0; j--) {
                    const cellA = cells[i];
                    const cellB = cells[j];
                    
                    if (cellA.mergeCooldown <= 0 && cellB.mergeCooldown <= 0) {
                        const dist = cellA.position.subtract(cellB.position).magnitude();
                        if (dist < cellA.radius + cellB.radius) { 
                            const bigger = cellA.mass > cellB.mass ? cellA : cellB;
                            const smaller = cellA.mass > cellB.mass ? cellB : cellA;
                            
                            bigger.mass += smaller.mass;
                            bigger.radius = bigger.calculateRadius();
                            
                            const smallerIndex = botCells.indexOf(smaller);
                            if (smallerIndex > -1) {
                                botCells.splice(smallerIndex, 1);
                                cells.splice(cells.indexOf(smaller), 1);
                                if (smallerIndex <= i) i--;
                                if (smallerIndex <= j) j--;
                            }
                        }
                    }
                }
            }
        });
        
        gameInstance.botCells.push(...newBotCells);
        
        // --- 3. Atualização e Fusão do Jogador ---
        playerCells.forEach(cell => cell.update());

        for (let i = playerCells.length - 1; i >= 0; i--) {
          for (let j = i - 1; j >= 0; j--) {
            const cellA = playerCells[i];
            const cellB = playerCells[j];
            
            if (cellA.mergeCooldown <= 0 && cellB.mergeCooldown <= 0) {
              const dist = cellA.position.subtract(cellB.position).magnitude();
              if (dist < cellA.radius + cellB.radius) { 
                const bigger = cellA.mass > cellB.mass ? cellA : cellB;
                const smaller = cellA.mass > cellB.mass ? cellB : cellA;
                bigger.mass += smaller.mass;
                bigger.radius = bigger.calculateRadius();
                
                const smallerIndex = playerCells.indexOf(smaller);
                if (smallerIndex > -1) {
                    playerCells.splice(smallerIndex, 1);
                    if (smallerIndex <= i) i--;
                    if (smallerIndex <= j) j--;
                }
              }
            }
          }
        }

        allCells = [...playerCells, ...botCells];

        // --- 4. Detecção de Colisão com Vírus (UPDATED: Size-based logic) ---
        
        for (let v = viruses.length - 1; v >= 0; v--) {
            const virus = viruses[v];
            
            for (let c = allCells.length - 1; c >= 0; c--) {
                const cell = allCells[c];
                
                const distVec = cell.position.subtract(virus.position);
                const distance = distVec.magnitude();
                
                if (distance < cell.radius + virus.radius) {
                    if (cell.mass > virus.mass) {
                        // UPDATED: Only split if cell is larger than virus
                        // Virus is consumed and removed
                        viruses.splice(v, 1);
                        
                        // Split the cell into 4 smaller cells
                        const splitMass = cell.mass / 4;
                        const awayDirection = distVec.normalize(); // Direction away from virus center
                        
                        for (let k = 0; k < 4; k++) {
                            const angle = (k * Math.PI / 2); // 0°, 90°, 180°, 270°
                            const perpendicular = new Vector(
                                Math.cos(angle) * 50,
                                Math.sin(angle) * 50
                            );
                            
                            // Position the new cells around the virus position
                            const offsetX = Math.cos(angle) * 50;
                            const offsetY = Math.sin(angle) * 50;
                            const newPosition = virus.position.add(new Vector(offsetX, offsetY));
                            
                            // UPDATED: Ensure boundary clamping for new cells (circular)
                            const center = new Vector(WORLD_CENTER_X, WORLD_CENTER_Y);
                            let distanceFromCenter = newPosition.subtract(center).magnitude();
                            if (distanceFromCenter + splitMass / MASS_TO_RADIUS_RATIO > WORLD_RADIUS) {
                              const directionToCenter = newPosition.subtract(center).normalize();
                              newPosition.x = center.x + directionToCenter.x * (WORLD_RADIUS - splitMass / MASS_TO_RADIUS_RATIO);
                              newPosition.y = center.y + directionToCenter.y * (WORLD_RADIUS - splitMass / MASS_TO_RADIUS_RATIO);
                            }
                            
                            let newCell: Cell;
                            if (cell instanceof Player) {
                                newCell = new Player(
                                    newPosition.x,
                                    newPosition.y,
                                    cell.color,
                                    splitMass,
                                    cell.name
                                );
                                // Add to player cells
                                gameInstance.playerCells.push(newCell as Player);
                            } else {
                                newCell = new Cell(
                                    newPosition.x,
                                    newPosition.y,
                                    cell.color,
                                    splitMass,
                                    cell.name,
                                    getNextCellId(),
                                    cell.isBot
                                );
                                // Add to bot cells
                                gameInstance.botCells.push(newCell);
                            }
                            
                            // Apply ejection velocity away from virus
                            const ejectionDir = awayDirection.multiply(VIRUS_SPLIT_EJECTION_SPEED);
                            newCell.velocity = new Vector(
                                ejectionDir.x + perpendicular.x,
                                ejectionDir.y + perpendicular.y
                            );
                            newCell.mergeCooldown = MERGE_COOLDOWN_FRAMES;
                        }
                        
                        // Remove the original cell
                        const cellIndexInPlayer = playerCells.indexOf(cell as Player);
                        if (cellIndexInPlayer > -1) {
                            playerCells.splice(cellIndexInPlayer, 1);
                        } else {
                            const cellIndexInBots = botCells.indexOf(cell);
                            if (cellIndexInBots > -1) {
                                botCells.splice(cellIndexInBots, 1);
                                botNamesRef.current.push(cell.name);
                            }
                        }
                        
                        // Check if player has no cells left
                        if (playerCells.length === 0) {
                            setIsPlaying(false);
                            onGameOver(gameInstance.maxScore); 
                            break; // Exit inner loop
                        }
                        
                        break; // Only one split per virus per frame
                    } else {
                        // UPDATED: For smaller cells, hide behind the virus (opposite side from approach)
                        // distVec = cell.position - virus.position (direction from virus to cell)
                        const approachDirection = distVec.normalize(); // Direction from virus to cell (approach direction)
                        const behindDirection = approachDirection.multiply(-1); // Opposite direction (behind the virus)
                        
                        const bufferDistance = virus.radius + cell.radius + 10; // Small buffer to avoid overlap
                        const behindPosition = virus.position.add(behindDirection.multiply(bufferDistance));
                        
                        // UPDATED: Ensure the position is within circular bounds
                        const center = new Vector(WORLD_CENTER_X, WORLD_CENTER_Y);
                        const distanceFromCenter = behindPosition.subtract(center).magnitude();
                        if (distanceFromCenter + cell.radius > WORLD_RADIUS) {
                          const directionToCenter = behindPosition.subtract(center).normalize();
                          behindPosition.x = center.x + directionToCenter.x * (WORLD_RADIUS - cell.radius);
                          behindPosition.y = center.y + directionToCenter.y * (WORLD_RADIUS - cell.radius);
                        }
                        
                        // Apply velocity to push the cell away from the virus towards the behind position
                        cell.position = behindPosition;
                        cell.velocity = behindDirection.multiply(VIRUS_REPEL_FORCE);
                        cell.mergeCooldown = MERGE_COOLDOWN_FRAMES / 2; // Short cooldown to prevent immediate re-collision
                        
                        // No virus consumption for small cells
                        break;
                    }
                }
            }
        }
        
        allCells = [...playerCells, ...botCells];

        // --- 5. Detecção de Colisão (Comer) ---
        
        for (let i = allCells.length - 1; i >= 0; i--) {
            for (let j = i - 1; j >= 0; j--) {
                const cellA = allCells[i];
                const cellB = allCells[j];
                if (!cellA || !cellB) continue;

                const distVec = cellA.position.subtract(cellB.position);
                const distance = distVec.magnitude();

                if (distance < Math.max(cellA.radius, cellB.radius)) {
                    let predator, prey;
                    if (cellA.mass > cellB.mass * 1.15) {
                        predator = cellA;
                        prey = cellB;
                    } else if (cellB.mass > cellA.mass * 1.15) {
                        predator = cellB;
                        prey = cellA; // FIXED: was incorrectly set to cellB
                    } else {
                        continue;
                    }
                    
                    if (predator.name === prey.name) continue;

                    let isPreyImmune = false;
                    for (const virus of viruses) {
                        const distToVirus = prey.position.subtract(virus.position).magnitude();
                        
                        if (distToVirus + prey.radius < virus.radius && prey.mass <= VIRUS_MASS) {
                            isPreyImmune = true;
                            break;
                        }
                    }
                    
                    if (isPreyImmune) {
                        continue;
                    }

                    const deathDistance = predator.radius - prey.radius * 0.3;
                    if (distance < deathDistance) {
                        predator.mass += prey.mass;
                        predator.radius = predator.calculateRadius();
                        
                        if (predator instanceof Player || !predator.isBot) {
                            playCollect();
                        }
                        
                        const preyIndexInPlayer = playerCells.indexOf(prey as Player);
                        if (preyIndexInPlayer > -1) playerCells.splice(preyIndexInPlayer, 1);

                        const preyIndexInBots = botCells.indexOf(prey);
                        if (preyIndexInBots > -1) {
                            botCells.splice(preyIndexInBots, 1);
                            if (prey.isBot) {
                                botNamesRef.current.push(prey.name);
                            }
                        }
                        
                        allCells.splice(allCells.indexOf(prey), 1);
                        if (allCells.indexOf(predator) < i) i--;
                        if (allCells.indexOf(predator) < j) j--;
                    }
                }
            }
        }
        
        // --- 6. Safety Check: Limit total bot cells to prevent performance issues ---
        const totalBotCells = botCells.length;
        if (totalBotCells > MAX_TOTAL_BOT_CELLS) {
            // Sort bot cells by mass (smallest first)
            const sortedBotCells = [...botCells].sort((a, b) => a.mass - b.mass);
            
            // Remove the smallest cells until we're under the limit
            const cellsToRemove = sortedBotCells.slice(0, totalBotCells - MAX_TOTAL_BOT_CELLS);
            cellsToRemove.forEach(cell => {
                const index = botCells.indexOf(cell);
                if (index > -1) {
                    botCells.splice(index, 1);
                    botNamesRef.current.push(cell.name); // Return name to pool
                }
            });
            
            console.log(`Performance optimization: Removed ${cellsToRemove.length} small bot cells to maintain performance.`);
        }
        
        // --- 7. Respawn de Bots (only if below initial count after all updates) ---
        while (botCells.length < initialBotCount) {
            const newBotName = botNamesRef.current.shift() || `Bot ${Math.random().toString(36).substring(7)}`;
            
            // UPDATED: Spawn within circular bounds
            let angle = Math.random() * Math.PI * 2;
            let distance = Math.random() * (WORLD_RADIUS * 0.8) + WORLD_RADIUS * 0.1;
            const newPosition = new Vector(
              WORLD_CENTER_X + Math.cos(angle) * distance,
              WORLD_CENTER_Y + Math.sin(angle) * distance
            );
            
            const newBot = new Cell(
                newPosition.x,
                newPosition.y,
                getRandomColor(),
                MIN_CELL_MASS + 10,
                newBotName,
                getNextCellId(),
                true
            );
            botCells.push(newBot);
        }
        
        // --- 8. Respawn de Vírus (only if below VIRUS_COUNT after all updates) ---
        while (viruses.length < VIRUS_COUNT) {
            const safePos = findSafeVirusPosition(allCells, viruses);
            
            viruses.push(new Virus(
                safePos.x,
                safePos.y,
                viruses.length + 1
            ));
        }
        
        // Eating pellets (Otimizado: verifica colisão apenas com pellets visíveis)
        
        // 9. Atualização de Câmera e Score (necessário para definir a área de visão)
        const initialMassForScore = MIN_CELL_MASS / 2; 
        const currentScore = Math.floor(totalPlayerMass - initialMassForScore);
        
        gameInstance.score = currentScore;
        if (currentScore > gameInstance.maxScore) {
            gameInstance.maxScore = currentScore;
        }

        let centerX = WORLD_CENTER_X;
        let centerY = WORLD_CENTER_Y;
        let avgRadius = MIN_CELL_RADIUS;

        if (playerCells.length > 0) {
            centerX = playerCenterOfMass.x;
            centerY = playerCenterOfMass.y;
            avgRadius = avgPlayerRadius;
            
            // UPDATED: Smoother camera following (reduced from 0.1 to 0.05 for less jittery movement)
            camera.x += (centerX - camera.x) * 0.05;
            camera.y += (centerY - camera.y) * 0.05;
            
            // REMOVIDO: Lógica de zoom dinâmico. O zoom agora é fixo (fixedZoomRef.current)
            camera.zoom = fixedZoomRef.current;
        }
        
        // Calcula a área de visão (viewport)
        const viewportWidth = canvas.width / camera.zoom;
        const viewportHeight = canvas.height / camera.zoom;
        const viewLeft = camera.x - viewportWidth / 2;
        const viewTop = camera.y - viewportHeight / 2;
        const viewRight = camera.x + viewportWidth / 2;
        const viewBottom = camera.y + viewportHeight / 2;

        // Colisão de Pellets (Otimizado)
        for (let i = pellets.length - 1; i >= 0; i--) {
            const pellet = pellets[i];
            
            // 1. Verifica se o pellet está na área de visão (otimização de renderização)
            if (pellet.position.x < viewLeft || pellet.position.x > viewRight ||
                pellet.position.y < viewTop || pellet.position.y > viewBottom) {
                continue; // Pula a verificação de colisão se estiver fora da tela
            }
            
            // 2. Verifica colisão com células
            for (const cell of allCells) {
                if (!pellet) continue;
                const dist = cell.position.subtract(pellet.position).magnitude();
                if (dist < cell.radius) {
                    cell.mass += 10;
                    cell.radius = cell.calculateRadius();
                    pellets.splice(i, 1);
                    
                    if (cell instanceof Player || !cell.isBot) {
                        playCollect();
                    }
                    break; 
                }
            }
        }
        
        // Respawn de Pellets
        if (pellets.length < PELLET_COUNT) {
          // UPDATED: Spawn within circular bounds
          let angle = Math.random() * Math.PI * 2;
          let distance = Math.random() * (WORLD_RADIUS * 0.8) + WORLD_RADIUS * 0.1;
          const newPellet = new Pellet(getRandomColor());
          newPellet.position = new Vector(
            WORLD_CENTER_X + Math.cos(angle) * distance,
            WORLD_CENTER_Y + Math.sin(angle) * distance
          );
          pellets.push(newPellet);
        }

        // Prepare minimap data
        const visibleBots = botCells
            .map(bot => ({
                x: bot.position.x,
                y: bot.position.y,
                mass: bot.mass,
                color: bot.color,
                radius: bot.radius,
            }));

        setMinimapData({
            playerCenter: { x: centerX, y: centerY },
            playerRadius: avgRadius, 
            visibleBots: visibleBots,
        });
        
        // --- 10. Leaderboard Logic ---
        
        const botMassMap = new Map<string, number>();
        botCells.forEach(bot => {
            botMassMap.set(bot.name, (botMassMap.get(bot.name) || 0) + bot.mass);
        });
        
        const botEntries = Array.from(botMassMap.entries()).map(([name, mass]) => ({
            name: name,
            mass: mass,
            isPlayer: false,
            id: 0, 
        }));
        
        const playerEntry = {
            name: playerName,
            mass: totalPlayerMass,
            isPlayer: true,
            id: 0, 
        };
        
        const leaderboardData = [...botEntries, playerEntry]
            .sort((a, b) => b.mass - a.mass)
            .slice(0, 5); 


        // Drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(-camera.x, -camera.y);
        
        // --- Desenho do Fundo do Mundo ---
        
        // 1. Desenha a imagem de fundo com opacidade
        if (bgImgRef.current) {
            const img = bgImgRef.current;
            const opacity = 0.4;
            
            ctx.globalAlpha = opacity;
            ctx.drawImage(img, 0, 0, WORLD_SIZE, WORLD_SIZE);
            ctx.globalAlpha = 1.0;
        } else {
            // Fallback para cor de fundo se a imagem não carregar
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, WORLD_SIZE, WORLD_SIZE);
        }
        // --- FIM: Desenho do Fundo do Mundo ---

        // Draw World Grid (circular pattern)
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 1;
        for (let r = 50; r <= WORLD_RADIUS; r += 50) {
            ctx.beginPath();
            ctx.arc(WORLD_CENTER_X, WORLD_CENTER_Y, r, 0, Math.PI * 2);
            ctx.stroke();
        }
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
            ctx.beginPath();
            ctx.moveTo(WORLD_CENTER_X, WORLD_CENTER_Y);
            ctx.lineTo(
                WORLD_CENTER_X + Math.cos(angle) * WORLD_RADIUS,
                WORLD_CENTER_Y + Math.sin(angle) * WORLD_RADIUS
            );
            ctx.stroke();
        }

        // UPDATED: Draw circular world border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 20; 
        ctx.beginPath();
        ctx.arc(WORLD_CENTER_X, WORLD_CENTER_Y, WORLD_RADIUS, 0, Math.PI * 2);
        ctx.stroke();

        // Otimização de Renderização de Pellets
        pellets.forEach(p => {
            if (p.position.x >= viewLeft && p.position.x <= viewRight &&
                p.position.y >= viewTop && p.position.y <= viewBottom) {
                p.draw(ctx);
            }
        });
        
        // --- Lógica de Desenho de Camadas ---
        
        const cellsInsideVirus: Cell[] = [];
        const cellsOutsideVirus: Cell[] = [];
        
        allCells.forEach(cell => {
            let isInside = false;
            if (cell.mass <= VIRUS_MASS) {
                for (const virus of viruses) {
                    const distToVirus = cell.position.subtract(virus.position).magnitude();
                    if (distToVirus + cell.radius < virus.radius) {
                        isInside = true;
                        break;
                    }
                }
            }
            if (isInside) {
                cellsInsideVirus.push(cell);
            } else {
                cellsOutsideVirus.push(cell);
            }
        });
        
        cellsOutsideVirus.sort((a, b) => a.mass - b.mass).forEach(c => {
            c.draw(ctx, c instanceof Player);
        });

        // Otimização de Renderização de Vírus
        viruses.forEach(v => {
            if (v.position.x + v.radius >= viewLeft && v.position.x - v.radius <= viewRight &&
                v.position.y + v.radius >= viewTop && v.position.y - v.radius <= viewBottom) {
                v.draw(ctx);
            }
        }); 
        
        // --- FIM: Lógica de Desenho de Camadas ---

        ctx.restore();

        // Draw UI elements (Score and Leaderboard)
        ctx.fillStyle = '#333';
        ctx.font = 'bold 20px Quicksand';
        ctx.textAlign = 'left';
        ctx.fillText(`Pontuação: ${gameInstance.score}`, 20, 30);
        
        ctx.textAlign = 'right';
        ctx.fillText(`Recorde: ${highScore}`, canvas.width - 20, 30);
        
        // Draw Leaderboard
        const leaderboardWidth = 180; 
        const leaderboardX = canvas.width - leaderboardWidth - 20;
        const lineHeight = 20; 
        const leaderboardY = 50; 
        const leaderboardHeight = 20 + leaderboardData.length * lineHeight;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(leaderboardX, leaderboardY, leaderboardWidth, leaderboardHeight);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(leaderboardX, leaderboardY, leaderboardWidth, leaderboardHeight);

        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Quicksand';
        ctx.textAlign = 'left';
        ctx.fillText('Top 5', leaderboardX + 10, leaderboardY + 20);
        
        ctx.font = '14px Quicksand';
        leaderboardData.forEach((entry, index) => {
            const y = leaderboardY + 40 + index * lineHeight; 
            ctx.fillStyle = entry.isPlayer ? '#2196F3' : '#333';
            
            const nameDisplay = entry.name.length > 10 ? entry.name.substring(0, 8) + '...' : entry.name;
            ctx.textAlign = 'left';
            ctx.fillText(`${index + 1}. ${nameDisplay}`, leaderboardX + 10, y);
            
            ctx.textAlign = 'right';
            ctx.fillText(Math.floor(entry.mass).toString(), leaderboardX + leaderboardWidth - 10, y);
        });

    } catch (error) {
        console.error('Error in game loop:', error);
        // Continue the game loop despite the error
    }

    // Always schedule the next frame
    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [difficulty, onGameOver, highScore, gameInstance, playerName, playCollect, playSplit, initialBotCount, isMobile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // 1. Calcula o zoom fixo para caber o mundo inteiro na tela
    const zoomX = canvas.width / WORLD_SIZE;
    const zoomY = canvas.height / WORLD_SIZE;
    fixedZoomRef.current = Math.min(zoomX, zoomY);
    gameInstance.camera.zoom = fixedZoomRef.current; // Define o zoom inicial

    // Carrega a imagem de fundo
    if (!bgImgRef.current) {
        const img = new Image();
        img.onload = () => {
            bgImgRef.current = img;
        };
        img.src = heroBgImage;
    }

    const settings = difficultySettings[difficulty];
    
    nextCellId = 1; 
    
    const initialPlayerMass = MIN_CELL_RADIUS * MIN_CELL_RADIUS / 2; 
    
    // UPDATED: Spawn player within circular bounds (center)
    gameInstance.playerCells = [new Player(WORLD_CENTER_X, WORLD_CENTER_Y, '#2196F3', initialPlayerMass, playerName)];
    
    gameInstance.viruses = Array.from({ length: VIRUS_COUNT }, (_, i) => {
        const safePos = findSafeVirusPosition(gameInstance.playerCells, gameInstance.viruses);
        return new Virus(
            safePos.x,
            safePos.y,
            i + 1
        );
    });
    
    const botCount = settings.botCount;
    const finalBotNames = generateBotNames(botCount);
    
    botNamesRef.current = [...finalBotNames];

    gameInstance.botCells = Array.from({ length: botCount }, (_, i) => {
        const name = finalBotNames[i];
        
        // UPDATED: Spawn bots within circular bounds
        let angle = Math.random() * Math.PI * 2;
        let distance = Math.random() * (WORLD_RADIUS * 0.8) + WORLD_RADIUS * 0.1;
        const spawnPosition = new Vector(
          WORLD_CENTER_X + Math.cos(angle) * distance,
          WORLD_CENTER_Y + Math.sin(angle) * distance
        );
        
        const initialBotMass = Math.random() * 1000 + 250; 
        
        return new Cell(
            spawnPosition.x,
            spawnPosition.y,
            getRandomColor(),
            initialBotMass,
            name,
            getNextCellId(),
            true
        );
    });
    
    gameInstance.pellets = Array.from({ length: PELLET_COUNT }, () => new Pellet(getRandomColor()));
    gameInstance.score = 0;
    gameInstance.maxScore = 0; 
    setIsPlaying(true); 

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameLoop, difficulty, gameInstance, playerName, initialBotCount]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', touchAction: isMobile ? 'none' : 'auto' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      
      {/* Controles visíveis apenas em dispositivos móveis */}
      {isMobile && (
        <>
          <VirtualJoystick onMove={handleJoystickMove} />
          <SplitButton onSplit={handleSplit} />
        </>
      )}
      
      <Minimap {...minimapData} />
    </div>
  );
};

export default DivideIoGame;