import React from 'react';
import { AbilityIconKind } from '../../config/characterControlProfiles';

interface AbilityIconProps {
  kind: AbilityIconKind;
  color?: string;
  size?: number;
  className?: string;
}

/**
 * Crisp pixel-compatible geometric inline SVG icons for basic fighting controls
 * and character-specific signature abilities. Zero emojis.
 */
export const AbilityIcon: React.FC<AbilityIconProps> = ({
  kind,
  color = 'currentColor',
  size = 22,
  className = '',
}) => {
  const shared = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    'aria-hidden': true as const,
    className,
  };

  switch (kind) {
    case 'punch_light':
      return (
        <svg {...shared}>
          <path
            d="M4 11h8l2-3h5v6h-4l-2 2H4v-5z"
            fill={color}
            fillOpacity="0.22"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="miter"
          />
          <path d="M19 8l3 4-3 4" stroke={color} strokeWidth="2" />
        </svg>
      );

    case 'punch_heavy':
      return (
        <svg {...shared}>
          <path
            d="M3 10h7l2-4h7v8h-4l-2 4H3v-8z"
            fill={color}
            fillOpacity="0.28"
            stroke={color}
            strokeWidth="2"
          />
          <path d="M19 6l3 2-2 4 2 4-3 2" stroke={color} strokeWidth="2" />
        </svg>
      );

    case 'kick':
      return (
        <svg {...shared}>
          <path
            d="M4 17l7-5 7-6 3 3-8 8H4z"
            fill={color}
            fillOpacity="0.24"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="miter"
          />
          <path d="M14 5h6v6" stroke={color} strokeWidth="2" />
        </svg>
      );

    case 'guard':
      return (
        <svg {...shared}>
          <path
            d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
            fill={color}
            fillOpacity="0.22"
            stroke={color}
            strokeWidth="2"
          />
          <path d="M12 7v10" stroke={color} strokeWidth="2" />
        </svg>
      );

    case 'rahul_fist':
      return (
        <svg {...shared}>
          <polygon
            points="12,2 15,8 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,8"
            fill={color}
            fillOpacity="0.26"
            stroke={color}
            strokeWidth="1.8"
          />
          <rect x="9" y="9" width="6" height="6" fill={color} />
        </svg>
      );

    case 'rahul_rush':
      return (
        <svg {...shared}>
          <path d="M3 7h8l4 5-4 5H3l4-5-4-5z" fill={color} fillOpacity="0.26" stroke={color} strokeWidth="2" />
          <path d="M13 6l6 6-6 6" stroke={color} strokeWidth="2.4" />
        </svg>
      );

    case 'rahul_quake':
      return (
        <svg {...shared}>
          <path d="M4 18h16" stroke={color} strokeWidth="2.2" />
          <path d="M12 3v11" stroke={color} strokeWidth="2.4" />
          <path d="M8 10l4 4 4-4" stroke={color} strokeWidth="2.2" />
          <path d="M3 21l4-3 5 2 5-2 4 3" stroke={color} strokeWidth="1.8" />
        </svg>
      );

    case 'sagar_note':
      return (
        <svg {...shared}>
          <path d="M10 17V6l9-2v10" stroke={color} strokeWidth="2.2" />
          <circle cx="7.5" cy="17.5" r="2.8" fill={color} />
          <circle cx="16.5" cy="14.5" r="2.8" fill={color} />
        </svg>
      );

    case 'sagar_rhythm':
      return (
        <svg {...shared}>
          <path d="M3 13h3l2-6 4 10 3-8 2 4h4" stroke={color} strokeWidth="2.2" strokeLinejoin="miter" />
          <circle cx="19" cy="13" r="2" fill={color} />
        </svg>
      );

    case 'sagar_chorus':
      return (
        <svg {...shared}>
          <path d="M3 8c4-3 8 3 12 0s4-3 6 0" stroke={color} strokeWidth="2" />
          <path d="M3 13c4-3 8 3 12 0s4-3 6 0" stroke={color} strokeWidth="2" />
          <path d="M3 18c4-3 8 3 12 0s4-3 6 0" stroke={color} strokeWidth="2" />
          <circle cx="12" cy="12" r="3" fill={color} />
        </svg>
      );

    case 'jatin_cash':
      return (
        <svg {...shared}>
          <rect x="3" y="6" width="18" height="12" fill={color} fillOpacity="0.22" stroke={color} strokeWidth="2" />
          <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
          <path d="M6 9v6M18 9v6" stroke={color} strokeWidth="1.8" />
        </svg>
      );

    case 'jatin_barrage':
      return (
        <svg {...shared}>
          <rect x="2" y="5" width="11" height="7" fill={color} fillOpacity="0.24" stroke={color} strokeWidth="1.8" />
          <rect x="7" y="9" width="11" height="7" fill={color} fillOpacity="0.24" stroke={color} strokeWidth="1.8" />
          <rect x="11" y="13" width="11" height="7" fill={color} fillOpacity="0.32" stroke={color} strokeWidth="1.8" />
        </svg>
      );

    case 'jatin_storm':
      return (
        <svg {...shared}>
          <path d="M4 7c5-4 11-4 16 0" stroke={color} strokeWidth="2" />
          <path d="M6 12c4-3 8-3 12 0" stroke={color} strokeWidth="2" />
          <path d="M8 17c3-2 5-2 8 0" stroke={color} strokeWidth="2" />
          <rect x="9" y="10" width="6" height="4" fill={color} />
        </svg>
      );

    case 'tony_pulse':
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="7" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="2" />
          <circle cx="12" cy="12" r="3" fill={color} />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke={color} strokeWidth="1.8" />
        </svg>
      );

    case 'tony_drone':
      return (
        <svg {...shared}>
          <polygon points="12,4 20,10 17,17 7,17 4,10" fill={color} fillOpacity="0.22" stroke={color} strokeWidth="2" />
          <circle cx="12" cy="11" r="2.2" fill={color} />
          <path d="M12 17v4" stroke={color} strokeWidth="2.2" />
        </svg>
      );

    case 'tony_beam':
      return (
        <svg {...shared}>
          <path d="M2 12h20" stroke={color} strokeWidth="4" />
          <path d="M4 7h16M4 17h16" stroke={color} strokeWidth="1.6" strokeOpacity="0.7" />
          <polygon points="16,5 23,12 16,19" fill={color} />
        </svg>
      );

    case 'cheeni_sugar':
      return (
        <svg {...shared}>
          <polygon
            points="12,3 19,8 17,18 7,18 5,8"
            fill={color}
            fillOpacity="0.26"
            stroke={color}
            strokeWidth="2"
          />
          <path d="M12 3v15M5 8h14" stroke={color} strokeWidth="1.6" />
        </svg>
      );

    case 'cheeni_caramel':
      return (
        <svg {...shared}>
          <path
            d="M3 16c0-2.5 4-4 9-4s9 1.5 9 4-4 4-9 4-9-1.5-9-4z"
            fill={color}
            fillOpacity="0.32"
            stroke={color}
            strokeWidth="2"
          />
          <path d="M8 12c0-3 2-5 4-8 2 3 4 5 4 8" stroke={color} strokeWidth="2" />
        </svg>
      );

    case 'cheeni_legacy':
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="8" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="2" />
          <path
            d="M12 7c2.8 0 5 2.2 5 5s-2.2 5-5 5-4-1.8-4-4 1.5-3.2 3.2-3.2 2.4 1.1 2.4 2.4"
            stroke={color}
            strokeWidth="2"
          />
          <circle cx="12" cy="12" r="1.5" fill={color} />
        </svg>
      );
  }
};
