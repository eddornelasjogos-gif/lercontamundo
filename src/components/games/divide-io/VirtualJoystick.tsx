import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface VirtualJoystickProps {
  onMove: (direction: { x: number; y: number }) => void;
  className?: string;
}

const JOYSTICK_SIZE = 120;
const KNOB_SIZE = 60;
const DEAD_ZONE = 0.1;

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove, className }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [basePosition, setBasePosition] = useState({ x: 0, y: 0 });
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });

  const updateKnobPosition = useCallback((clientX: number, clientY: number, currentBasePos: { x: number, y: number }) => {
    const dx = clientX - currentBasePos.x;
    const dy = clientY - currentBasePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = (JOYSTICK_SIZE - KNOB_SIZE) / 2;

    let x = dx;
    let y = dy;

    if (distance > maxDistance) {
      x = (dx / distance) * maxDistance;
      y = (dy / distance) * maxDistance;
    }

    setKnobPosition({ x, y });

    const normalizedX = x / maxDistance;
    const normalizedY = y / maxDistance;
    
    const magnitude = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);

    if (magnitude < DEAD_ZONE) {
      onMove({ x: 0, y: 0 });
    } else {
      onMove({ x: normalizedX, y: normalizedY });
    }
  }, [onMove]);

  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Previne o comportamento padrão de toque (como rolagem) no início da interação
    e.preventDefault();
    
    // Garante que o evento de mouse não seja tratado como touch
    if ('touches' in e && e.touches.length === 0) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Define a posição base onde o toque/clique começou
    const newBasePos = { x: clientX, y: clientY };
    setBasePosition(newBasePos);
    setIsDragging(true);
    
    // Atualiza a posição do knob imediatamente
    updateKnobPosition(clientX, clientY, newBasePos);
  };

  const handleInteractionEnd = (e: React.MouseEvent | React.TouchEvent) => {
    // Não precisa de preventDefault aqui, mas garante que o dragging pare
    if (isDragging) {
      setIsDragging(false);
      setKnobPosition({ x: 0, y: 0 });
      onMove({ x: 0, y: 0 });
    }
  };

  const handleInteractionMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDragging) {
      // CRUCIAL: Previne a rolagem da tela durante o movimento de toque
      if ('touches' in e) {
        e.preventDefault();
        if (e.touches.length === 0) return;
      }
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      updateKnobPosition(clientX, clientY, basePosition);
    }
  };

  return (
    <div
      // Adiciona touch-action: none para otimizar a prevenção de rolagem
      className={cn("fixed top-0 left-0 w-full h-full z-50 touch-none", className)}
      onMouseDown={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd}
      onMouseMove={handleInteractionMove}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      onTouchCancel={handleInteractionEnd} // Adicionado onTouchCancel
      onTouchMove={handleInteractionMove}
    >
      {isDragging && (
        <div
          className="absolute rounded-full bg-gray-400/50 backdrop-blur-sm pointer-events-none"
          style={{
            width: JOYSTICK_SIZE,
            height: JOYSTICK_SIZE,
            left: basePosition.x,
            top: basePosition.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            className="absolute rounded-full bg-gray-600/70"
            style={{
              width: KNOB_SIZE,
              height: KNOB_SIZE,
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) translate(${knobPosition.x}px, ${knobPosition.y}px)`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default VirtualJoystick;