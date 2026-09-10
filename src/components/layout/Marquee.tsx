import React from 'react';

interface MarqueeProps {
  theme?: 'light' | 'dark';
}

export const Marquee: React.FC<MarqueeProps> = ({ theme = 'light' }) => {
  const isDark = theme === 'dark';

  const items = [
    'NEXORA',
    'SMALL THINGS',
    'BETTER EVERYDAY',
    'EVERYDAY ESSENTIALS',
    'MINIMAL DESIGN',
    'THOUGHTFUL ROUTINES',
  ];

  return (
    <div
      className={`relative w-full overflow-hidden py-5 border-y ${
        isDark
          ? 'bg-charcoal-950 border-charcoal-800 text-ivory-300'
          : 'bg-ivory-200/50 border-stone/30 text-charcoal-700'
      }`}
    >
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {[...Array(4)].map((_, groupIndex) => (
          <div key={groupIndex} className="flex items-center space-x-8 px-4">
            {items.map((text, index) => (
              <div key={index} className="flex items-center space-x-8">
                <span className="font-serif text-lg sm:text-xl md:text-2xl tracking-[0.2em] uppercase font-light">
                  {text}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-sage-500/60 inline-block shrink-0" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
