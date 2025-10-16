import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface VirtualJoystickProps {
  onMove: (direction: { x: number; y: number }) => void;
  className?: string;
}

const JOYSTICK_SIZE = 120;
const KNOB_SIZE = 60;
const DEAD_ZONE = 0.1;

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove, className }) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });

  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    updateKnobPosition(e);
  };

  const handleInteractionEnd = () => {
    setIsDragging(false);
    setKnobPosition({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  };

  const handleInteractionMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDragging) {
      updateKnobPosition(e);
    }
  };

  const updateKnobPosition = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!baseRef.current) return;

    const rect = baseRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
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

  return (
    <div
      className={cn("fixed bottom-10 left-10 z-50", className)}
      onMouseDown={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd}
      onMouseMove={handleInteractionMove}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      onTouchMove={handleInteractionMove}
    >
      <div
        ref={baseRef}
        className="relative rounded-full bg-gray-400/50 backdrop-blur-sm"
        style={{ width: JOYSTICK_SIZE, height: JOYSTICK_SIZE }}
      >
        <div
          className="absolute rounded-full bg-gray-600/70"
          style={{
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) translate(${knobPosition.x}px, ${knobPosition.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        />
      </div>
    </div>
  );
};

export default VirtualJoystick;