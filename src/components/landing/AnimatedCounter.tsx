"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({
  value,
  suffix,
  label,
  source,
}: {
  value: number;
  suffix: string;
  label: string;
  source: string;
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1500;
          const steps = 40;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl font-bold text-blue-600 sm:text-4xl dark:text-blue-400">
        {count}
        {suffix && <span className="ml-1 text-xl sm:text-2xl">{suffix}</span>}
      </div>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{source}</p>
    </div>
  );
}
