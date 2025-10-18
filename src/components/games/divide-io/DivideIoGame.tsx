import React, { useRef, useEffect, useCallback } from 'react';
import { useDivideIoProgress } from '@/hooks/useDivideIoProgress';
import VirtualJoystick from './VirtualJoystick';
import SplitButton from './SplitButton';
import Minimap from './Minimap';
import { BOT_NAMES } from './BotNames';
import { useGameAudio } from '@/hooks/useGameAudio'; // Importando o hook de áudio

type Difficulty = 'easy' | 'medium' | 'hard';

interface DivideIoGameProps {
  difficulty: Difficulty;
  onGameOver: (score: number) => void;
  playerName: string;
}

const difficultySettings = {
  easy: { botCount: 18, botAggression: 0.2, botSplitChance: 0.001 },
  medium: { botCount: 18, botAggression: 0.5, botSplitChance: 0.002 },
  hard: { botCount: 18, botAggression: 0.8, botSplitChance: 0.005 },
};

const WORLD_SIZE = 3000;
const PELLET_COUNT = 900;
const MIN_CELL_RADIUS = 10;
const MIN_CELL_MASS = MIN_CELL_RADIUS * MIN_CELL_RADIUS; // 100
const MIN_SPLIT_MASS = MIN_CELL_MASS * 2;
const MERGE_COOLDOWN_FRAMES = 60 * 5; // 5 seconds at 60fps
const MASS_TO_RADIUS_RATIO = 4;

// New constants for Virus
const VIRUS_RADIUS = 60; 
const VIRUS_MASS = VIRUS_RADIUS * VIRUS_RADIUS / MASS_TO_RADIUS_RATIO; 
const VIRUS_COUNT = 8;
const VIRUS_COLOR = '#FF4136'; // Red color
const EXPLOSION_THRESHOLD_MASS = VIRUS_MASS * 1.33; // Cell must be 1.33x mass of virus to explode it

// Distância mínima de segurança para o respawn do vírus (Raio do Vírus + Raio Máximo de Célula Inicial + Margem)
const MIN_VIRUS_RESPAWN_DISTANCE = VIRUS_RADIUS + 100; 

// Ajuste de Impulso para Divisão
const EJECTION_IMPULSE = 400; // AUMENTADO para 400
const EJECTION_OFFSET = 30; // AUMENTADO para 30

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

const joystickDirectionRef: { current: { x: number; y: number } } = { current: { x: 0, y: 0 } };

class Cell {
  public position: Vector;
  public mass: number;
  public radius: number;
  public velocity: Vector;
  public mergeCooldown = 0;
  public name: string;
  public id: number; 
  public isBot: boolean; // Adicionado para distinguir no loop

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
    // Apply friction to slow down over time
    this.velocity = this.velocity.multiply(0.95);
    this.position = this.position.add(this.velocity);
    
    // Boundary clamping (Clamping the cell position to the world boundaries)
    this.position.x = Math.max(this.radius, Math.min(WORLD_SIZE - this.radius, this.position.x));
    this.position.y = Math.max(this.radius, Math.min(WORLD_SIZE - this.radius, this.position.y));
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
  
  split(directionVector: Vector, nextCellId: number) {
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
            this.isBot // Mantém o status de bot
        );
        
        // Apply a strong impulse to the new cell
        newCell.velocity = this.velocity.add(direction.multiply(EJECTION_IMPULSE));
        newCell.mergeCooldown = MERGE_COOLDOWN_FRAMES;
        
        // Apply a slight counter-impulse to the original cell
        this.velocity = this.velocity.add(direction.multiply(-EJECTION_IMPULSE * 0.1));

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
    
    // Sobrescreve split para não aceitar argumentos e encapsular a lógica de direção/ID
    split() {
        const joystickVec = new Vector(joystickDirectionRef.current.x, joystickDirectionRef.current.y);
        return super.split(joystickVec, getNextCellId());
    }
}

// New Virus class
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
    const numSpikes = 20; // Número de pontas
    const innerRadius = this.radius * 0.8; // Raio interno
    const outerRadius = this.radius * 1.1; // Raio externo (para as pontas)
    
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


