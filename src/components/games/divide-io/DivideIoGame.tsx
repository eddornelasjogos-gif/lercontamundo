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
  easy: { botCount: 15, botAggression: 0.2, botSplitChance: 0.001 },
  medium: { botCount: 25, botAggression: 0.5, botSplitChance: 0.002 },
  hard: { botCount: 40, botAggression: 0.8, botSplitChance: 0.005 },
};

const WORLD_SIZE = 3000;
const PELLET_COUNT = 900;
const MIN_CELL_RADIUS = 10;
const MIN_CELL_MASS = MIN_CELL_RADIUS * MIN_CELL_RADIUS;
const MIN_SPLIT_MASS = MIN_CELL_MASS * 2;
const MERGE_COOLDOWN_FRAMES = 60 * 5; // 5 seconds at 60fps
const MASS_TO_RADIUS_RATIO = 4;

// Ajuste de Impulso para Divisão
const EJECTION_IMPULSE = 200; // Aumentado de 100 para 200
const EJECTION_OFFSET = 15; // Aumentado para garantir separação

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
    
    split() {
        const joystickVec = new Vector(joystickDirectionRef.current.x, joystickDirectionRef.current.y);
        return super.split(joystickVec, getNextCellId());
    }
}

// Lógica de Bot movida para uma função auxiliar
const botLogic = {
    target: new Map<string, Vector | null>(),
    threat: new Map<string, Vector | null>(),
    decisionTimer: new Map<string, number>(),
    
    findBestTarget(botCells: Cell[], pellets: Pellet[], otherCells: Cell[], aggression: number, botName: string) {
        // Calcula o centro de massa do bot
        const totalMass = botCells.reduce((sum, c) => sum + c.mass, 0);
        const center = botCells.reduce((sum, c) => sum.add(c.position.multiply(c.mass)), new Vector(0, 0)).multiply(1 / totalMass);
        const avgRadius = botCells.reduce((sum, c) => sum + c.radius, 0) / botCells.length;

        let bestTarget: Pellet | Cell | null = null;
        let minTargetDist = Infinity;
        let closestThreat: Cell | null = null;
        let minThreatDist = Infinity;

        const perceptionRadius = avgRadius * 10;

        for (const cell of otherCells) {
            if (cell.name === botName) continue; // Não considera as próprias células
            const dist = center.subtract(cell.position).magnitude();
            if (dist > perceptionRadius) continue;

            if (cell.mass > totalMass * 1.1) {
                if (dist < minThreatDist) {
                    minThreatDist = dist;
                    closestThreat = cell;
                }
            } else if (totalMass > cell.mass * 1.1) {
                if (dist < minTargetDist && Math.random() < aggression) {
                    minTargetDist = dist;
                    bestTarget = cell;
                }
            }
        }

        if (closestThreat && minThreatDist < avgRadius * 3) {
            this.threat.set(botName, closestThreat.position);
            this.target.set(botName, null);
            return;
        }

        if (!bestTarget) {
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
    },
    
    getMovementDirection(botName: string): Vector {
        const threat = this.threat.get(botName);
        const target = this.target.get(botName);
        
        if (threat) {
            // Fuga: move-se na direção oposta à ameaça
            return new Vector(0, 0).subtract(threat).normalize();
        } else if (target) {
            // Caça: move-se em direção ao alvo
            return target.subtract(new Vector(0, 0)).normalize();
        }
        // Movimento aleatório suave se não houver alvo
        return new Vector(Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05);
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

const DivideIoGame: React.FC<DivideIoGameProps> = ({ difficulty, onGameOver, playerName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { highScore } = useDivideIoProgress();
  const animationFrameId = useRef<number>();
  
  const [isPlaying, setIsPlaying] = React.useState(true);
  const { playCollect, playSplit } = useGameAudio(isPlaying); // Inicializa o áudio

  // Estado para o minimapa
  const [minimapData, setMinimapData] = React.useState({
    playerCenter: { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 },
    playerRadius: MIN_CELL_RADIUS, // Agora passamos o raio médio
    visibleBots: [] as Array<{ x: number; y: number; mass: number; color: string }>,
  });

  const gameInstance = useRef({
    playerCells: [] as Player[],
    botCells: [] as Cell[], // Agora armazena todas as células de bot aqui
    pellets: [] as Pellet[],
    camera: { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2, zoom: 1 },
    score: 0,
    maxScore: 0, // Novo campo para rastrear a pontuação máxima da sessão
  }).current;

  const handleJoystickMove = useCallback((direction: { x: number; y: number }) => {
    joystickDirectionRef.current = direction;
  }, []);

  const handleSplit = useCallback(() => {
    const newCells: Cell[] = [];
    const cellsToSplit = [...gameInstance.playerCells];
    cellsToSplit.forEach(cell => {
      const newCell = cell.split(new Vector(joystickDirectionRef.current.x, joystickDirectionRef.current.y), getNextCellId());
      if (newCell) {
        newCells.push(newCell);
        playSplit(); // Toca SFX de divisão
      }
    });
    gameInstance.playerCells.push(...(newCells as Player[]));
  }, [gameInstance, playSplit]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { playerCells, botCells, pellets, camera } = gameInstance;
    
    if (playerCells.length === 0) {
      setIsPlaying(false);
      onGameOver(gameInstance.maxScore); // Reporta a pontuação máxima alcançada
      return;
    }

    const allCells: Cell[] = [...playerCells, ...botCells];
    const settings = difficultySettings[difficulty];

    // --- 1. Lógica do Jogador ---
    const playerDirection = new Vector(joystickDirectionRef.current.x, joystickDirectionRef.current.y);
    playerCells.forEach(playerCell => {
        const acceleration = 1;
        const force = playerDirection.multiply(acceleration);
        playerCell.velocity = playerCell.velocity.add(force);

        const maxSpeed = 50 / (playerCell.radius * 0.5 + 10); 
        if (playerCell.velocity.magnitude() > maxSpeed) {
            playerCell.velocity = playerCell.velocity.normalize().multiply(maxSpeed);
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
        
        // Decisão de movimento (a cada 30 frames)
        let decisionTimer = botLogic.decisionTimer.get(botName) || 0;
        if (decisionTimer <= 0) {
            botLogic.findBestTarget(cells, pellets, allCells.filter(c => c.name !== botName), settings.botAggression, botName);
            decisionTimer = 30;
        }
        botLogic.decisionTimer.set(botName, decisionTimer - 1);

        const targetDirection = botLogic.getMovementDirection(botName);
        
        cells.forEach(cell => {
            // 2a. Movimento Coordenado
            const acceleration = 1;
            const force = targetDirection.multiply(acceleration);
            cell.velocity = cell.velocity.add(force);
            
            const maxSpeed = 50 / (cell.radius * 0.5 + 10); 
            if (cell.velocity.magnitude() > maxSpeed) {
                cell.velocity = cell.velocity.normalize().multiply(maxSpeed);
            }
            
            // 2b. Força de Atração (para fusão)
            if (cells.length > 1 && cell.mergeCooldown <= 0) {
                // Calcula o centro de massa do grupo
                const centerOfMass = cells.reduce((sum, c) => sum.add(c.position.multiply(c.mass)), new Vector(0, 0)).multiply(1 / totalMass);
                const attractionVector = centerOfMass.subtract(cell.position).normalize();
                
                // Aplica uma força de atração suave (ajustada pela massa)
                const attractionForce = 0.5 * (avgRadius / cell.radius); 
                cell.velocity = cell.velocity.add(attractionVector.multiply(attractionForce));
            }
            
            // 2c. Lógica de Divisão (se o bot for grande e estiver caçando)
            if (totalMass > MIN_SPLIT_MASS * 2 && cells.length === 1 && Math.random() < settings.botSplitChance) {
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
                
                if (cellA.mergeCooldown <= 0 && cellB.mergeCooldown <= 0) {
                    const dist = cellA.position.subtract(cellB.position).magnitude();
                    if (dist < (cellA.radius + cellB.radius) * 0.8) { 
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
    playerCells.forEach(cell => cell.update());

    // Player cell merging
    for (let i = playerCells.length - 1; i >= 0; i--) {
      for (let j = i - 1; j >= 0; j--) {
        const cellA = playerCells[i];
        const cellB = playerCells[j];
        if (cellA.mergeCooldown <= 0 && cellB.mergeCooldown <= 0) {
          const dist = cellA.position.subtract(cellB.position).magnitude();
          if (dist < (cellA.radius + cellB.radius) * 0.8) { // Require more overlap to merge
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

    // --- 4. Detecção de Colisão (Comer) ---
    
    // Re-cria allCells após fusões
    const currentAllCells: Cell[] = [...playerCells, ...botCells];

    for (let i = currentAllCells.length - 1; i >= 0; i--) {
        for (let j = i - 1; j >= 0; j--) {
            const cellA = currentAllCells[i];
            const cellB = currentAllCells[j];
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
                    if (preyIndexInBots > -1) botCells.splice(preyIndexInBots, 1);
                    
                    // Remove a presa do array temporário currentAllCells
                    currentAllCells.splice(currentAllCells.indexOf(prey), 1);
                    if (currentAllCells.indexOf(predator) < i) i--;
                    if (currentAllCells.indexOf(predator) < j) j--;
                }
            }
        }
    }
    
    // Eating pellets
    for (let i = pellets.length - 1; i >= 0; i--) {
        const pellet = pellets[i];
        for (const cell of currentAllCells) {
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

    // --- 5. Atualização de Câmera e Score ---
    const totalPlayerMass = playerCells.reduce((sum, cell) => sum + cell.mass, 0);
    const initialMass = MIN_CELL_MASS;
    const currentScore = Math.floor(totalPlayerMass - initialMass);
    
    gameInstance.score = currentScore;
    if (currentScore > gameInstance.maxScore) {
        gameInstance.maxScore = currentScore;
    }


    let centerX = WORLD_SIZE / 2;
    let centerY = WORLD_SIZE / 2;
    let avgRadius = MIN_CELL_RADIUS;

    if (playerCells.length > 0) {
        centerX = playerCells.reduce((sum, cell) => sum + cell.position.x * cell.mass, 0) / totalPlayerMass;
        centerY = playerCells.reduce((sum, cell) => sum + cell.position.y * cell.mass, 0) / totalPlayerMass;
        avgRadius = playerCells.reduce((sum, cell) => sum + cell.radius, 0) / playerCells.length;
        
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
    
    // --- 6. Leaderboard Logic ---
    
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
    
    // Draw cells and names
    currentAllCells.sort((a, b) => a.mass - b.mass).forEach(c => {
        c.draw(ctx, c instanceof Player);
    });

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
    const leaderboardHeight = 20 + leaderboardData.length * lineHeight;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(leaderboardX, 50, leaderboardWidth, leaderboardHeight);
    ctx.strokeStyle = '#ccc';
    ctx.strokeRect(leaderboardX, 50, leaderboardWidth, leaderboardHeight);

    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Quicksand';
    ctx.textAlign = 'left';
    ctx.fillText('Top 5', leaderboardX + 10, 70);
    
    ctx.font = '14px Quicksand';
    leaderboardData.forEach((entry, index) => {
        const y = 90 + index * lineHeight; 
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
  }, [difficulty, onGameOver, highScore, gameInstance, playerName, playCollect, playSplit]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const settings = difficultySettings[difficulty];
    
    // Resetar o contador de ID para garantir IDs únicos por jogo
    nextCellId = 1; 
    
    // Initialize Player Cell with Name
    gameInstance.playerCells = [new Player(WORLD_SIZE / 2, WORLD_SIZE / 2, '#2196F3', MIN_CELL_MASS, playerName)];
    
    // Initialize Bots with UNIQUE Names
    const botCount = settings.botCount;
    const baseNames = [...BOT_NAMES];
    
    // Função para embaralhar a lista de nomes
    const shuffleArray = (array: string[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    // Embaralha a lista base
    shuffleArray(baseNames);

    const uniqueBotNames: string[] = [];
    
    for (let i = 0; i < botCount; i++) {
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
    
    const finalBotNames = uniqueBotNames.slice(0, botCount);

    // Inicializa as células de bot como células genéricas com isBot=true
    gameInstance.botCells = Array.from({ length: botCount }, (_, i) => {
        const name = finalBotNames[i];
        
        return new Cell(
            Math.random() * WORLD_SIZE,
            Math.random() * WORLD_SIZE,
            getRandomColor(),
            Math.random() * 2000 + 500,
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
  }, [gameLoop, difficulty, gameInstance, playerName]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', touchAction: 'none' }}>
      <canvas ref={canvasRef} style={{ display: 'block', background: '#fff' }} />
      <VirtualJoystick onMove={handleJoystickMove} />
      <SplitButton onSplit={handleSplit} />
      <Minimap {...minimapData} />
    </div>
  );
};

export default DivideIoGame;