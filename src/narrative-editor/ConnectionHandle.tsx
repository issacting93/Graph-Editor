import React from 'react';

interface ConnectionHandleProps {
  position: 'top' | 'right' | 'bottom' | 'left';
  onMouseDown: (e: React.MouseEvent) => void;
  isConnecting: boolean;
}

export const ConnectionHandle: React.FC<ConnectionHandleProps> = ({
  position,
  onMouseDown,
  isConnecting,
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'right':
        return 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2';
      case 'bottom':
        return 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2';
      case 'left':
        return 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2';
    }
  };

  return (
    <div
      className={`absolute w-4 h-4 rounded-full bg-cyber-red border-2 border-white
        cursor-crosshair transition-all duration-200
        ${getPositionStyles()}
        ${isConnecting ? 'scale-150 ring-2 ring-cyber-red' : 'hover:scale-125'}`}
      onMouseDown={onMouseDown}
    />
  );
}; 