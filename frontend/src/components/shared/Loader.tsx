import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'green' | 'ash';
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  color = 'green',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colorClasses = {
    green: 'border-[var(--primary-green)] border-r-transparent',
    ash: 'border-[var(--primary-ash)] border-r-transparent',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div 
        className={`rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};
