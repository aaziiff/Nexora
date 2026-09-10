import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'full' | 'wordmark' | 'icon' | 'badge';
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  theme = 'dark',
  className = '',
  showTagline = false,
  size = 'md',
}) => {
  // Theme color definitions
  const isLight = theme === 'light';
  const textColor = isLight ? '#FAF8F5' : '#141B17';
  const accentColor = isLight ? '#A2B3A1' : '#7C8D7B';
  const subtextColor = isLight ? '#C4BCB0' : '#687E6D';

  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-11',
    xl: 'h-16',
  };

  if (variant === 'icon') {
    return (
      <Link to="/" className={`inline-flex items-center group ${className}`} aria-label="NEXORA Home">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${sizeClasses[size]} w-auto transition-transform duration-300 group-hover:scale-105`}
        >
          <rect width="48" height="48" rx="10" fill={isLight ? '#FAF8F5' : '#141B17'} />
          <path
            d="M14 34V14H19L29 28V14H34V34H29L19 20V34H14Z"
            fill={isLight ? '#141B17' : '#FAF8F5'}
          />
          <path
            d="M28 16C32.5 18.5 33.5 24 30.5 28C27.5 32 22 33 19 30"
            stroke={accentColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </Link>
    );
  }

  return (
    <Link to="/" className={`inline-flex flex-col items-start group ${className}`} aria-label="NEXORA Home">
      <div className="flex items-center">
        <svg
          viewBox="0 0 210 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${sizeClasses[size]} w-auto transition-opacity duration-300 group-hover:opacity-90`}
        >
          {/* N */}
          <path
            d="M4 32V6H10.5L24.5 24.5V6H30.5V32H24.5L10.5 13.5V32H4Z"
            fill={textColor}
          />

          {/* E */}
          <path
            d="M45 32V6H68V11.5H51.5V16.5H65V21.5H51.5V26.5H68.5V32H45Z"
            fill={textColor}
          />

          {/* X with elegant botanical / aerodynamic leaf curve */}
          <path
            d="M80 6L91.5 19L80 32H87.5L95.2 23.3L103 32H110.5L99 19L110.5 6H103L95.2 14.8L87.5 6H80Z"
            fill={textColor}
          />
          {/* Stylized organic leaf stroke intersecting X */}
          <path
            d="M86 28C92 23 99 15 106 8"
            stroke={accentColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M89 12C94 17 101 24 105 27"
            stroke={accentColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="1 3"
          />

          {/* O */}
          <path
            d="M135 5.5C125 5.5 117 13.5 117 23.5C117 33.5 125 41.5 135 41.5C145 41.5 153 33.5 153 23.5C153 13.5 145 5.5 135 5.5ZM135 36C128.5 36 123.5 30.5 123.5 23.5C123.5 16.5 128.5 11 135 11C141.5 11 146.5 16.5 146.5 23.5C146.5 30.5 141.5 36 135 36Z"
            fill={textColor}
            transform="translate(0, -4.5)"
          />

          {/* R */}
          <path
            d="M161 32V6H176C182.5 6 187 9.5 187 15.5C187 19.8 184 22.8 180 24.2L188 32H180.5L173.2 24.8H167.5V32H161ZM167.5 19.5H175.5C178.5 19.5 180.5 18 180.5 15.5C180.5 13 178.5 11.5 175.5 11.5H167.5V19.5Z"
            fill={textColor}
          />

          {/* A */}
          <path
            d="M202 32L194 6H187L179 32H185.5L187.3 26H193.7L195.5 32H202ZM188.8 21L190.5 14.5L192.2 21H188.8Z"
            fill={textColor}
            transform="translate(8, 0)"
          />
        </svg>
      </div>

      {showTagline && (
        <span
          className="text-[9px] uppercase tracking-[0.3em] font-medium mt-1 pl-0.5 transition-colors duration-300"
          style={{ color: subtextColor }}
        >
          Small things. Better everyday.
        </span>
      )}
    </Link>
  );
};
