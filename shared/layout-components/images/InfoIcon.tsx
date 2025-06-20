import React, { CSSProperties } from 'react';

interface InfoIconProps {
  color?: string;
  size?: number;
  style?: CSSProperties; // 
}

const InfoIcon: React.FC<InfoIconProps> = ({ color = '#0052FF', size = 15, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 15 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
  >
    <path
      d="M7.5 13.1754C10.6066 13.1754 13.125 10.657 13.125 7.5504C13.125 4.4438 10.6066 1.9254 7.5 1.9254C4.3934 1.9254 1.875 4.4438 1.875 7.5504C1.875 10.657 4.3934 13.1754 7.5 13.1754Z"
      stroke={color}
      strokeWidth="0.9375"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.03125 7.08165C7.15557 7.08165 7.2748 7.13104 7.36271 7.21894C7.45061 7.30685 7.5 7.42608 7.5 7.5504V9.89415C7.5 10.0185 7.54939 10.1377 7.63729 10.2256C7.7252 10.3135 7.84443 10.3629 7.96875 10.3629"
      stroke={color}
      strokeWidth="0.9375"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.26563 5.6754C7.65395 5.6754 7.96875 5.3606 7.96875 4.97227C7.96875 4.58395 7.65395 4.26915 7.26563 4.26915C6.8773 4.26915 6.5625 4.58395 6.5625 4.97227C6.5625 5.3606 6.8773 5.6754 7.26563 5.6754Z"
      fill={color}
    />
  </svg>
);

export default InfoIcon;
