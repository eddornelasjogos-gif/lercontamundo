import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import heroBgImage from '@/assets/hero-bg.jpg';

const MINIMAP_SIZE = 120; // Tamanho fixo do minimapa em pixels
const WORLD_SIZE = 3000;
const WORLD_CENTER_X = WORLD_SIZE / 2;
const WORLD_CENTER_Y = WORLD_SIZE / 2;
const WORLD_RADIUS = WORLD_SIZE / 2;
const SCALE_FACTOR = MINIMAP_SIZE / WORLD_SIZE;

interface MinimapProps {
  playerCenter: { x: number; y: number };
  playerRadius: number; // Recebe o raio médio real do jogador
  visibleBots: Array<{ x: number; y: number; mass: number; color: string; radius: number }>; // Inclui o raio do bot
  className?: string;
}

const Minimap: React.FC<MinimapProps> = ({ playerCenter, playerRadius, visibleBots, className }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = heroBgImage;
    img.onload = () => {
      imgRef.current = img;
      setIsImageLoaded(true);
    };
  }, []);

  // Função para mapear coordenadas do mundo (0 a WORLD_SIZE) para coordenadas do minimapa (0 a MINIMAP_SIZE)
  const mapToMinimap = (coord: number) => coord * SCALE_FACTOR;

  // Função para verificar se está dentro do raio circular do mundo
  const isWithinWorldBounds = (x: number, y: number, radius: number) => {
    const distanceFromCenter = Math.sqrt(
      Math.pow(x - WORLD_CENTER_X, 2) + Math.pow(y - WORLD_CENTER_Y, 2)
    );
    return distanceFromCenter + radius <= WORLD_RADIUS;
  };

  return (
    <div
      className={cn(
        "fixed top-16 left-4 z-40 p-2 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border-2 border-primary/30",
        className
      )}
      style={{ width: MINIMAP_SIZE, height: MINIMAP_SIZE }}
    >
      <svg width={MINIMAP_SIZE} height={MINIMAP_SIZE} viewBox={`0 0 ${MINIMAP_SIZE} ${MINIMAP_SIZE}`}>
        <defs>
          {/* Pattern for background image */}
          <pattern
            id="bgPattern"
            patternUnits="userSpaceOnUse"
            width={MINIMAP_SIZE}
            height={MINIMAP_SIZE}
            preserveAspectRatio="none"
          >
            <image
              href={heroBgImage}
              width={MINIMAP_SIZE}
              height={MINIMAP_SIZE}
              opacity="0.6"
            />
          </pattern>
        </defs>
        
        {/* Background image using pattern */}
        {isImageLoaded && (
          <circle 
            cx={MINIMAP_SIZE / 2} 
            cy={MINIMAP_SIZE / 2} 
            r={MINIMAP_SIZE / 2} 
            fill="url(#bgPattern)"
          />
        )}
        
        {/* Fallback para cor de fundo se a imagem não carregar */}
        {!isImageLoaded && (
          <circle 
            cx={MINIMAP_SIZE / 2} 
            cy={MINIMAP_SIZE / 2} 
            r={MINIMAP_SIZE / 2} 
            fill="#f0f0f0" 
          />
        )}
        
        {/* Borda circular do minimapa */}
        <circle 
          cx={MINIMAP_SIZE / 2} 
          cy={MINIMAP_SIZE / 2} 
          r={MINIMAP_SIZE / 2} 
          fill="none" 
          stroke="#333" 
          strokeWidth="2" 
        />
        
        {/* Desenha todos os bots visíveis (apenas se dentro dos limites circulares) */}
        {visibleBots.map((bot, index) => {
          const minimapX = mapToMinimap(bot.x);
          const minimapY = mapToMinimap(bot.y);
          const minimapRadius = mapToMinimap(bot.radius);
          
          // Verifica se o bot está dentro dos limites circulares do mundo
          if (isWithinWorldBounds(bot.x, bot.y, bot.radius)) {
            return (
              <circle
                key={index}
                cx={minimapX}
                cy={minimapY}
                r={Math.max(1, minimapRadius)} // Raio mínimo de 1px
                fill={bot.color}
                stroke="#000"
                strokeWidth="0.5"
              />
            );
          }
          return null;
        })}

        {/* Desenha o jogador (célula principal) */}
        <circle
          cx={mapToMinimap(playerCenter.x)}
          cy={mapToMinimap(playerCenter.y)}
          r={Math.max(2, mapToMinimap(playerRadius))} // Raio dinâmico
          fill="#2196F3" // Cor do jogador
          stroke="#000"
          strokeWidth="1"
        />
        
      </svg>
    </div>
  );
};

export default Minimap;