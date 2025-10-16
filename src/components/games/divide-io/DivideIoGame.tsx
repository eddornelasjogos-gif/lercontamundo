import React, { useRef, useEffect, useCallback } from 'react';
import { useDivideIoProgress } from '@/hooks/useDivideIoProgress';
import VirtualJoystick from './VirtualJoystick';
import SplitButton from './SplitButton';

type Difficulty = 'easy' | 'medium' | 'hard';

interface DivideIoGameProps {
  difficulty: Difficulty;
  onGameOver: (score: number) => void;
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

  constructor(x: number, y: number, public color: string, initialMass: number) {
    this.position = new Vector(x, y);
    this.mass = initialMass;
    this.radius = this.calculateRadius();
    this.velocity = new Vector(0, 0);
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
    this.position.x = Math.max(this.radius, Math.min(WORLD_SIZE - this.radius, this.position.x));
    this.position.y = Math.max(this.radius, Math.min(WORLD_SIZE - this.radius, this.position.y));
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = Math.max(1, this.radius * 0.05);
    ctx.stroke();
    ctx.closePath();
  }
  
  split(directionVector: Vector) {
    if (this.mass >= MIN_SPLIT_MASS) {
        const splitMass = this.mass / 2;
        this.mass = splitMass;
        this.radius = this.calculateRadius();
        this.mergeCooldown = MERGE_COOLDOWN_FRAMES;
        
        const newCell = new (this.constructor as any)(this.position.x, this.position.y, this.color, splitMass);
        
        // Determine the direction for the impulse
        const direction = directionVector.magnitude() > 0.1
            ? directionVector.normalize()
            : this.velocity.magnitude() > 0.1 
                ? this.velocity.normalize() 
                : new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();

        // Apply impulse to the new cell
        const ejectionImpulse = 30;
        newCell.velocity = this.velocity.add(direction.multiply(ejectionImpulse));
        newCell.mergeCooldown = MERGE_COOLDOWN_FRAMES;
        
        // Apply a slight counter-impulse to the original cell to separate them slightly
        this.velocity = this.velocity.add(direction.multiply(-ejectionImpulse * 0.1));

        return newCell;
    }
    return null;
  }
}

class Player extends Cell {
    split() {
        const joystickVec = new Vector(joystickDirectionRef.current.x, joystickDirectionRef.current.y);
        return super.split(joystickVec);
    }
}

class Bot extends Cell {
  private target: Vector | null = null;
  private threat: Vector | null = null;
  private decisionTimer = 0;

  // Bot split logic uses its current velocity as direction
  botSplit() {
    return super.split(this.velocity);
  }

  updateLogic(pellets: Pellet[], otherCells: Cell[], aggression: number, splitChance: number): Bot | null {
    this.decisionTimer--;
    let newBot: Bot | null = null;

    if (this.decisionTimer <= 0) {
      this.findBestTarget(pellets, otherCells, aggression);
      this.decisionTimer = 30;
    }

    let direction = new Vector(0, 0);
    if (this.threat) {
      direction = this.position.subtract(this.threat).normalize();
    } else if (this.target) {
      direction = this.target.subtract(this.position).normalize();
      if (this.mass > MIN_SPLIT_MASS && Math.random() < splitChance) {
        const targetDist = this.target.subtract(this.position).magnitude();
        if (targetDist < this.radius * 5) {
            newBot = this.botSplit() as Bot;
        }
      }
    }

    const speed = 50 / this.radius;
    this.velocity = direction.multiply(speed);
    super.update();
    
    return newBot;
  }

  findBestTarget(pellets: Pellet[], otherCells: Cell[], aggression: number) {
    this.target = null;
    this.threat = null;
    let bestTarget: Pellet | Cell | null = null;
    let minTargetDist = Infinity;
    let closestThreat: Cell | null = null;
    let minThreatDist = Infinity;

    const perceptionRadius = this.radius * 10;

    for (const cell of otherCells) {
      if (cell === this) continue;
      const dist = this.position.subtract(cell.position).magnitude();
      if (dist > perceptionRadius) continue;

      if (cell.mass > this.mass * 1.1) {
        if (dist < minThreatDist) {
          minThreatDist = dist;
          closestThreat = cell;
        }
      } else if (this.mass > cell.mass * 1.1) {
        if (dist < minTargetDist && Math.random() < aggression) {
          minTargetDist = dist;
          bestTarget = cell;
        }
      }
    }

    if (closestThreat && minThreatDist < this.radius * 3) {
      this.threat = closestThreat.position;
      this.target = null;
      return;
    }

    if (!bestTarget) {
      for (const pellet of pellets) {
        const dist = this.position.subtract(pellet.position).magnitude();
        if (dist < minTargetDist) {
          minTargetDist = dist;
          bestTarget = pellet;
        }
      }
    }
    this.target = bestTarget ? bestTarget.position : null;
  }
}

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

