import React from 'react';
import ZaloLogo from '../assets/Logo Zalo.svg';

const ZaloIcon = ({ size = 32}) => {
  return (
    <img 
      src={ZaloLogo} 
      alt="Zalo" 
      width={size} 
      height={size}
      style={{
        display: 'block',
        objectFit: 'contain'
      }}
    />
  );
};

export default ZaloIcon;
