import React from 'react';
import { cn } from '@/lib/utils';

type TileSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface TilesProps {
  rows?: number;
  cols?: number;
  tileSize?: TileSize;
  tileClassName?: string;
  delayMultiplier?: number;
  randomness?: boolean;
  className?: string;
}

const sizeMap: Record<TileSize, string> = {
  xs: 'min-h-[20px] min-w-[20px]',
  sm: 'min-h-[30px] min-w-[30px]',
  md: 'min-h-[40px] min-w-[40px]',
  lg: 'min-h-[60px] min-w-[60px]',
  xl: 'min-h-[80px] min-w-[80px]',
};

export function Tiles({
  rows = 20,
  cols = 10,
  tileSize = 'md',
  tileClassName = 'border-neutral-200/40',
  delayMultiplier = 20,
  randomness = true,
  className,
}: TilesProps) {
  // Create grid cells
  const cells = React.useMemo(() => {
    // Generate cells with their coordinates
    return Array.from({ length: rows * cols }, (_, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      return { id: i, row, col };
    });
  }, [rows, cols]);

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8 5xl:grid-cols-9 6xl:grid-cols-10',
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {cells.map(({ id, row, col }) => {
        // Calculate distance from the center of the grid
        const midRow = rows / 2;
        const midCol = cols / 2;
        const distRow = row - midRow;
        const distCol = col - midCol;
        const dist = Math.sqrt(distRow * distRow + distCol * distCol);
        
        // Generate a random offset if randomness is enabled
        const randomOffset = randomness ? Math.random() * 0.3 : 0;
        
        // Calculate delay based on distance from center plus random factor
        const delay = Math.min(Math.floor(dist * delayMultiplier) + (randomOffset * delayMultiplier * 2), 1000);
        
        return (
          <div
            key={id}
            className={cn(
              'border bg-white/[0.01] backdrop-blur-[2px] relative group/tile transition-all duration-300 ease-in-out',
              sizeMap[tileSize],
              tileClassName
            )}
            style={{
              animationDelay: `${delay}ms`,
              transitionDelay: `${delay}ms`,
            }}
          >
            {/* Interactive hover effect content */}
            <div
              className="opacity-0 group-hover/tile:opacity-100 absolute inset-0 bg-white/[0.05] transition-opacity duration-200 ease-in-out"
              style={{
                transitionDelay: `${Math.min(delay / 4, 100)}ms`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}