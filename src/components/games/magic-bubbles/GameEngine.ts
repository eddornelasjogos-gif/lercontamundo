import { 
    Bubble, 
    BubbleColor, 
    BUBBLE_COLORS, 
    BUBBLE_RADIUS, 
    BUBBLE_DIAMETER, 
    GRID_COLS, 
    GRID_ROWS, 
    CANVAS_WIDTH, 
    CANVAS_HEIGHT,
    GameSettings
} from './types';

let nextBubbleId = 0;

const getNextBubbleId = () => nextBubbleId++;

// --- Grid Utilities (Simplified Square Grid) ---

// Converte coordenadas de grade (col, row) para coordenadas de mundo (x, y)
export const gridToWorld = (col: number, row: number) => {
    const x = col * BUBBLE_DIAMETER + BUBBLE_RADIUS;
    const y = row * BUBBLE_DIAMETER + BUBBLE_RADIUS;
    return { x, y };
};

// Converte coordenadas de mundo (x, y) para coordenadas de grade (col, row)
export const worldToGrid = (x: number, y: number) => {
    const col = Math.round((x - BUBBLE_RADIUS) / BUBBLE_DIAMETER);
    const row = Math.round((y - BUBBLE_RADIUS) / BUBBLE_DIAMETER);
    return { col, row };
};

// --- Game State Management ---

export interface GameState {
    grid: (Bubble | null)[][];
    shootingBubble: Bubble | null;
    nextBubble: Bubble;
    score: number;
    isGameOver: boolean;
    isGameWon: boolean;
    settings: GameSettings;
}

const getRandomColor = (colorCount: number): BubbleColor => {
    const colors = Object.keys(BUBBLE_COLORS) as BubbleColor[];
    const availableColors = colors.slice(0, colorCount);
    return availableColors[Math.floor(Math.random() * availableColors.length)];
};

const createBubble = (x: number, y: number, color: BubbleColor, isFixed: boolean = false): Bubble => ({
    id: getNextBubbleId(),
    x,
    y,
    color,
    radius: BUBBLE_RADIUS,
    isFixed,
    isFalling: false,
    velocity: { x: 0, y: 0 },
});

export const initializeGrid = (settings: GameSettings): (Bubble | null)[][] => {
    const grid: (Bubble | null)[][] = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));
    
    for (let r = 0; r < settings.rows; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            if (Math.random() < 0.7) { // Preenche 70% das bolhas iniciais
                const color = getRandomColor(settings.colorCount);
                const { x, y } = gridToWorld(c, r);
                const bubble = createBubble(x, y, color, true);
                bubble.gridX = c;
                bubble.gridY = r;
                grid[r][c] = bubble;
            }
        }
    }
    return grid;
};

export const initializeGameState = (settings: GameSettings): GameState => {
    const grid = initializeGrid(settings);
    const nextBubbleColor = getRandomColor(settings.colorCount);
    
    return {
        grid,
        shootingBubble: null,
        nextBubble: createBubble(CANVAS_WIDTH / 2, CANVAS_HEIGHT - BUBBLE_RADIUS, nextBubbleColor),
        score: 0,
        isGameOver: false,
        isGameWon: false,
        settings,
    };
};

// --- Core Game Logic ---

// Encontra bolhas conectadas da mesma cor (usando BFS)
const findConnectedBubbles = (grid: (Bubble | null)[][], startBubble: Bubble): Bubble[] => {
    const queue: Bubble[] = [startBubble];
    const visited = new Set<number>();
    const matches: Bubble[] = [];
    
    if (startBubble.gridX === undefined || startBubble.gridY === undefined) return [];
    
    visited.add(startBubble.id);
    matches.push(startBubble);

    const checkNeighbors = (col: number, row: number) => {
        // Simplificado: verifica 4 vizinhos (cima, baixo, esquerda, direita)
        const neighbors = [
            { c: col + 1, r: row }, { c: col - 1, r: row },
            { c: col, r: row + 1 }, { c: col, r: row - 1 },
        ];
        
        for (const { c, r } of neighbors) {
            if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
                const neighbor = grid[r][c];
                if (neighbor && !visited.has(neighbor.id) && neighbor.color === startBubble.color) {
                    visited.add(neighbor.id);
                    queue.push(neighbor);
                    matches.push(neighbor);
                }
            }
        }
    };
    
    let head = 0;
    while (head < queue.length) {
        const current = queue[head++];
        checkNeighbors(current.gridX!, current.gridY!);
    }
    
    return matches;
};

