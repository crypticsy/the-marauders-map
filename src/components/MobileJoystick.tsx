import { useEffect, useRef, useState } from 'react';
import { Vector2 } from 'three';

interface MobileJoystickProps {
  onDirectionChange: (direction: Vector2 | null) => void;
  isPlayerMode: boolean;
}

export function MobileJoystick({ onDirectionChange, isPlayerMode }: MobileJoystickProps) {
  const [isActive, setIsActive] = useState(false);
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });
  const baseRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);
  const basePositionRef = useRef({ x: 0, y: 0 });

  const maxDistance = 40; // Maximum distance the knob can move from center

  useEffect(() => {
    if (!isPlayerMode) {
      setIsActive(false);
      setKnobPosition({ x: 0, y: 0 });
      onDirectionChange(null);
      return;
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (!baseRef.current || touchIdRef.current !== null) return;

      const touch = e.touches[0];
      const rect = baseRef.current.getBoundingClientRect();

      // Check if touch is within the joystick area
      const touchX = touch.clientX;
      const touchY = touch.clientY;

      if (
        touchX >= rect.left &&
        touchX <= rect.right &&
        touchY >= rect.top &&
        touchY <= rect.bottom
      ) {
        touchIdRef.current = touch.identifier;
        setIsActive(true);
        basePositionRef.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchIdRef.current === null) return;

      const touch = Array.from(e.touches).find(t => t.identifier === touchIdRef.current);
      if (!touch) return;

      e.preventDefault();

      const deltaX = touch.clientX - basePositionRef.current.x;
      const deltaY = touch.clientY - basePositionRef.current.y;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const limitedDistance = Math.min(distance, maxDistance);

      const angle = Math.atan2(deltaY, deltaX);
      const knobX = Math.cos(angle) * limitedDistance;
      const knobY = Math.sin(angle) * limitedDistance;

      setKnobPosition({ x: knobX, y: knobY });

      // Convert to normalized direction vector
      if (distance > 5) { // Dead zone
        const normalizedX = deltaX / distance;
        // DOWN on screen = positive deltaY
        // We want DOWN to move FORWARD (negative Z in game)
        const normalizedY = deltaY / distance;

        onDirectionChange(new Vector2(normalizedX, normalizedY));
      } else {
        onDirectionChange(null);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touches = Array.from(e.changedTouches);
      if (touches.some(t => t.identifier === touchIdRef.current)) {
        touchIdRef.current = null;
        setIsActive(false);
        setKnobPosition({ x: 0, y: 0 });
        onDirectionChange(null);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPlayerMode, onDirectionChange]);

  if (!isPlayerMode) return null;

  return (
    <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-50 sm:hidden">
      <div
        ref={baseRef}
        className={`relative w-32 h-32 rounded-full border-4 transition-all ${
          isActive
            ? 'bg-amber-900/40 border-amber-600/80'
            : 'bg-amber-950/30 border-amber-700/50'
        }`}
        style={{
          boxShadow: isActive
            ? '0 0 20px rgba(217, 119, 6, 0.4)'
            : '0 0 10px rgba(120, 53, 15, 0.3)',
        }}
      >
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-amber-500/50 rounded-full transform -translate-x-1/2 -translate-y-1/2" />

        {/* Knob */}
        <div
          className={`absolute top-1/2 left-1/2 w-12 h-12 rounded-full border-3 transform -translate-x-1/2 -translate-y-1/2 transition-all ${
            isActive
              ? 'bg-amber-600/90 border-amber-400 scale-110'
              : 'bg-amber-700/70 border-amber-500'
          }`}
          style={{
            transform: `translate(calc(-50% + ${knobPosition.x}px), calc(-50% + ${knobPosition.y}px)) ${isActive ? 'scale(1.1)' : 'scale(1)'}`,
            boxShadow: isActive
              ? '0 4px 12px rgba(0, 0, 0, 0.4)'
              : '0 2px 8px rgba(0, 0, 0, 0.3)',
          }}
        />

        {/* Directional indicators */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-amber-500/40 text-xs">▲</div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-amber-500/40 text-xs">▼</div>
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-amber-500/40 text-xs">◄</div>
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-amber-500/40 text-xs">►</div>
      </div>

      {/* Label */}
      <div className="text-center mt-2 text-2xs text-amber-400/60 font-semibold tracking-wide">
        Move
      </div>
    </div>
  );
}
