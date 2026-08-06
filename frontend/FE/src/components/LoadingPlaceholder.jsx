import React from 'react';

export default function LoadingPlaceholder({ count = 1, height = 160, style = {}, variant = 'card' }) {
  const items = Array.from({ length: count });
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }} aria-hidden>
      {items.map((_, i) => (
        <div
          key={i}
          style={{
            flex: variant === 'inline' ? '0 0 auto' : '0 0 23%',
            minWidth: variant === 'inline' ? 100 : '23%',
            height: height,
            background: '#f3f4f6',
            borderRadius: 8,
            ...style
          }}
        />
      ))}
    </div>
  );
}
