import { Vector } from './Vector';

export class Cell {
  public position: Vector;
  public mass: number;
  public radius: number;
  public velocity: Vector;
  public mergeCooldown = 0;
  public name: string;
  public id: number; 
  public isBot: boolean = false;

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
    return Math.sqrt(this.mass / Math.PI) * 4; // Assuming MASS_TO_RADIUS_RATIO = 4
  }

  update() {
    if (this.mergeCooldown > 0) {
      this.mergeCooldown--;
    }
    this.velocity = this.velocity.multiply(0.92);
    this.position = this.position.add(this.velocity);
    
    const center = new Vector(1500, 1500); // Assuming WORLD_CENTER_X/Y = 1500
    const distanceFromCenter = this.position.subtract(center).magnitude();
    if (distanceFromCenter + this.radius > 1500) { // Assuming WORLD_RADIUS = 1500
      const direction = this.position.subtract(center).normalize();
      this.position = center.add(direction.multiply(1500 - this.radius));
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
    if (this.mass >= 200) { // Assuming MIN_SPLIT_MASS = 200
        const splitMass = this.mass / 2;
        this.mass = splitMass;
        this.radius = this.calculateRadius();
        this.mergeCooldown = 300; // Assuming MERGE_COOLDOWN_FRAMES = 300
        
        const direction = directionVector.magnitude() > 0.1
            ? directionVector.normalize()
            : this.velocity.magnitude() > 0.1
            ? this.velocity.normalize()
            : new Vector(Math.random() - 0.5, Math.random() - 0.5).normalize();
        
        const newCell = new Cell(
            this.position.x + direction.x * this.radius * 1.5,
            this.position.y + direction.y * this.radius * 1.5,
            this.color,
            splitMass,
            this.name,
            nextCellId,
            this.isBot
        );
        newCell.velocity = direction.multiply(-250 / splitMass); // Assuming EJECTION_IMPULSE = 250
        return newCell;
    }
    return null;
  }
}