// Encontra todas as bolhas que não estão conectadas ao topo (usando BFS reverso)
const findFloatingBubbles = (grid: (Bubble | null)[][]): Bubble[] => {
    const connectedToTop = new Set<number>();
    const queue: Bubble[] = [];
    
    // 1. Inicializa a fila com todas as bolhas na primeira linha
    for (let c = 0; c < GRID_COLS; c++) {
        const bubble = grid[0][c];
        if (bubble) {
            queue.push(bubble);
            connectedToTop.add(bubble.id);
        }
    }
    
    // 2. BFS para encontrar todas as bolhas conectadas ao topo
    let head = 0;
    while (head < queue.length) {
        const current = queue[head++];
        const col = current.gridX!;
        const row = current.gridY!;
        
        const neighbors = [
            { c: col + 1, r: row }, { c: col - 1, r: row },
            { c: col, r: row + 1 }, { c: col, r: row - 1 },
        ];
        
        for (const { c, r } of neighbors) {
            if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
                const neighbor = grid[r][c];
                if (neighbor && !connectedToTop.has(neighbor.id)) {
                    connectedToTop.add(neighbor.id);
                    queue.push(neighbor);
                }
            }
        }
    }
    
    // 3. Coleta todas as bolhas que NÃO estão conectadas ao topo
    const floating: Bubble[] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const bubble = grid[r][c];
            if (bubble && !connectedToTop.has(bubble.id)) {
                floating.push(bubble);
            }
        }
    }
    
    return floating;
};


// Processa a colisão da bolha de tiro com a grade ou parede
export const processCollision = (state: GameState, onPop: (count: number) => void): GameState => {
    const { shootingBubble, grid } = state;
    if (!shootingBubble) return state;

    // 1. Colisão com o topo
    if (shootingBubble.y <= BUBBLE_RADIUS) {
        shootingBubble.y = BUBBLE_RADIUS;
        const { col, row } = worldToGrid(shootingBubble.x, shootingBubble.y);
        return finalizeShot(state, col, 0, onPop);
    }

    // 2. Colisão com a grade
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const fixedBubble = grid[r][c];
            if (fixedBubble) {
                const dx = shootingBubble.x - fixedBubble.x;
                const dy = shootingBubble.y - fixedBubble.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < BUBBLE_DIAMETER) {
                    // Colisão detectada. Encontra o ponto de fixação mais próximo na grade.
                    
                    // Calcula a posição ideal de fixação
                    const targetX = shootingBubble.x + (BUBBLE_DIAMETER / distance) * dx;
                    const targetY = shootingBubble.y + (BUBBLE_DIAMETER / distance) * dy;
                    
                    const { col, row } = worldToGrid(targetX, targetY);
                    
                    // Tenta fixar na posição calculada
                    return finalizeShot(state, col, row, onPop);
                }
            }
        }
    }

    return state;
};

// Finaliza o tiro, fixa a bolha, verifica explosões e quedas
const finalizeShot = (state: GameState, col: number, row: number, onPop: (count: number) => void): GameState => {
    const { grid, shootingBubble, settings } = state;
    if (!shootingBubble) return state;

    // Garante que a posição de fixação esteja dentro dos limites e vazia
    if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS || grid[row][col]) {
        // Se a posição estiver ocupada ou fora dos limites, tenta encontrar a célula vazia mais próxima
        
        // Se a bolha colidiu com o topo (row=0), mas a célula [0][col] está ocupada,
        // o jogo deve empurrar a grade para baixo ou considerar Game Over.
        if (row === 0 && grid[row][col]) {
            return { ...state, isGameOver: true, shootingBubble: null };
        }
        
        // Para colisões na grade, se a célula calculada estiver ocupada,
        // vamos apenas usar a célula do vizinho que causou a colisão (simplificação extrema)
        // Para evitar bugs complexos de grade, vamos apenas retornar se a célula calculada estiver ocupada.
        if (grid[row][col]) {
             // Se a célula calculada estiver ocupada, tentamos a célula acima
             if (row > 0 && !grid[row - 1][col]) {
                 row = row - 1;
             } else {
                 // Se não houver espaço, Game Over (ou apenas ignora o tiro, mas Game Over é mais punitivo)
                 return { ...state, isGameOver: true, shootingBubble: null };
             }
        }
    }
    
    // Fixa a bolha na grade
    const { x, y } = gridToWorld(col, row);
    shootingBubble.x = x;
    shootingBubble.y = y;
    shootingBubble.isFixed = true;
    shootingBubble.velocity = { x: 0, y: 0 };
    shootingBubble.gridX = col;
    shootingBubble.gridY = row;
    grid[row][col] = shootingBubble;

    // 1. Verifica explosões
    const matches = findConnectedBubbles(grid, shootingBubble);
    let newScore = state.score;
    let bubblesPopped = 0;

    if (matches.length >= 3) {
        matches.forEach(b => {
            if (b.gridY !== undefined && b.gridX !== undefined) {
                grid[b.gridY][b.gridX] = null;
                bubblesPopped++;
            }
        });
        newScore += bubblesPopped * 10;
        onPop(bubblesPopped);

        // 2. Verifica bolhas flutuantes (reação em cadeia)
        const floating = findFloatingBubbles(grid);
        floating.forEach(b => {
            if (b.gridY !== undefined && b.gridX !== undefined) {
                grid[b.gridY][b.gridX] = null;
                b.isFalling = true;
                b.isFixed = false;
                b.velocity = { x: Math.random() * 4 - 2, y: Math.random() * 4 + 2 };
                newScore += 5; // Bônus por queda
            }
        });
    }
    
    // 3. Verifica condição de vitória (grade limpa)
    const isGameWon = grid.flat().every(b => b === null || b.isFalling);

    // 4. Prepara a próxima bolha
    const nextBubbleColor = getRandomColor(settings.colorCount);
    const nextBubble = createBubble(CANVAS_WIDTH / 2, CANVAS_HEIGHT - BUBBLE_RADIUS, nextBubbleColor);

    return {
        ...state,
        grid,
        shootingBubble: null,
        nextBubble,
        score: newScore,
        isGameWon,
    };
};

