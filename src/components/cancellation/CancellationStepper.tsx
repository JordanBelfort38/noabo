"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface CancellationStepperProps {
  steps: string[];
}

export function CancellationStepper({ steps }: CancellationStepperProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const progress = steps.length > 0 ? Math.round((checked.size / steps.length) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-zinc-500 dark:text-zinc-400">Progression</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, index) => {
          const done = checked.has(index);
          return (
            <button
              key={index}
              onClick={() => toggle(index)}
              className={`group flex w-full items-start gap-3.5 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 ${
                done
                  ? "border-green-200 bg-green-50/60 dark:border-green-800/50 dark:bg-green-900/10"
                  : "border-zinc-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-800/50 dark:hover:bg-blue-900/10"
              }`}
            >
              <div
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                  done
                    ? "bg-green-500 text-white shadow-sm shadow-green-200 dark:shadow-green-900"
                    : "border-2 border-zinc-200 bg-white text-xs font-bold text-zinc-400 group-hover:border-blue-300 group-hover:text-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </div>
              <span
                className={`text-sm leading-relaxed transition-colors ${
                  done
                    ? "text-green-700 line-through decoration-green-300 dark:text-green-400"
                    : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {step}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
