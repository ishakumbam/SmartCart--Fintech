import { Platform } from 'react-native';

export const Palette = {
  ricePaper:     '#FDFCF8',
  stone:         '#F0EBE5',
  sand:          '#E6DCCD',
  rawTimber:     '#DED8CF',

  moss50:        '#EEF2EC',
  moss100:       '#D5DFCE',
  moss200:       '#B0C2A6',
  moss300:       '#8BA67E',
  moss400:       '#728D66',
  moss500:       '#5D7052',
  moss600:       '#4F6146',
  moss700:       '#3E4E37',
  moss800:       '#2E3A28',
  moss900:       '#1E261A',

  clay50:        '#FAF2E9',
  clay100:       '#F2DFC4',
  clay200:       '#E8C99B',
  clay300:       '#DCB06D',
  clay400:       '#D29D4E',
  clay500:       '#C18C5D',
  clay600:       '#A5764D',
  clay700:       '#875F3E',
  clay800:       '#6A4930',
  clay900:       '#4D3322',

  loam:          '#2C2C24',
  bark:          '#4A4A40',
  driedGrass:    '#78786C',
  paleMist:      '#F3F4F1',

  burntSienna:   '#A85448',

  white:         '#FFFFFF',
  transparent:   'transparent',
} as const;

export const Colors = {
  background:         Palette.ricePaper,
  backgroundAlt:      Palette.stone,
  surface:            '#FEFEFA',
  surfaceAlt:         Palette.sand,
  border:             Palette.rawTimber,

  textPrimary:        Palette.loam,
  textSecondary:      Palette.bark,
  textMuted:          Palette.driedGrass,
  textInverse:        Palette.white,
  textOnPrimary:      Palette.paleMist,

  primary:            Palette.moss500,
  primaryLight:       Palette.moss400,
  primaryDark:        Palette.moss600,
  primaryFaint:       Palette.moss50,

  secondary:          Palette.clay500,
  secondaryLight:     Palette.clay400,
  secondaryFaint:     Palette.clay50,

  accent:             Palette.sand,
  accentForeground:   Palette.bark,
  muted:              Palette.stone,
  mutedForeground:    Palette.driedGrass,

  danger:             Palette.burntSienna,
  success:            Palette.moss500,

  tabActive:          Palette.moss500,
  tabInactive:        Palette.driedGrass,
  tabBackground:      '#FEFEFA',
} as const;

export const Typography = {
  heading:      'Fraunces_700Bold',
  headingSemi:  'Fraunces_600SemiBold',
  body:         'Nunito_400Regular',
  bodySemi:     'Nunito_600SemiBold',
  bodyBold:     'Nunito_700Bold',

  xs:    11,
  sm:    13,
  base:  15,
  md:    16,
  lg:    18,
  xl:    20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 42,
  '6xl': 52,

  tight:  1.15,
  normal: 1.5,
  loose:  1.75,
} as const;

export const Spacing = {
  0:  0,
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  7:  28,
  8:  32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
} as const;

export const Radius = {
  sm:    8,
  md:    12,
  lg:    16,
  xl:    20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
  full:  9999,

  organic1: { borderTopLeftRadius: 48, borderTopRightRadius: 24, borderBottomRightRadius: 56, borderBottomLeftRadius: 32 },
  organic2: { borderTopLeftRadius: 32, borderTopRightRadius: 56, borderBottomRightRadius: 24, borderBottomLeftRadius: 48 },
  organic3: { borderTopLeftRadius: 56, borderTopRightRadius: 32, borderBottomRightRadius: 40, borderBottomLeftRadius: 24 },
  organic4: { borderTopLeftRadius: 24, borderTopRightRadius: 48, borderBottomRightRadius: 32, borderBottomLeftRadius: 56 },
  organic5: { borderTopLeftRadius: 40, borderTopRightRadius: 40, borderBottomRightRadius: 56, borderBottomLeftRadius: 24 },
  organic6: { borderTopLeftRadius: 64, borderTopRightRadius: 24, borderBottomRightRadius: 48, borderBottomLeftRadius: 40 },
} as const;

export const Shadows = {
  soft: Platform.select({
    ios: {
      shadowColor:   '#5D7052',
      shadowOffset:  { width: 0, height: 4 },
      shadowOpacity: 0.13,
      shadowRadius:  16,
    },
    android: { elevation: 4 },
  }),
  float: Platform.select({
    ios: {
      shadowColor:   '#C18C5D',
      shadowOffset:  { width: 0, height: 10 },
      shadowOpacity: 0.18,
      shadowRadius:  30,
    },
    android: { elevation: 8 },
  }),
  subtle: Platform.select({
    ios: {
      shadowColor:   '#5D7052',
      shadowOffset:  { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius:  8,
    },
    android: { elevation: 2 },
  }),
  lifted: Platform.select({
    ios: {
      shadowColor:   '#5D7052',
      shadowOffset:  { width: 0, height: 16 },
      shadowOpacity: 0.14,
      shadowRadius:  36,
    },
    android: { elevation: 12 },
  }),
} as const;

export const Duration = {
  fast:    200,
  normal:  300,
  slow:    500,
  organic: 700,
} as const;
