import { Vector } from './Vector';
import { Cell, getRandomColor } from './Cell'; // Import getRandomColor from Cell

export class Bot extends Cell {
  constructor(x: number, y: number, mass: number, name: string, id: number) {
    super(x, y, getRandomColor(), mass, name, id, true); // Pass true for isBot to Cell constructor
  }

  // This update method is specific to Bot's AI, it calls the super.update() for basic movement
  updateAI(playerPosition: Vector, playerRadius: number, botAggression: number) {
    super.update(); // Call the base Cell update for general movement

    const distanceToPlayer = this.position.subtract(playerPosition).magnitude();
    const combinedRadius = this.radius + playerRadius;
    
    if (distanceToPlayer < combinedRadius * 1.5) {
      // Foge do jogador se muito próximo
      const fleeDirection = this.position.subtract(playerPosition).normalize();
      this.velocity = this.velocity.add(fleeDirection.multiply(botAggression * 0.5));
    } else if (distanceToPlayer < 300 && this.mass > playerRadius * 1.2) {
      // Persegue o jogador se maior e próximo
      const pursueDirection = playerPosition.subtract(this.position).normalize();
      this.velocity = this.velocity.add(pursueDirection.multiply(botAggression));
    } else {
      // Movimento aleatório
      if (Math.random() < 0.02) {
        const randomAngle = Math.random() * Math.PI * 2;
        this.velocity = new Vector(
          Math.cos(randomAngle) * 50,
          Math.sin(randomAngle) * 50
        );
      }
    }
    
    // Limita velocidade máxima
    const maxSpeed = 4;
    const currentSpeed = this.velocity.magnitude();
    if (currentSpeed > maxSpeed) {
      this.velocity = this.velocity.multiply(maxSpeed / currentSpeed);
    }
  }
}