// Lógica de Bot movida para uma função auxiliar
const botLogic = {
    target: new Map<string, Vector | null>(),
    threat: new Map<string, Vector | null>(),
    explorationTarget: new Map<string, Vector | null>(), // Novo alvo de exploração
    decisionTimer: new Map<string, number>(),
    
    findBestTarget(botCells: Cell[], pellets: Pellet[], otherCells: Cell[], aggression: number, botName: string) {
        // Calcula o centro de massa do bot
        const totalMass = botCells.reduce((sum, c) => sum + c.mass, 0);
        // Corrigido: Usar botCells.length para calcular avgRadius
        const avgRadius = botCells.reduce((sum, c) => sum + c.radius, 0) / botCells.length;
        const center = botCells.reduce((sum, c) => sum.add(c.position.multiply(c.mass)), new Vector(0, 0)).multiply(1 / totalMass);

        let bestTarget: Pellet | Cell | null = null;
        let minTargetDist = Infinity;
        let closestThreat: Cell | null = null;
        let minThreatDist = Infinity;

        // Aumenta o raio de percepção para bots maiores
        const perceptionRadius = avgRadius * 15; 

        for (const cell of otherCells) {
            if (cell.name === botName) continue; // Não considera as próprias células
            const dist = center.subtract(cell.position).magnitude();
            if (dist > perceptionRadius) continue;

            if (cell.mass > totalMass * 1.15) { // 15% maior para ser ameaça
                if (dist < minThreatDist) {
                    minThreatDist = dist;
                    closestThreat = cell;
                }
            } else if (totalMass > cell.mass * 1.15) { // 15% maior para ser alvo
                // A chance de atacar é controlada pela agressão
                if (dist < minTargetDist && Math.random() < aggression) {
                    minTargetDist = dist;
                    bestTarget = cell;
                }
            }
        }

        if (closestThreat && minThreatDist < avgRadius * 5) { // Fuga se a ameaça estiver próxima
            this.threat.set(botName, closestThreat.position);
            this.target.set(botName, null);
            this.explorationTarget.set(botName, null);
            return;
        }

        if (!bestTarget) {
            // Busca por pellets se não houver células alvo
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
        
        // Se não houver alvo (pellet ou célula), define um novo alvo de exploração
        if (!bestTarget) {
            let currentExplorationTarget = this.explorationTarget.get(botName);
            
            // Se não houver alvo de exploração ou se o bot estiver muito perto do alvo atual, escolha um novo
            if (!currentExplorationTarget || center.subtract(currentExplorationTarget).magnitude() < WORLD_SIZE * 0.1) {
                // Escolhe um ponto aleatório no mapa, garantindo que não seja muito perto da borda
                const newTarget = new Vector(
                    Math.random() * (WORLD_SIZE * 0.8) + WORLD_SIZE * 0.1,
                    Math.random() * (WORLD_SIZE * 0.8) + WORLD_SIZE * 0.1
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
            // Fuga: move-se na direção oposta à ameaça
            return center.subtract(threat).normalize();
        } else if (target) {
            // Caça/Comida: move-se em direção ao alvo
            return target.subtract(center).normalize();
        } else if (explorationTarget) {
            // Exploração: move-se em direção ao ponto de exploração
            return explorationTarget.subtract(center).normalize();
        }
        
        // Caso de fallback (nunca deve acontecer se a lógica de exploração estiver funcionando)
        return new Vector(0, 0);
    }
};


class Pellet {
  public position: Vector;
  public radius = 3;
  constructor(public color: string) {
    this.position = new Vector(Math.random() * WORLD_SIZE, Math.random() * WORLD_SIZE);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

const PELLET_MASS_VALUE = 10; // Implicit mass value of a single pellet

const generatePelletsFromMass = (mass: number, position: Vector) => {
    const pellets: Pellet[] = [];
    const pelletCount = Math.floor(mass / PELLET_MASS_VALUE);
    
    for (let i = 0; i < pelletCount; i++) {
        const pellet = new Pellet(getRandomColor());
        
        // Distribute pellets around the explosion point
        const angle = Math.random() * Math.PI * 2;
        // Spread distance proportional to the exploded mass/radius
        const explosionRadius = Math.sqrt(mass / Math.PI) * MASS_TO_RADIUS_RATIO;
        const distance = Math.random() * explosionRadius * 1.5; 
        
        pellet.position = position.add(new Vector(Math.cos(angle) * distance, Math.sin(angle) * distance));
        
        // Boundary clamping for pellets
        pellet.position.x = Math.max(pellet.radius, Math.min(WORLD_SIZE - pellet.radius, pellet.position.x));
        pellet.position.y = Math.max(pellet.radius, Math.min(WORLD_SIZE - pellet.radius, pellet.position.y));
        
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
        
        // Gera uma posição aleatória dentro dos limites do mundo
        const x = Math.random() * (WORLD_SIZE - 2 * VIRUS_RADIUS) + VIRUS_RADIUS;
        const y = Math.random() * (WORLD_SIZE - 2 * VIRUS_RADIUS) + VIRUS_RADIUS;
        const potentialPosition = new Vector(x, y);
        
        let isSafe = true;

        // 1. Verifica proximidade com outras células (Player e Bots)
        for (const cell of allCells) {
            const distance = potentialPosition.subtract(cell.position).magnitude();
            // Se a distância for menor que a soma dos raios + margem de segurança
            if (distance < cell.radius + VIRUS_RADIUS + MIN_VIRUS_RESPAWN_DISTANCE) {
                isSafe = false;
                break;
            }
        }
        
        // 2. Verifica proximidade com outros vírus (para evitar sobreposição)
        if (isSafe) {
            for (const virus of viruses) {
                const distance = potentialPosition.subtract(virus.position).magnitude();
                if (distance < VIRUS_RADIUS * 2.5) { // 2.5x o raio para dar espaço
                    isSafe = false;
                    break;
                }
            }
        }

        if (isSafe) {
            safePosition = potentialPosition;
        }
    }

    // Se falhar em encontrar uma posição segura após muitas tentativas, retorna uma posição aleatória (fallback)
    if (safePosition === null) {
        console.warn("Failed to find a safe virus spawn position, using random fallback.");
        return new Vector(
            Math.random() * WORLD_SIZE,
            Math.random() * WORLD_SIZE
        );
    }
    
    return safePosition;
};


const DivideIoGame: React.FC<DivideIoGameProps> = ({ difficulty, onGameOver, playerName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { highScore } = useDivideIoProgress();
  const animationFrameId = useRef<number>();
  
  const [isPlaying, setIsPlaying] = React.useState(true);
  const { playCollect, playSplit } = useGameAudio(isPlaying); 
  
  // Rastreia a contagem inicial de bots e a lista de nomes
  const initialBotCount = difficultySettings[difficulty].botCount;
  const botNamesRef = useRef<string[]>([]);

  // Estado para o minimapa
  const [minimapData, setMinimapData] = React.useState({
    playerCenter: { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 },
    playerRadius: MIN_CELL_RADIUS, 
    visibleBots: [] as Array<{ x: number; y: number; mass: number; color: string }>,
  });

  const gameInstance = useRef({
    playerCells: [] as Player[],
    botCells: [] as Cell[], 
    pellets: [] as Pellet[],
    viruses: [] as Virus[], // ADDED
    camera: { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2, zoom: 1 },
    score: 0,
    maxScore: 0, 
  }).current;

  const handleJoystickMove = useCallback((direction: { x: number; y: number }) => {
    joystickDirectionRef.current = direction;
  }, []);

  const handleSplit = useCallback(() => {
    const newCells: Cell[] = [];
    // CRUCIAL: Cria uma cópia das células do jogador ANTES de qualquer divisão
    const cellsToSplit = [...gameInstance.playerCells]; 
    
    cellsToSplit.forEach(cell => {
      // Verifica se a célula ainda existe no array principal (para evitar bugs se a célula foi comida no mesmo frame, embora improvável)
      if (gameInstance.playerCells.includes(cell as Player)) {
        // CORREÇÃO TS2554: Chama cell.split() sem argumentos, pois Player.split() encapsula a lógica de direção/ID.
        const newCell = cell.split(); 
        if (newCell) {
          newCells.push(newCell);
          playSplit(); // Toca SFX de divisão
        }
      }
    });
    
    // Adiciona todas as novas células de uma vez
    gameInstance.playerCells.push(...(newCells as Player[]));
  }, [gameInstance, playSplit]);

  // Efeito para escutar a tecla Espaço (apenas para PC)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Verifica se o jogo está ativo e se a tecla pressionada é a barra de espaço
      if (isPlaying && event.code === 'Space') {
        event.preventDefault(); // Previne a rolagem da página
        handleSplit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, handleSplit]);


  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { playerCells, botCells, pellets, viruses, camera } = gameInstance;
    
    if (playerCells.length === 0) {
      setIsPlaying(false);
      onGameOver(gameInstance.maxScore); // Reporta a pontuação máxima alcançada
      return;
    }

    let allCells: Cell[] = [...playerCells, ...botCells]; // Define allCells here

    const settings = difficultySettings[difficulty];

    // --- 1. Lógica do Jogador ---
    const playerDirection = new Vector(joystickDirectionRef.current.x, joystickDirectionRef.current.y);
    
    // Calcula o centro de massa do jogador
    const totalPlayerMass = playerCells.reduce((sum, cell) => sum + cell.mass, 0);
    const playerCenterOfMass = playerCells.reduce((sum, c) => sum.add(c.position.multiply(c.mass)), new Vector(0, 0)).multiply(1 / totalPlayerMass);
    const avgPlayerRadius = playerCells.reduce((sum, cell) => sum + cell.radius, 0) / playerCells.length;

    playerCells.forEach(playerCell => {
        // 1a. Movimento do Jogador (Input)
        const acceleration = 1;
        const force = playerDirection.multiply(acceleration);
        playerCell.velocity = playerCell.velocity.add(force);

        // NOVO CÁLCULO DE VELOCIDADE MÁXIMA: Mais lento no início e desaceleração mais suave
        // Reduzido de 100 para 50 (metade da velocidade inicial) e ajustado o denominador para suavizar a queda.
        const maxSpeed = 50 / (playerCell.radius * 0.2 + 10); 
        if (playerCell.velocity.magnitude() > maxSpeed) {
            playerCell.velocity = playerCell.velocity.normalize().multiply(maxSpeed);
        }
        
        // 1b. Força de Atração (para fusão automática)
        if (playerCells.length > 1) {
            // Calcula o vetor de atração em direção ao centro de massa do grupo
            const attractionVector = playerCenterOfMass.subtract(playerCell.position).normalize();
            
            // Calcula o fator de atração (0 no início do cooldown, 1 no final)
            const mergeProgress = 1 - (playerCell.mergeCooldown / MERGE_COOLDOWN_FRAMES);
            const attractionFactor = Math.max(0, mergeProgress); // Garante que não seja negativo
            
            // Aplica uma força de atração suave (ajustada pela massa e pelo fator de atração)
            const attractionForce = 0.5 * (avgPlayerRadius / playerCell.radius) * attractionFactor; 
            playerCell.velocity = playerCell.velocity.add(attractionVector.multiply(attractionForce));
        }
    });

    // --- 2. Lógica dos Bots (Movimento Coordenado e Fusão) ---
    
    // Agrupar células de bot por nome
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
        
        // Calcula o centro de massa do grupo
        const centerOfMass = cells.reduce((sum, c) => sum.add(c.position.multiply(c.mass)), new Vector(0, 0)).multiply(1 / totalMass);

        // Decisão de movimento (a cada 30 frames)
        let decisionTimer = botLogic.decisionTimer.get(botName) || 0;
        if (decisionTimer <= 0) {
            // Passa o centro de massa para a lógica de busca de alvo
            botLogic.findBestTarget(cells, pellets, allCells.filter(c => c.name !== botName), settings.botAggression, botName);
            decisionTimer = 30;
        }
        botLogic.decisionTimer.set(botName, decisionTimer - 1);

        const targetDirection = botLogic.getMovementDirection(botName, centerOfMass);
        
        cells.forEach(cell => {
            // 2a. Movimento Coordenado
            const acceleration = 1;
            const force = targetDirection.multiply(acceleration);
            cell.velocity = cell.velocity.add(force);
            
            // Usar a mesma fórmula de velocidade para bots
            const maxSpeed = 50 / (cell.radius * 0.2 + 10); 
            if (cell.velocity.magnitude() > maxSpeed) {
                cell.velocity = cell.velocity.normalize().multiply(maxSpeed);
            }
            
            // 2b. Força de Atração (para fusão)
            if (cells.length > 1) {
                // Calcula o vetor de atração em direção ao centro de massa do grupo
                const attractionVector = centerOfMass.subtract(cell.position).normalize();
                
                // Calcula o fator de atração (0 no início do cooldown, 1 no final)
                const mergeProgress = 1 - (cell.mergeCooldown / MERGE_COOLDOWN_FRAMES);
                const attractionFactor = Math.max(0, mergeProgress); 
                
                // Aplica uma força de atração suave (ajustada pela massa e pelo fator de atração)
                const attractionForce = 0.5 * (avgRadius / cell.radius) * attractionFactor; 
                cell.velocity = cell.velocity.add(attractionVector.multiply(attractionForce));
            }
            
            // 2c. Lógica de Divisão (se o bot for grande e estiver caçando)
            if (totalMass > MIN_SPLIT_MASS * 2 && cells.length === 1 && Math.random() < settings.botSplitChance) {
                // Bots usam a função split da classe base, que requer direção e ID
                const newCell = cell.split(targetDirection, getNextCellId());
                if (newCell) {
                    newBotCells.push(newCell);
                }
            }
            
            cell.update();
        });
        
        // 2d. Fusão de Células de Bot (dentro do grupo)
        for (let i = cells.length - 1; i >= 0; i--) {
            for (let j = i - 1; j >= 0; j--) {
                const cellA = cells[i];
                const cellB = cells[j];
                
                // Bots podem se fundir a qualquer momento se o cooldown for 0
                if (cellA.mergeCooldown <= 0 && cellB.mergeCooldown <= 0) {
                    const dist = cellA.position.subtract(cellB.position).magnitude();
                    // Fusão ocorre quando a distância é menor que a soma dos raios
                    if (dist < cellA.radius + cellB.radius) { 
                        const bigger = cellA.mass > cellB.mass ? cellA : cellB;
                        const smaller = cellA.mass > cellB.mass ? cellB : cellA;
                        
                        bigger.mass += smaller.mass;
                        bigger.radius = bigger.calculateRadius();
                        
                        // Remove a célula menor do array principal (botCells)
                        const smallerIndex = botCells.indexOf(smaller);
                        if (smallerIndex > -1) {
                            botCells.splice(smallerIndex, 1);
                            // Remove também do array temporário 'cells' para evitar erros de índice
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
    // A atualização do jogador (incluindo a decrementação do cooldown) foi movida para a seção 1.
    playerCells.forEach(cell => cell.update());

    // Player cell merging
    for (let i = playerCells.length - 1; i >= 0; i--) {
      for (let j = i - 1; j >= 0; j--) {
        const cellA = playerCells[i];
        const cellB = playerCells[j];
        
        // A fusão só ocorre se o cooldown for 0 em AMBAS as células
        if (cellA.mergeCooldown <= 0 && cellB.mergeCooldown <= 0) {
          const dist = cellA.position.subtract(cellB.position).magnitude();
          // Fusão ocorre quando a distância é menor que a soma dos raios
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

    // Rebuild allCells after player fusion
    allCells = [...playerCells, ...botCells];

    // --- 4. Detecção de Colisão (Vírus/Obstáculos) ---
    
    // Check for collisions between cells and viruses
    for (let v = viruses.length - 1; v >= 0; v--) {
        const virus = viruses[v];
        
        // Iterate over a copy of allCells to safely handle removals
        for (let c = allCells.length - 1; c >= 0; c--) {
            const cell = allCells[c];
            
            const distVec = cell.position.subtract(virus.position);
            const distance = distVec.magnitude();
            
            // Collision check
            if (distance < cell.radius + virus.radius) {
                
                if (cell.mass > EXPLOSION_THRESHOLD_MASS) {
                    // EXPLOSION!
                    
                    // 1. Generate pellets from HALF the cell's mass
                    const massToRedistribute = cell.mass / 2;
                    const cellPellets = generatePelletsFromMass(massToRedistribute, cell.position);
                    gameInstance.pellets.push(...cellPellets);
                    
                    // 2. Generate pellets from the virus's mass (Virus also explodes)
                    const virusPellets = generatePelletsFromMass(virus.mass, virus.position);
                    gameInstance.pellets.push(...virusPellets);
                    
                    // 3. Remove cell and virus
                    
                    // Remove cell from playerCells or botCells
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
                    
                    // Remove virus
                    viruses.splice(v, 1);
                    
                    // If the player exploded, end game
                    if (playerCells.length === 0) {
                        setIsPlaying(false);
                        onGameOver(gameInstance.maxScore); 
                        return;
                    }
                    
                    // Since the virus was removed, we break the inner loop and continue the outer loop (v--)
                    break; 
                }
                
                // If the cell is smaller, it can pass through or hide inside. No explosion.
            }
        }
    }
    
    // Rebuild allCells after virus explosions
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
                if (cellA.mass > cellB.mass * 1.15) { // Need to be 15% bigger
                    predator = cellA;
                    prey = cellB;
                } else if (cellB.mass > cellA.mass * 1.15) {
                    predator = cellB;
                    prey = cellA;
                } else {
                    continue;
                }
                
                // Não permite que células do mesmo jogador/bot se comam
                if (predator.name === prey.name) continue;

                // --- NOVO: Regra de Imunidade do Vírus ---
                let isPreyImmune = false;
                // Check if prey is entirely inside a virus AND smaller than the virus
                for (const virus of viruses) {
                    const distToVirus = prey.position.subtract(virus.position).magnitude();
                    
                    // Check if prey is entirely inside the virus (distance + prey_radius < virus_radius)
                    // AND if the prey is smaller than the virus (prey.mass <= VIRUS_MASS)
                    if (distToVirus + prey.radius < virus.radius && prey.mass <= VIRUS_MASS) {
                        isPreyImmune = true;
                        break;
                    }
                }
                
                if (isPreyImmune) {
                    continue; // Skip eating if the prey is immune inside a virus
                }
                // --- FIM: Regra de Imunidade do Vírus ---

                const deathDistance = predator.radius - prey.radius * 0.3;
                if (distance < deathDistance) {
                    predator.mass += prey.mass;
                    predator.radius = predator.calculateRadius();
                    
                    if (predator instanceof Player || !predator.isBot) {
                        playCollect();
                    }
                    
                    // Remove a presa dos arrays específicos
                    const preyIndexInPlayer = playerCells.indexOf(prey as Player);
                    if (preyIndexInPlayer > -1) playerCells.splice(preyIndexInPlayer, 1);

                    const preyIndexInBots = botCells.indexOf(prey);
                    if (preyIndexInBots > -1) {
                        botCells.splice(preyIndexInBots, 1);
                        // Se um bot morreu, precisamos de um respawn
                        if (prey.isBot) {
                            // O nome do bot que morreu é liberado para o respawn
                            botNamesRef.current.push(prey.name);
                        }
                    }
                    
                    // Remove a presa do array temporário allCells
                    allCells.splice(allCells.indexOf(prey), 1);
                    if (allCells.indexOf(predator) < i) i--;
                    if (allCells.indexOf(predator) < j) j--;
                }
            }
        }
    }
    
    // --- 6. Respawn de Bots and Pellets ---
    while (botCells.length < initialBotCount) {
        // Pega um nome da lista de nomes disponíveis (ou gera um novo se necessário)
        const newBotName = botNamesRef.current.shift() || `Bot ${Math.random().toString(36).substring(7)}`;
        
        const newBot = new Cell(
            Math.random() * WORLD_SIZE,
            Math.random() * WORLD_SIZE,
            getRandomColor(),
            MIN_CELL_MASS + 10, // Massa inicial pequena (10 de score)
            newBotName,
            getNextCellId(),
            true
        );
        botCells.push(newBot);
    }
    
    // Eating pellets
    for (let i = pellets.length - 1; i >= 0; i--) {
        const pellet = pellets[i];
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
    if (pellets.length < PELLET_COUNT) {
      pellets.push(new Pellet(getRandomColor()));
    }
    
    // Respawn Viruses
    while (viruses.length < VIRUS_COUNT) {
        // Usa a função de posição segura
        const safePos = findSafeVirusPosition(allCells, viruses);
        
        viruses.push(new Virus(
            safePos.x,
            safePos.y,
            viruses.length + 1 // Simple ID assignment
        ));
    }


    // --- 7. Atualização de Câmera e Score ---
    // totalPlayerMass já foi calculado na seção 1
    const initialMassForScore = MIN_CELL_MASS / 2; 
    const currentScore = Math.floor(totalPlayerMass - initialPlayerMass);
    
    gameInstance.score = currentScore;
    if (currentScore > gameInstance.maxScore) {
        gameInstance.maxScore = currentScore;
    }


    let centerX = WORLD_SIZE / 2;
    let centerY = WORLD_SIZE / 2;
    let avgRadius = MIN_CELL_RADIUS;

    if (playerCells.length > 0) {
        centerX = playerCenterOfMass.x;
        centerY = playerCenterOfMass.y;
        avgRadius = avgPlayerRadius;
        
        camera.x += (centerX - camera.x) * 0.1;
        camera.y += (centerY - camera.y) * 0.1;
        camera.zoom = 40 / avgRadius + 0.4;
    }

    // Prepare minimap data
    const visibleBots = botCells
        .map(bot => ({
            x: bot.position.x,
            y: bot.position.y,
            mass: bot.mass,
            color: bot.color,
        }));

    setMinimapData({
        playerCenter: { x: centerX, y: centerY },
        playerRadius: avgRadius, 
        visibleBots: visibleBots,
    });
    
    // --- 8. Leaderboard Logic ---
    
    // 1. Agrupa a massa total dos bots pelo nome
    const botMassMap = new Map<string, number>();
    botCells.forEach(bot => {
        botMassMap.set(bot.name, (botMassMap.get(bot.name) || 0) + bot.mass);
    });
    
    // 2. Cria entradas para os bots (uma por nome)
    const botEntries = Array.from(botMassMap.entries()).map(([name, mass]) => ({
        name: name,
        mass: mass,
        isPlayer: false,
        id: 0, 
    }));
    
    // 3. Cria uma entrada UNIFICADA para o jogador
    const playerEntry = {
        name: playerName,
        mass: totalPlayerMass,
        isPlayer: true,
        id: 0, 
    };
    
    // 4. Combina e ordena
    const leaderboardData = [...botEntries, playerEntry]
        .sort((a, b) => b.mass - a.mass)
        .slice(0, 5); 


    // Drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    // Draw World Grid
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let x = 0; x <= WORLD_SIZE; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD_SIZE); ctx.stroke(); }
    for (let y = 0; y <= WORLD_SIZE; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD_SIZE, y); ctx.stroke(); }

    // Draw World Border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 20; 
    ctx.strokeRect(0, 0, WORLD_SIZE, WORLD_SIZE);

    pellets.forEach(p => p.draw(ctx));
    
    // --- NOVO: Lógica de Desenho de Camadas ---
    
    const cellsInsideVirus: Cell[] = [];
    const cellsOutsideVirus: Cell[] = [];
    
    // 1. Classificar células
    allCells.forEach(cell => {
        let isInside = false;
        if (cell.mass <= VIRUS_MASS) {
            for (const virus of viruses) {
                const distToVirus = cell.position.subtract(virus.position).magnitude();
                // Se a célula estiver totalmente dentro do vírus
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
    
    // 2. Desenhar células fora do vírus (camada inferior)
    cellsOutsideVirus.sort((a, b) => a.mass - b.mass).forEach(c => {
        c.draw(ctx, c instanceof Player);
    });

    // 3. Desenhar vírus (camada intermediária)
    viruses.forEach(v => v.draw(ctx)); 

    // 4. Desenhar células dentro do vírus (camada superior, mas invisível, pois o vírus as cobriu)
    // Não precisamos desenhar cellsInsideVirus, pois elas devem estar invisíveis.
    
    // --- FIM: Lógica de Desenho de Camadas ---

    ctx.restore();

    // Draw UI elements (Score and Leaderboard)
    // Ajustando a posição da pontuação para o topo esquerdo, acima do minimapa
    ctx.fillStyle = '#333';
    ctx.font = 'bold 20px Quicksand';
    ctx.textAlign = 'left';
    ctx.fillText(`Pontuação: ${gameInstance.score}`, 20, 30);
    
    // Ajustando a posição do Recorde para o topo direito
    ctx.textAlign = 'right';
    ctx.fillText(`Recorde: ${highScore}`, canvas.width - 20, 30);
    
    // Draw Leaderboard
    const leaderboardWidth = 180; 
    const leaderboardX = canvas.width - leaderboardWidth - 20;
    const lineHeight = 20; 
    // Ajustando a posição Y inicial do leaderboard para ficar abaixo do Recorde
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
        
        // Nome (alinhado à esquerda)
        ctx.textAlign = 'left';
        // Limita o nome para caber no espaço
        const nameDisplay = entry.name.length > 10 ? entry.name.substring(0, 8) + '...' : entry.name;
        ctx.fillText(`${index + 1}. ${nameDisplay}`, leaderboardX + 10, y);
        
        // Pontuação (alinhado à direita)
        ctx.textAlign = 'right';
        ctx.fillText(Math.floor(entry.mass).toString(), leaderboardX + leaderboardWidth - 10, y);
    });


    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [difficulty, onGameOver, highScore, gameInstance, playerName, playCollect, playSplit, initialBotCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const settings = difficultySettings[difficulty];
    
    // Resetar o contador de ID para garantir IDs únicos por jogo
    nextCellId = 1; 
    
    // Massa inicial reduzida pela metade
    const initialPlayerMass = MIN_CELL_MASS / 2; 
    
    // Initialize Player Cell with Name
    gameInstance.playerCells = [new Player(WORLD_SIZE / 2, WORLD_SIZE / 2, '#2196F3', initialPlayerMass, playerName)];
    
    // Initialize Viruses
    gameInstance.viruses = Array.from({ length: VIRUS_COUNT }, (_, i) => {
        // Usa a função de posição segura para a inicialização
        const safePos = findSafeVirusPosition(gameInstance.playerCells, gameInstance.viruses);
        return new Virus(
            safePos.x,
            safePos.y,
            i + 1
        );
    });
    
    // Initialize Bots with UNIQUE Names
    const botCount = settings.botCount;
    const finalBotNames = generateBotNames(botCount);
    
    // Armazena os nomes iniciais para respawn
    botNamesRef.current = [...finalBotNames];

    // Inicializa as células de bot como células genéricas com isBot=true
    gameInstance.botCells = Array.from({ length: botCount }, (_, i) => {
        const name = finalBotNames[i];
        
        // Massa inicial dos bots também reduzida pela metade (faixa de 250 a 1250)
        const initialBotMass = Math.random() * 1000 + 250; 
        
        return new Cell(
            Math.random() * WORLD_SIZE,
            Math.random() * WORLD_SIZE,
            getRandomColor(),
            initialBotMass,
            name,
            getNextCellId(),
            true // É um bot
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
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', touchAction: 'none' }}>
      <canvas ref={canvasRef} style={{ display: 'block', background: '#fff' }} />
      <VirtualJoystick onMove={handleJoystickMove} />
      {/* O SplitButton é mantido para dispositivos móveis, mas a divisão também é acionada pelo teclado no PC */}
      <SplitButton onSplit={handleSplit} />
      <Minimap {...minimapData} />
    </div>
  );
};

export default DivideIoGame;