const DivideIoGame: React.FC<DivideIoGameProps> = ({ difficulty, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { highScore } = useDivideIoProgress();
  const animationFrameId = useRef<number>();

  const gameInstance = useRef({
    playerCells: [new Player(WORLD_SIZE / 2, WORLD_SIZE / 2, '#2196F3', MIN_CELL_MASS)],
    bots: [] as Bot[],
    pellets: [] as Pellet[],
    camera: { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2, zoom: 1 },
    score: 0,
  }).current;

  const handleJoystickMove = useCallback((direction: { x: number; y: number }) => {
    joystickDirectionRef.current = direction;
  }, []);

  const handleSplit = useCallback(() => {
    const newCells: Player[] = [];
    const cellsToSplit = [...gameInstance.playerCells];
    cellsToSplit.forEach(cell => {
      const newCell = cell.split();
      if (newCell) {
        newCells.push(newCell as Player);
      }
    });
    gameInstance.playerCells.push(...newCells);
  }, [gameInstance]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { playerCells, bots, pellets, camera } = gameInstance;
    if (playerCells.length === 0) {
      onGameOver(gameInstance.score);
      return;
    }

    const allCells: Cell[] = [...playerCells, ...bots];
    const settings = difficultySettings[difficulty];

    // Apply force to player cells based on joystick
    const direction = new Vector(joystickDirectionRef.current.x, joystickDirectionRef.current.y);
    playerCells.forEach(playerCell => {
        const acceleration = 1;
        const force = direction.multiply(acceleration);
        playerCell.velocity = playerCell.velocity.add(force);

        // Clamp velocity to a max speed
        const maxSpeed = 50 / playerCell.radius;
        if (playerCell.velocity.magnitude() > maxSpeed) {
            playerCell.velocity = playerCell.velocity.normalize().multiply(maxSpeed);
        }
    });

    // Update all cells and handle bot splitting
    const newBots: Bot[] = [];
    allCells.forEach(cell => {
        if (cell instanceof Bot) {
            const newBot = cell.updateLogic(pellets, allCells, settings.botAggression, settings.botSplitChance);
            if (newBot) {
                newBots.push(newBot);
            }
        } else {
            cell.update();
        }
    });
    bots.push(...newBots);


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

    // Collision detection (eating)
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

                const deathDistance = predator.radius - prey.radius * 0.3;
                if (distance < deathDistance) {
                    predator.mass += prey.mass;
                    predator.radius = predator.calculateRadius();
                    
                    const preyIndexInAll = allCells.indexOf(prey);
                    if (preyIndexInAll > -1) {
                      allCells.splice(preyIndexInAll, 1);
                      if (preyIndexInAll < i) i--;
                      if (preyIndexInAll < j) j--;
                    }

                    const preyIndexInPlayer = playerCells.indexOf(prey as Player);
                    if (preyIndexInPlayer > -1) playerCells.splice(preyIndexInPlayer, 1);

                    const preyIndexInBots = bots.indexOf(prey as Bot);
                    if (preyIndexInBots > -1) bots.splice(preyIndexInBots, 1);
                }
            }
        }
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
                break; 
            }
        }
    }
    if (pellets.length < PELLET_COUNT) {
      pellets.push(new Pellet(getRandomColor()));
    }

    gameInstance.score = Math.floor(playerCells.reduce((sum, cell) => sum + cell.mass, 0) - MIN_CELL_MASS * playerCells.length);

    // Update camera to follow center of mass
    if (playerCells.length > 0) {
        const totalMass = playerCells.reduce((sum, cell) => sum + cell.mass, 0);
        const centerX = playerCells.reduce((sum, cell) => sum + cell.position.x * cell.mass, 0) / totalMass;
        const centerY = playerCells.reduce((sum, cell) => sum + cell.position.y * cell.mass, 0) / totalMass;
        const avgRadius = playerCells.reduce((sum, cell) => sum + cell.radius, 0) / playerCells.length;
        
        camera.x += (centerX - camera.x) * 0.1;
        camera.y += (centerY - camera.y) * 0.1;
        camera.zoom = 50 / avgRadius + 0.5;
    }

    // Drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let x = 0; x <= WORLD_SIZE; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD_SIZE); ctx.stroke(); }
    for (let y = 0; y <= WORLD_SIZE; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD_SIZE, y); ctx.stroke(); }

    pellets.forEach(p => p.draw(ctx));
    allCells.sort((a, b) => a.mass - b.mass).forEach(c => c.draw(ctx));

    ctx.restore();

    ctx.fillStyle = '#333';
    ctx.font = 'bold 20px Quicksand';
    ctx.textAlign = 'left';
    ctx.fillText(`Pontuação: ${gameInstance.score}`, 20, 30);
    ctx.textAlign = 'right';
    ctx.fillText(`Recorde: ${highScore}`, canvas.width - 20, 30);

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [difficulty, onGameOver, highScore, gameInstance]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const settings = difficultySettings[difficulty];
    gameInstance.playerCells = [new Player(WORLD_SIZE / 2, WORLD_SIZE / 2, '#2196F3', MIN_CELL_MASS)];
    gameInstance.bots = Array.from({ length: settings.botCount }, () => new Bot(
        Math.random() * WORLD_SIZE,
        Math.random() * WORLD_SIZE,
        getRandomColor(),
        Math.random() * 2000 + 500
    ));
    gameInstance.pellets = Array.from({ length: PELLET_COUNT }, () => new Pellet(getRandomColor()));
    gameInstance.score = 0;

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameLoop, difficulty, gameInstance]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <canvas ref={canvasRef} style={{ display: 'block', background: '#fff' }} />
      <VirtualJoystick onMove={handleJoystickMove} />
      <SplitButton onSplit={handleSplit} />
    </div>
  );
};

export default DivideIoGame;