import React from 'react';
import { ConnectionType } from '../lib/store/editor-store';

interface ConnectionLineProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  type: ConnectionType;
  label?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

const getConnectionStyle = (type: ConnectionType) => {
  switch (type) {
    case 'causal':
      return 'stroke-cyber-red';
    case 'temporal':
      return 'stroke-cyber-blue';
    case 'conditional':
      return 'stroke-cyber-pink';
    case 'reference':
      return 'stroke-cyber-muted';
  }
};

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  type,
  label,
  isSelected,
  onClick,
}) => {
  // Calculate control points for a curved line
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  const distance = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));
  const curveHeight = Math.min(distance * 0.2, 50);

  // Create a curved path
  const path = `M ${sourceX} ${sourceY} 
    Q ${midX} ${midY - curveHeight}, ${targetX} ${targetY}`;

  return (
    <g onClick={onClick} className="cursor-pointer">
      {/* Main connection line */}
      <path
        d={path}
        fill="none"
        className={`${getConnectionStyle(type)} stroke-2 transition-all duration-200
          ${isSelected ? 'stroke-[3px]' : ''}`}
      />

      {/* Arrow head */}
      <path
        d={`M ${targetX} ${targetY} 
          L ${targetX - 10} ${targetY - 5}
          L ${targetX - 10} ${targetY + 5} Z`}
        className={getConnectionStyle(type)}
      />

      {/* Label background */}
      {label && (
        <g transform={`translate(${midX}, ${midY - curveHeight - 20})`}>
          <rect
            x="-50"
            y="-10"
            width="100"
            height="20"
            rx="4"
            className="fill-cyber-dark stroke-cyber-muted"
          />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            className="text-xs fill-white font-mono"
          >
            {label}
          </text>
        </g>
      )}

      {/* Selection highlight */}
      {isSelected && (
        <path
          d={path}
          fill="none"
          className="stroke-white stroke-[5px] opacity-20"
        />
      )}
    </g>
  );
}; 