import { cn } from "@/lib/utils";
import React from "react";

export interface CircleProgressProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  value: number;
  maxValue: number;
  size?: number;
  strokeWidth?: number;
  counterClockwise?: boolean;
  onColorChange?: (color: string) => void;
  onValueChange?: (value: number, percentage: number) => void;
  /** Custom color-class function, given fill 0..1. Default: mint <70%, accent <90%, rose beyond. */
  getColor?: (fillPercentage: number) => string;
  className?: string;
  animationDuration?: number;
  disableAnimation?: boolean;
}

const CircleProgress = ({
  value,
  maxValue,
  size = 40,
  strokeWidth = 3,
  counterClockwise = false,
  onColorChange,
  onValueChange,
  getColor,
  className,
  animationDuration = 400,
  disableAnimation = false,
  ...props
}: CircleProgressProps) => {
  const [animatedValue, setAnimatedValue] = React.useState(0);
  const animatedValueRef = React.useRef(animatedValue);

  React.useEffect(() => {
    animatedValueRef.current = animatedValue;
  }, [animatedValue]);

  // When animation is disabled, derive the displayed value directly from
  // props instead of syncing it into state via an effect.
  const displayValue = disableAnimation ? Math.min(value, maxValue) : animatedValue;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fillPercentage = Math.min(displayValue / maxValue, 1);
  const strokeDashoffset = circumference * (1 - fillPercentage);

  // Higher is better (SEO health / score semantics) — mint above 70, amber
  // above 90 is intentionally NOT worse-looking than mint; only genuinely
  // low scores read as danger. Override with `getColor` for inverse metrics.
  const defaultGetColor = (percentage: number) => {
    if (percentage >= 0.7) return "stroke-mint";
    if (percentage >= 0.4) return "stroke-amber";
    return "stroke-rose";
  };

  const currentColor = getColor ? getColor(fillPercentage) : defaultGetColor(fillPercentage);

  React.useEffect(() => {
    if (disableAnimation) return;
    const start = animatedValueRef.current;
    const end = Math.min(value, maxValue);
    const startTime = performance.now();
    if (start === end) return;

    const animateProgress = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      const currentValue = start + (end - start) * easeProgress;
      setAnimatedValue(currentValue);
      if (progress < 1) requestAnimationFrame(animateProgress);
    };

    const frame = requestAnimationFrame(animateProgress);
    return () => cancelAnimationFrame(frame);
  }, [value, maxValue, animationDuration, disableAnimation]);

  React.useEffect(() => {
    onColorChange?.(currentColor);
  }, [currentColor, onColorChange]);

  React.useEffect(() => {
    onValueChange?.(displayValue, fillPercentage);
  }, [displayValue, fillPercentage, onValueChange]);

  const valueText = `${Math.round(value)} out of ${maxValue}, ${Math.round(fillPercentage * 100)}% complete`;

  return (
    <div
      className={cn(className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={maxValue}
      aria-valuetext={valueText}
      {...props}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="fill-transparent stroke-border"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={cn("fill-transparent transition-colors", currentColor)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={counterClockwise ? -strokeDashoffset : strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export { CircleProgress };
