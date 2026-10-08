import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className,
  count = 1
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={cn(
            'animate-pulse bg-[#1F2736]/70 rounded-md',
            className
          )}
        />
      ))}
    </>
  );
};
