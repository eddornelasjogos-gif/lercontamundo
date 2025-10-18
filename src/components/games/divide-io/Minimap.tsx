import React from 'react';
import { cn } from '@/lib/utils';

const MINIMAP_SIZE = 120; // Tamanho fixo do minimapa em pixels (reduzido em 20%)
const WORLD_SIZE = 3000; // Deve ser o mesmo valor de DivideIoGame.tsx
const SCALE_FACTOR = MINIMAP_SIZE / WORLD_SIZE;

interface MinimapProps {
  playerCenter: { x: number; y: number };
  playerRadius: number; // Recebe o raio real do jogador
  visibleBots: Array<{ x: number; y: number; mass: number; color: string }>;
  className?: string;
}

const Minimap: React.FC<MinimapProps> = ({ playerCenter, playerRadius, visibleBots, className }) => {
  // Função para mapear coordenadas do mundo (0 a WORLD_SIZE) para coordenadas do minimapa (0 a MINIMAP_SIZE)
  const mapToMinimap = (coord: number) => coord * SCALE_FACTOR;

  // Raio do jogador no minimapa é proporcional ao seu raio real
  const minimapPlayerRadius = Math.max(2, playerRadius * SCALE_FACTOR); 
  const botRadius = 2; // Tamanho pequeno e fixo para bots

  return (
    <div
      className={cn(
        // Alterado de top-4 para top-16 para descer o minimapa
        "fixed top-16 left-4 z-40 p-2 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border-2 border-primary/30",
        className
      )}
      style={{ width: MINIMAP_SIZE, height: MINIMAP_SIZE }}
    >
      <svg width={MINIMAP_SIZE} height={MINIMAP_SIZE} viewBox={`0 0 ${MINIMAP_SIZE} ${MINIMAP_SIZE}`}>
        {/* Desenha o fundo do mapa (opcional, mas útil para contexto) */}
        <rect width={MINIMAP_SIZE} height={MINIMAP_SIZE} fill="#f0f0f0" />
        
        {/* Desenha todos os bots ativos */}
        {visibleBots.map((bot, index) => {
          const minimapX = mapToMinimap(bot.x);
          const minimapY = mapToMinimap(bot.y);
          
          // Usa um tamanho fixo para todos os bots
          return (
            <circle
              key={index}
              cx={minimapX}
              cy={minimapY}
              r={botRadius}
              fill={bot.color}
              stroke="#000"
              strokeWidth="0.2"
            />
          );
        })}

        {/* Desenha o jogador (célula principal) */}
        <circle
          cx={mapToMinimap(playerCenter.x)}
          cy={mapToMinimap(playerCenter.y)}
          r={minimapPlayerRadius} // Raio dinâmico
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