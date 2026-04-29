import { useColorScheme } from 'react-native';
import { Palette } from '@/constants/theme';

export interface ThemeColors {
  background:      string;
  surface:         string;
  surfaceAlt:      string;
  border:          string;
  borderSubtle:    string;
  textPrimary:     string;
  textSecondary:   string;
  textMuted:       string;
  tabBackground:   string;
  cardBackground:  string;
  inputBackground: string;
}

const LightTheme: ThemeColors = {
  background:      Palette.ricePaper,
  surface:         '#FEFEFA',
  surfaceAlt:      Palette.stone,
  border:          Palette.rawTimber,
  borderSubtle:    `${Palette.rawTimber}80`,
  textPrimary:     Palette.loam,
  textSecondary:   Palette.bark,
  textMuted:       Palette.driedGrass,
  tabBackground:   '#FEFEFA',
  cardBackground:  '#FEFEFA',
  inputBackground: 'rgba(255,255,255,0.6)',
};

const DarkTheme: ThemeColors = {
  background:      '#141414',
  surface:         '#1E1E1E',
  surfaceAlt:      '#2A2A2A',
  border:          '#333333',
  borderSubtle:    '#33333380',
  textPrimary:     '#F0F0F0',
  textSecondary:   '#CCCCCC',
  textMuted:       '#888888',
  tabBackground:   '#1A1A1A',
  cardBackground:  '#1E1E1E',
  inputBackground: 'rgba(30,30,30,0.9)',
};

export function useTheme() {
  const scheme = useColorScheme();
  const isDark  = scheme === 'dark';
  const theme   = isDark ? DarkTheme : LightTheme;
  return { theme, isDark };
}