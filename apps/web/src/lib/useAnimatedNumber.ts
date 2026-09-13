import { useState, useEffect, useRef } from 'react';

/**
 * Smoothly interpolates numeric values using requestAnimationFrame with ease-out cubic.
 * Ideal for KPI counters and telemetry readouts.
 */
export function useAnimatedNumber(targetValue: number, duration: number = 600): number {
  const [displayValue, setDisplayValue] = useState<number>(targetValue);
  const prevValueRef = useRef<number>(targetValue);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const diff = targetValue - startValue;

    if (diff === 0) {
      setDisplayValue(targetValue);
      return;
    }

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Cubic ease-out: 1 - pow(1 - progress, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + diff * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevValueRef.current = targetValue;
        setDisplayValue(targetValue);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      prevValueRef.current = displayValue;
    };
  }, [targetValue, duration]);

  return displayValue;
}
