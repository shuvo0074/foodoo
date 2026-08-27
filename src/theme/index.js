import { Platform } from 'react-native';

/**
 * Foodoo dark theme.
 * Base is a near-black with a cool violet cast so the warm tangerine accent pops.
 */
export const colors = {
  bg: '#0B0B10',
  bgSoft: '#101018',
  surface: '#16161F',
  surfaceHi: '#1D1D28',
  surfaceMax: '#262633',

  stroke: 'rgba(255,255,255,0.08)',
  strokeHi: 'rgba(255,255,255,0.16)',

  text: '#FFFFFF',
  dim: '#A3A3B8',
  mute: '#6B6B82',

  primary: '#FF6B2C',
  primaryLt: '#FF9556',
  primaryDk: '#E2500F',

  lime: '#C6F24E',
  mint: '#3DDC97',
  gold: '#FFC531',
  danger: '#FF4D6D',
  violet: '#8B5CF6',
  blue: '#4C8DFF',

  scrim: 'rgba(11,11,16,0.72)',
};

export const grad = {
  primary: ['#FF9556', '#FF6B2C', '#E2500F'],
  primarySoft: ['rgba(255,107,44,0.28)', 'rgba(255,107,44,0.02)'],
  mint: ['#5BE8AE', '#22B57A'],
  violet: ['#A78BFA', '#7C3AED'],
  gold: ['#FFD76E', '#FFB020'],
  // vertical scrim used over hero photography
  scrimDown: ['rgba(11,11,16,0)', 'rgba(11,11,16,0.55)', 'rgba(11,11,16,0.97)'],
  scrimUp: ['rgba(11,11,16,0.85)', 'rgba(11,11,16,0.15)', 'rgba(11,11,16,0)'],
  card: ['#1D1D28', '#14141C'],
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  pill: 999,
};

/** 4pt spacing scale */
export const sp = (n) => n * 4;

export const type = {
  display: { fontSize: 32, fontWeight: '800', letterSpacing: -0.9 },
  h1: { fontSize: 26, fontWeight: '800', letterSpacing: -0.7 },
  h2: { fontSize: 20, fontWeight: '700', letterSpacing: -0.45 },
  h3: { fontSize: 17, fontWeight: '700', letterSpacing: -0.25 },
  body: { fontSize: 15, fontWeight: '500', letterSpacing: -0.1 },
  sm: { fontSize: 13, fontWeight: '500' },
  xs: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
};

/** Soft coloured elevation — on dark UI a tinted glow reads better than a black shadow. */
export const elev = (level = 1, color = '#000') =>
  Platform.select({
    ios: {
      shadowColor: color,
      shadowOpacity: 0.15 + level * 0.09,
      shadowRadius: 6 + level * 7,
      shadowOffset: { width: 0, height: 2 + level * 3 },
    },
    android: { elevation: level * 4 },
    default: {
      boxShadow: `0 ${2 + level * 3}px ${6 + level * 7}px rgba(0,0,0,${0.2 + level * 0.1})`,
    },
  });

export const hexA = (hex, a) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

/** Shared spring config so every interaction in the app feels like the same object. */
export const spring = { damping: 16, stiffness: 220, mass: 0.55 };
export const springSoft = { damping: 20, stiffness: 140, mass: 0.8 };

export default { colors, grad, radius, sp, type, elev, hexA, spring, springSoft };
