import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { sanitizeColor, clampNumber } from './types';

interface Props {
  settings: Record<string, unknown>;
}

const COLORS = [
  '#93c5fd',
  '#f9a8d4',
  '#86efac',
  '#fde047',
  '#fca5a5',
  '#d8b4fe',
  '#a5b4fc',
  '#c4b5fd',
];

export default React.memo(function BackgroundBoxes({ settings }: Props) {
  const rows = clampNumber(settings.rows, 4, 30, 20);
  const cols = clampNumber(settings.cols, 4, 30, 12);
  const boxColor = sanitizeColor(settings.boxColor, '#818cf8');

  const grid = useMemo(() => {
    const result: { color: string; delay: number; duration: number }[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: { color: string; delay: number; duration: number }[] = [];
      for (let j = 0; j < cols; j++) {
        row.push({
          color:
            boxColor === '#818cf8' ? COLORS[Math.floor(Math.random() * COLORS.length)] : boxColor,
          delay: Math.random() * 8,
          duration: 3 + Math.random() * 4,
        });
      }
      result.push(row);
    }
    return result;
  }, [rows, cols, boxColor]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute -top-1/4 left-1/4 flex h-full w-full p-4"
        style={{
          transform:
            'translate(-40%, -60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)',
        }}
      >
        {grid.map((row, i) => (
          <div key={i} className="relative h-8 w-16 border-l border-slate-700">
            {row.map((cell, j) => (
              <motion.div
                key={j}
                className="relative h-8 w-16 border-r border-t border-slate-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.15, 0] }}
                transition={{
                  duration: cell.duration,
                  delay: cell.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{ backgroundColor: cell.color }}
              >
                {j % 2 === 0 && i % 2 === 0 && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="pointer-events-none absolute -left-[22px] -top-[14px] h-6 w-10 stroke-[1px] text-slate-700"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                  </svg>
                )}
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});
