import React from 'react';
import { cn } from '@/lib/utils';

const MINIMAP_SIZE = 150; // Tamanho fixo do minimapa em pixels
const WORLD_SIZE = 3000; // Deve ser o mesmo valor de DivideIoGame.tsx

interface MinimapProps {
  playerCenter: { x: number; y: number };
  playerMass: number;
  visibleBots: Array<{ x: number; y: number; mass: number; color: string }>;
  className?: string;
}

const Minimap: React.FC<MinimapProps> = ({ playerCenter, playerMass, visibleBots, className }) => {
  // Função para mapear coordenadas do mundo (0 a WORLD_SIZE) para coordenadas do minimapa (0 a MINIMAP_SIZE)
  const mapToMinimap = (coord: number) => (coord / WORLD_SIZE) * MINIMAP_SIZE;

  // Calcula o raio do jogador no minimapa (fixo para visibilidade)
  const playerRadius = 5; 

  return (
    <div
      className={cn(
        // Alterado de top-20 para bottom-20
        "fixed bottom-20 left-4 z-40 p-2 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border-2 border-primary/30",
        className
      )}
      style={{ width: MINIMAP_SIZE, height: MINIMAP_SIZE }}
    >
      <svg width={MINIMAP_SIZE} height={MINIMAP_SIZE} viewBox={`0 0 ${MINIMAP_SIZE} ${MINIMAP_SIZE}`}>
        {/* Desenha o fundo do mapa (opcional, mas útil para contexto) */}
        <rect width={MINIMAP_SIZE} height={MINIMAP_SIZE} fill="#f0f0f0" />
        
        {/* Desenha os bots visíveis (maiores que o jogador) */}
        {visibleBots.map((bot, index) => {
          const minimapX = mapToMinimap(bot.x);
          const minimapY = mapToMinimap(bot.y);
          
          // O tamanho do bot no minimapa é proporcional à sua massa em relação ao jogador, mas limitado
          const relativeSize = Math.min(10, (bot.mass / playerMass) * 2);
          
          return (
            <circle
              key={index}
              cx={minimapX}
              cy={minimapY}
              r={relativeSize}
              fill={bot.color}
              stroke="#000"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Desenha o jogador (célula principal) */}
        <circle
          cx={mapToMinimap(playerCenter.x)}
          cy={mapToMinimap(playerCenter.y)}
          r={playerRadius}
          fill="#2196F3" // Cor do jogador
          stroke="#000"
          strokeWidth="1"
        />
        
        {/* Desenha a borda do minimapa */}
        <rect 
            x="0" 
            y="0" 
            width={MINIMAP_SIZE} 
            height={MINIMAP_SIZE} 
            fill="none" 
            stroke="#333" 
            strokeWidth="2" 
        />
      </svg>
    </div>
  );
};

export default Minimap;