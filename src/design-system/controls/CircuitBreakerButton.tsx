import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, AlertOctagon, RotateCcw, Lock } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CircuitBreakerButtonProps {
  isTripped: boolean;
  onTrip: () => void;
  onReset: () => void;
  deskName?: string;
  className?: string;
}

export const CircuitBreakerButton: React.FC<CircuitBreakerButtonProps> = ({
  isTripped,
  onTrip,
  onReset,
  deskName = 'All Algorithmic Desks',
  className
}) => {
  const [sliderPos, setSliderPos] = useState(0); // 0 to 100%
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = () => {
    if (isTripped) return;
    setIsDragging(true);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left - 20; // 20px handle center offset
      const maxDrag = rect.width - 44;
      const clamped = Math.max(0, Math.min(relativeX, maxDrag));
      const percentage = (clamped / maxDrag) * 100;
      setSliderPos(percentage);

      if (percentage >= 95) {
        setIsDragging(false);
        setSliderPos(100);
        onTrip();
      }
    };

    const handlePointerUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      if (sliderPos < 95) {
        setSliderPos(0); // Snap back
      }
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, sliderPos, onTrip]);

  if (isTripped) {
    return (
      <div
        className={cn(
          'p-3.5 bg-red-950/40 border-2 border-red-500/80 rounded-xl flex items-center justify-between gap-3 animate-pulse',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-600 text-white shadow-lg">
            <AlertOctagon size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="font-mono text-xs font-bold text-red-400 tracking-wider uppercase">
              CIRCUIT BREAKER ENGAGED
            </div>
            <div className="text-[11px] text-[#F1F3F5]">
              Algorithmic executions halted for <span className="font-semibold">{deskName}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F2736] border border-[#273142] text-xs font-mono text-[#F1F3F5] hover:bg-[#273142] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
        >
          <RotateCcw size={13} />
          <span>Reset Safety</span>
        </button>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-[#FF6B6B] font-semibold flex items-center gap-1.5">
          <ShieldAlert size={14} />
          Emergency Trading Freeze
        </span>
        <span className="text-[#64748B] text-[10px]">Slide right to freeze</span>
      </div>

      <div
        ref={trackRef}
        className="relative h-11 w-full bg-[#0B0E14] border border-red-500/30 rounded-lg overflow-hidden select-none flex items-center px-1"
      >
        {/* Background track fill on slide */}
        <div
          className="absolute inset-0 bg-red-600/30 transition-all pointer-events-none"
          style={{ width: `${sliderPos}%` }}
        />

        {/* Center prompt text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs font-mono text-[#94A3B8] font-medium tracking-wider">
          <span className="opacity-80">SLIDE TO HALT TRADING DESKS ➔</span>
        </div>

        {/* Draggable handle */}
        <div
          onPointerDown={handlePointerDown}
          className={cn(
            'relative z-10 w-9 h-9 rounded-md bg-red-600 text-white flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg transition-transform',
            !isDragging && 'transition-all duration-200'
          )}
          style={{ transform: `translateX(${(sliderPos / 100) * ((trackRef.current?.clientWidth || 200) - 44)}px)` }}
          aria-label="Slide to trip circuit breaker"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(sliderPos)}
        >
          <Lock size={16} />
        </div>
      </div>
    </div>
  );
};
