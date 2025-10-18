import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Bubble, BUBBLE_RADIUS, BUBBLE_COLORS, CANVAS_WIDTH, LAUNCHER_Y, BUBBLE_DIAMETER } from './types';
import { cn } from '@/lib/utils';

interface BubbleLauncherProps {
  nextBubble: Bubble;
  onLaunch: (angleRadians: number) => void;
}

const BubbleLauncher: React.FC<BubbleLauncherProps> = ({ nextBubble, onLaunch }) => {
  const [angle, setAngle] = useState(90); // Ângulo em graus (0 = direita, 90 = cima, 180 = esquerda)
  const launcherRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  
  const launcherX = CANVAS_WIDTH / 2;

  const handleLaunch = useCallback((currentAngle: number) => {
    // Converte graus para radianos (90 graus é 0 radianos, 0 graus é PI/2 radianos)
    // Ajuste para que 90 graus seja para cima (0 radianos)
    const angleRadians = (currentAngle - 90) * (Math.PI / 180);
    onLaunch(angleRadians);
  }, [onLaunch]);

  // --- Mouse/Touch Handlers ---
  
  const handleInteractionStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    
    // Lançamento imediato em mobile (para simplificar a mira)
    if ('touches' in e) {
        handleLaunch(angle);
        isDraggingRef.current = false;
    }
  }, [angle, handleLaunch]);

  const handleInteractionMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    if (launcherRef.current) {
        const rect = launcherRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const dx = clientX - centerX;
        const dy = clientY - centerY;
        
        // Calcula o ângulo em radianos
        let newAngleRadians = Math.atan2(dy, dx);
        
        // Converte para graus (0 a 360)
        let newAngleDegrees = newAngleRadians * (180 / Math.PI);
        
        // Ajusta para que 90 seja para cima (0) e 270 para baixo (180)
        newAngleDegrees = (newAngleDegrees + 360) % 360;
        
        // Queremos apenas o quadrante superior (90 a 270)
        if (newAngleDegrees > 270) {
            newAngleDegrees = 270;
        } else if (newAngleDegrees < 90) {
            newAngleDegrees = 90;
        }
        
        setAngle(newAngleDegrees);
    }
  }, []);

  const handleInteractionEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isDraggingRef.current && !('touches' in e)) {
        handleLaunch(angle);
    }
    isDraggingRef.current = false;
  }, [angle, handleLaunch]);
  
  useEffect(() => {
    // Adiciona listeners globais para arrastar o mouse fora do componente
    window.addEventListener('mousemove', handleInteractionMove as any);
    window.addEventListener('mouseup', handleInteractionEnd as any);
    
    return () => {
      window.removeEventListener('mousemove', handleInteractionMove as any);
      window.removeEventListener('mouseup', handleInteractionEnd as any);
    };
  }, [handleInteractionMove, handleInteractionEnd]);


  // Estilo da linha de mira
  const lineLength = 100;
  const angleRadians = (angle - 90) * (Math.PI / 180);
  
  const lineX = launcherX + Math.sin(angleRadians) * lineLength;
  const lineY = LAUNCHER_Y - Math.cos(angleRadians) * lineLength;

  return (
    <div 
        className="absolute bottom-0 left-0 right-0 h-1/4 pointer-events-none"
        style={{ width: CANVAS_WIDTH, margin: '0 auto' }}
    >
        {/* Linha de Mira (Renderizada via CSS/SVG para simplicidade) */}
        <svg 
            width={CANVAS_WIDTH} 
            height={CANVAS_HEIGHT} 
            className="absolute top-0 left-0 pointer-events-none"
            style={{ transform: `translateY(-${CANVAS_HEIGHT - LAUNCHER_Y}px)` }}
        >
            <line 
                x1={launcherX} 
                y1={LAUNCHER_Y} 
                x2={lineX} 
                y2={lineY} 
                stroke="#fff" 
                strokeWidth="2" 
                strokeDasharray="5, 5"
                className="opacity-70"
            />
        </svg>
        
        {/* Área de Interação (para desktop) */}
        <div 
            ref={launcherRef}
            className="absolute left-1/2 -translate-x-1/2"
            style={{ 
                bottom: 0, 
                width: BUBBLE_DIAMETER * 4, 
                height: BUBBLE_DIAMETER * 4,
                cursor: 'pointer',
                pointerEvents: 'auto',
            }}
            onMouseDown={handleInteractionStart}
            onTouchStart={handleInteractionStart}
            onTouchMove={handleInteractionMove}
            onTouchEnd={handleInteractionEnd}
        >
            {/* Bolha de Lançamento (Visual) */}
            <div
                className={cn(
                    "absolute rounded-full border-4 border-white shadow-lg transition-transform duration-100",
                    nextBubble.color === 'RED' && 'bg-red-500',
                    nextBubble.color === 'PURPLE' && 'bg-purple-500',
                    nextBubble.color === 'BLUE' && 'bg-blue-500',
                    nextBubble.color === 'YELLOW' && 'bg-yellow-500',
                    nextBubble.color === 'GREEN' && 'bg-green-500',
                    nextBubble.color === 'PINK' && 'bg-pink-500',
                )}
                style={{
                    width: BUBBLE_DIAMETER,
                    height: BUBBLE_DIAMETER,
                    left: launcherX - BUBBLE_RADIUS,
                    top: LAUNCHER_Y - BUBBLE_RADIUS,
                    transform: `translateY(-${BUBBLE_RADIUS}px)`, // Ajuste visual
                    pointerEvents: 'none',
                }}
            />
        </div>
    </div>
  );
};

export default BubbleLauncher;