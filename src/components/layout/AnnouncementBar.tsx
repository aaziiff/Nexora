import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

interface AnnouncementBarProps {
  message?: string;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  message = 'Free Delivery on every order!',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-charcoal-950 text-ivory-200 text-[11px] tracking-[0.16em] uppercase py-2 px-4 relative z-50 border-b border-charcoal-800">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center gap-2">
        <Sparkles className="w-3 h-3 text-sage-400 hidden sm:inline-block" />
        <span className="font-medium font-sans">{message}</span>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-ivory-100 transition-colors p-1"
          aria-label="Dismiss announcement"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
