import { Cell } from "@/components/games/divide-io/Cell";
import { Player } from "@/components/games/divide-io/Player";
import { Pellet } from "@/components/games/divide-io/Pellet";

const SESSION_STORAGE_KEY = 'divide-io-temp-state';

export interface SavedCellData {
  x: number;
  y: number;
  mass: number;
  color: string;
  name: string;
  id: number;
}

interface SavedPelletData {
  x: number;
  y: number;
  color: string;
}

export interface SavedGameState {
  playerCells: SavedCellData[];
  botCells: SavedCellData[];
  pellets: SavedPelletData[];
  camera: { x: number; y: number; zoom: number };
  score: number;
  maxScore: number;
}

/**
 * Salva o estado atual do jogo no sessionStorage.
 */
export const saveGameState = (
  playerCells: Player[], 
  botCells: Cell[], 
  pellets: Pellet[], 
  camera: { x: number; y: number; zoom: number }, 
  score: number, 
  maxScore: number
) => {
  const savedState: SavedGameState = {
    playerCells: playerCells.map(c => ({
      x: c.position.x,
      y: c.position.y,
      mass: c.mass,
      color: c.color,
      name: c.name,
      id: c.id,
    })),
    botCells: botCells.map(c => ({
      x: c.position.x,
      y: c.position.y,
      mass: c.mass,
      color: c.color,
      name: c.name,
      id: c.id,
    })),
    pellets: pellets.map(p => ({
      x: p.x,
      y: p.y,
      color: p.color,
    })),
    camera,
    score,
    maxScore,
  };
  
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(savedState));
  } catch (e) {
    console.error("Erro ao salvar estado do jogo:", e);
  }
};

/**
 * Carrega o estado do jogo do sessionStorage.
 */
export const loadGameState = (): SavedGameState | null => {
  try {
    const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as SavedGameState;
    }
  } catch (e) {
    console.error("Erro ao carregar estado do jogo:", e);
  }
  return null;
};

/**
 * Limpa o estado temporário do jogo.
 */
export const clearGameState = () => {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
};