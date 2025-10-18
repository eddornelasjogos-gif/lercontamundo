import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Bubble, BUBBLE_RADIUS, BUBBLE_COLORS, CANVAS_WIDTH, LAUNCHER_Y, BUBBLE_DIAMETER, CANVAS_HEIGHT } from './types';
import { cn } from '@/lib/utils';

interface BubbleLauncherProps {
  nextBubble: Bubble;
  onLaunch: (angleRadians: number) => void;
}

const BubbleLauncher: React.FC<BubbleLauncherProps> = ({ nextBubble, onLaunch }) => {
  const [aimAngle, setAimAngle] = useState(Math.PI / 2); // 90 degrees (straight up)
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + CANVAS_WIDTH / 2;
    const centerY = rect.top + CANVAS_HEIGHT; // O lançador está na base do canvas

    // Calcula o ângulo em relação ao centro do lançador
    const dx = clientX - centerX;
    const dy = clientY - centerY;

    let angle = Math.atan2(dx, -dy); // atan2(x, y) para ângulo em relação ao eixo Y positivo

    // Limita o ângulo entre 10 graus (0.17 rad) e 170 graus (2.97 rad)
    const minAngle = Math.PI * 0.05;
    const maxAngle = Math.PI * 0.95;
    
    angle = Math.max(minAngle, Math.min(maxAngle, angle));

    setAimAngle(angle);
  }, []);

  const handleInteractionStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    handlePointerMove(clientX, clientY);
  }, [handlePointerMove]);

  const handleInteractionMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    handlePointerMove(clientX, clientY);
  }, [isDragging, handlePointerMove]);

  const handleInteractionEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      setIsDragging(false);
      onLaunch(aimAngle);
    }
  }, [isDragging, onLaunch, aimAngle]);

  // Desenho da mira
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !isDragging) {
        // Limpa o canvas se não estiver arrastando
        ctx?.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        return;
    }

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const startX = CANVAS_WIDTH / 2;
    const startY = CANVAS_HEIGHT;
    
    // Calcula o ponto final da mira
    const lineLength = 150;
    const endX = startX + Math.sin(aimAngle) * lineLength;
    const endY = startY - Math.cos(aimAngle) * lineLength;

    // Desenha a linha de mira
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 10]);
    ctx.stroke();
    ctx.closePath();
    
    // Desenha a bolha de lançamento
    const colorHex = BUBBLE_COLORS[nextBubble.color];
    ctx.beginPath();
    ctx.arc(startX, startY - BUBBLE_RADIUS, BUBBLE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = colorHex;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

  }, [aimAngle, isDragging, nextBubble.color]);


  return (
    <div
      className="absolute inset-0 touch-none"
      onMouseDown={handleInteractionStart}
      onMouseMove={handleInteractionMove}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchMove={handleInteractionMove}
      onTouchEnd={handleInteractionEnd}
    >
      {/* Canvas para desenhar a mira */}
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT} 
        className="absolute top-0 left-0 pointer-events-none"
        // Move o canvas para cima para que o lançador fique na base do container pai
        style={{ transform: `translateY(-${CANVAS_HEIGHT - LAUNCHER_Y}px)` }} 
      />
    </div>
  );
};

export default BubbleLauncher;