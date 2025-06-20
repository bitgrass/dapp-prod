import React from 'react';
import { IconProps } from '@/src/app/types';


const WarpcastIcon: React.FC<IconProps> = ({ color = '#0052FF', size = 16, style }) => (
  <svg
    width={size}
    height={(size * 16) / 17}
    viewBox="0 0 17 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
  >
    <path
      d="M12.6021 3.59302L11.431 8.03599L10.2562 3.59302H7.55239L6.36624 8.06871L5.18398 3.59302H2.10449L4.96604 13.4164H7.62279L8.89318 8.85479L10.1635 13.4164H12.826L15.6813 3.59302H12.6021Z"
      fill={color}
    />
  </svg>
);

export default WarpcastIcon;