// --- Game Loop Update ---

export const updateGame = (state: GameState, deltaTime: number): GameState => {
    const { shootingBubble, grid } = state;
    
    // 1. Atualiza bolha de tiro
    if (shootingBubble) {
        shootingBubble.x += shootingBubble.velocity.x * deltaTime;
        shootingBubble.y += shootingBubble.velocity.y * deltaTime;

        // Colisão com paredes laterais
        if (shootingBubble.x - BUBBLE_RADIUS < 0 || shootingBubble.x + BUBBLE_RADIUS > CANVAS_WIDTH) {
            shootingBubble.velocity.x *= -1;
            // Garante que a bolha não fique presa na parede
            if (shootingBubble.x - BUBBLE_RADIUS < 0) shootingBubble.x = BUBBLE_RADIUS;
            if (shootingBubble.x + BUBBLE_RADIUS > CANVAS_WIDTH) shootingBubble.x = CANVAS_WIDTH - BUBBLE_RADIUS;
        }
    }
    
    // 2. Atualiza bolhas caindo
    const fallingBubbles = grid.flat().filter(b => b && b.isFalling) as Bubble[];
    
    fallingBubbles.forEach(b => {
        // Aplica gravidade
        b.velocity.y += 0.5; 
        b.x += b.velocity.x * deltaTime;
        b.y += b.velocity.y * deltaTime;
    });
    
    // Remove bolhas que caíram para fora da tela
    const activeBubbles = grid.flat().filter(b => b && !b.isFalling) as Bubble[];
    // Filtra as bolhas caindo que ainda estão visíveis (para a próxima renderização)
    const remainingFallingBubbles = fallingBubbles.filter(b => b.y < CANVAS_HEIGHT + BUBBLE_RADIUS);
    
    // Reconstroi a grade (apenas para manter a tipagem, mas as bolhas caindo não estão mais na grade)
    const newGrid = state.grid.map(row => row.map(cell => {
        if (cell && cell.isFalling) return null;
        return cell;
    }));
    
    // 3. Verifica Game Over (bolhas atingem o limite inferior)
    const BUBBLE_DIAMETER = BUBBLE_RADIUS * 2;
    const gameOverThreshold = CANVAS_HEIGHT - BUBBLE_DIAMETER * 2; // Linha de Game Over
    
    const hitThreshold = activeBubbles.some(b => b.y > gameOverThreshold);
    
    if (hitThreshold) {
        return { ...state, isGameOver: true };
    }

    return { 
        ...state, 
        grid: newGrid,
        // Nota: As bolhas caindo precisam ser gerenciadas fora da grade para renderização,
        // mas como o estado é passado por referência no React, precisamos garantir que
        // a lista de bolhas caindo seja atualizada corretamente.
        // Para simplificar, vamos garantir que a renderização as pegue do grid.flat()
    };
};

// --- Lançamento ---

export const launchBubble = (state: GameState, angleRadians: number, speed: number): GameState => {
    if (state.shootingBubble) return state; // Já tem uma bolha em voo

    const newShootingBubble = {
        ...state.nextBubble,
        velocity: {
            x: Math.sin(angleRadians) * speed,
            y: -Math.cos(angleRadians) * speed,
        },
    };
    
    // Prepara a próxima bolha
    const nextBubbleColor = getRandomColor(state.settings.colorCount);
    const nextBubble = createBubble(CANVAS_WIDTH / 2, CANVAS_HEIGHT - BUBBLE_RADIUS, nextBubbleColor);

    return {
        ...state,
        shootingBubble: newShootingBubble,
        nextBubble,
    };
};