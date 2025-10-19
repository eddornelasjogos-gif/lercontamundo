import { Vector } from './Vector';
import { Cell } from './Cell';

export class Player extends Cell {
  constructor(x: number, y: number, initialMass: number, name: string, id: number) {
    super(x, y, '#2196F3', initialMass, name, id, false);
  }
}