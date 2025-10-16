import React, { useRef, useEffect, useCallback } from 'react';
import { useDivideIoProgress } from '@/hooks/useDivideIoProgress';

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
const PELLET_COUNT = 300;
const MIN_CELL_RADIUS = 10;
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

class Cell {
  public position: Vector;
  public mass: number;
  public radius: number;
  public velocity: Vector;
  public isSplitting = false;
  private splitTimer = 0;

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
    this.position = this.position.add(this.velocity);
    this.position.x = Math.max(this.radius, Math.min(WORLD_SIZE - this.radius, this.position.x));
    this.position.y = Math.max(this.radius, Math.min(WORLD_SIZE - this.radius, this.position.y));
    
    if (this.isSplitting) {
        this.splitTimer--;
        if (this.splitTimer <= 0) {
            this.isSplitting = false;
        }
    }
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
  
  split() {
    if (this.mass >= MIN_CELL_RADIUS * MIN_CELL_RADIUS && !this.isSplitting) {
        this.isSplitting = true;
        this.splitTimer = 30; // Cooldown frames
        const splitMass = this.mass / 2;
        this.mass = splitMass;
        this.radius = this.calculateRadius();
        
        const newCell = new (this.constructor as any)(this.position.x, this.position.y, this.color, splitMass);
        const direction = this.velocity.normalize();
        newCell.velocity = direction.multiply(15); // Propel the new cell
        return newCell;
    }
    return null;
  }
}

class Player extends Cell {
  constructor(x: number, y: number, color: string) {
    super(x, y, color, MIN_CELL_RADIUS * MIN_CELL_RADIUS);
  }
}

class Bot extends Cell {
  private target: Vector | null = null;
  private threat: Vector | null = null;
  private decisionTimer = 0;

  constructor(x: number, y: number, color: string, mass: number) {
    super(x, y, color, mass);
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

      if (cell.mass > this.mass * 1.1) { // It's a threat
        if (dist < minThreatDist) {
          minThreatDist = dist;
          closestThreat = cell;
        }
      } else if (this.mass > cell.mass * 1.1) { // It's prey
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

  updateLogic(pellets: Pellet[], otherCells: Cell[], aggression: number, splitChance: number) {
    this.decisionTimer--;
    if (this.decisionTimer <= 0) {
      this.findBestTarget(pellets, otherCells, aggression);
      this.decisionTimer = 30; // Re-evaluate every 0.5 seconds
    }

    let direction = new Vector(0, 0);
    if (this.threat) {
      direction = this.position.subtract(this.threat).normalize();
    } else if (this.target) {
      direction = this.target.subtract(this.position).normalize();
      if (this.mass > MIN_CELL_RADIUS * MIN_CELL_RADIUS * 4 && Math.random() < splitChance) {
        const targetDist = this.target.subtract(this.position).magnitude();
        if (targetDist < this.radius * 5) {
            const newBot = this.split();
            if (newBot) otherCells.push(newBot);
        }
      }
    }

    const speed = 50 / this.radius;
    this.velocity = direction.multiply(speed);
    super.update();
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
  const mousePos = useRef({ x: 0, y: 0 });

  const gameInstance = useRef({
    player: new Player(WORLD_SIZE / 2, WORLD_SIZE / 2, '#2196F3'),
    bots: [] as Bot[],
    pellets: [] as Pellet[],
    camera: { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2, zoom: 1 },
    score: 0,
  }).current;

  const handleMouseMove = (event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mousePos.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handleTouchMove = (event: TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || event.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    mousePos.current = { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top };
  };

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { player, bots, pellets, camera } = gameInstance;
    const allCells = [player, ...bots];
    const settings = difficultySettings[difficulty];

    // Update player velocity
    const screenCenter = new Vector(canvas.width / 2, canvas.height / 2);
    const mouseVector = new Vector(mousePos.current.x, mousePos.current.y);
    const direction = mouseVector.subtract(screenCenter).normalize();
    const speed = 50 / player.radius;
    player.velocity = direction.multiply(speed);

    // Update all cells
    allCells.forEach(cell => {
        if (cell instanceof Bot) {
            cell.updateLogic(pellets, allCells, settings.botAggression, settings.botSplitChance);
        } else {
            cell.update();
        }
    });

    // Collision detection
    for (let i = allCells.length - 1; i >= 0; i--) {
        for (let j = allCells.length - 1; j >= 0; j--) {
            if (i === j) continue;
            const cellA = allCells[i];
            const cellB = allCells[j];
            if (!cellA || !cellB) continue;

            const distVec = cellA.position.subtract(cellB.position);
            const distance = distVec.magnitude();

            if (distance < cellA.radius + cellB.radius) {
                if (cellA.mass > cellB.mass * 1.1) {
                    cellA.mass += cellB.mass;
                    cellA.radius = cellA.calculateRadius();
                    if (cellB === player) {
                        onGameOver(gameInstance.score);
                        return;
                    }
                    allCells.splice(j, 1);
                    bots.splice(bots.indexOf(cellB as Bot), 1);
                    if (i > j) i--;
                }
            }
        }
    }
    
    // Eating pellets
    for (let i = pellets.length - 1; i >= 0; i--) {
        const pellet = pellets[i];
        allCells.forEach(cell => {
            const dist = cell.position.subtract(pellet.position).magnitude();
            if (dist < cell.radius) {
                cell.mass += 10;
                cell.radius = cell.calculateRadius();
                pellets.splice(i, 1);
                pellets.push(new Pellet(getRandomColor()));
                if (cell === player) {
                    gameInstance.score = Math.floor(player.mass - (MIN_CELL_RADIUS * MIN_CELL_RADIUS));
                }
            }
        });
    }

    // Update camera
    camera.x += (player.position.x - camera.x) * 0.1;
    camera.y += (player.position.y - camera.y) * 0.1;
    camera.zoom = 50 / player.radius + 0.5;

    // Drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    // Draw grid
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let x = 0; x <= WORLD_SIZE; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, WORLD_SIZE);
        ctx.stroke();
    }
    for (let y = 0; y <= WORLD_SIZE; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WORLD_SIZE, y);
        ctx.stroke();
    }

    pellets.forEach(p => p.draw(ctx));
    allCells.sort((a, b) => a.mass - b.mass).forEach(c => c.draw(ctx));

    ctx.restore();

    // Draw HUD
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

    // Initialize game state
    const settings = difficultySettings[difficulty];
    gameInstance.player = new Player(WORLD_SIZE / 2, WORLD_SIZE / 2, '#2196F3');
    gameInstance.bots = Array.from({ length: settings.botCount }, () => new Bot(
        Math.random() * WORLD_SIZE,
        Math.random() * WORLD_SIZE,
        getRandomColor(),
        Math.random() * 2000 + 500
    ));
    gameInstance.pellets = Array.from({ length: PELLET_COUNT }, () => new Pellet(getRandomColor()));
    gameInstance.score = 0;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gameLoop, difficulty, gameInstance]);

  return <canvas ref={canvasRef} style={{ display: 'block', background: '#fff' }} />;
};

export default DivideIoGame;