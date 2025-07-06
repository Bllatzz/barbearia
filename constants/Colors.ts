/**
 * Paleta de cores moderna e minimalista para Bernades Barbearia
 * Design inspirado em interfaces premium e elegantes
 */

// Paleta de cores minimalista retrô elegante
export const Colors = {
  // Cores principais
  primary: '#800020',        // Burgundy
  secondary: '#111111',      // Preto intenso
  accent: '#F7F7F7',         // Cinza muito claro
  
  // Cores de fundo
  background: '#FFFFFF',     // Branco puro
  surface: '#F7F7F7',        // Cinza muito claro para cards
  surfaceHover: '#ECECEC',   // Hover state
  
  // Cores de texto
  textPrimary: '#111111',    // Preto intenso
  textSecondary: '#666666',  // Cinza escuro
  textMuted: '#B0B0B0',      // Cinza médio
  
  // Cores de estado
  success: '#10B981',        // Verde esmeralda
  warning: '#F59E0B',        // Âmbar
  error: '#EF4444',          // Vermelho
  
  // Gradientes (usados sutilmente)
  gradientPrimary: ['#800020', '#B22234'],
  gradientBackground: ['#FFFFFF', '#F7F7F7'],
  
  // Sombras
  shadowLight: 'rgba(128, 0, 32, 0.08)',
  shadowDark: 'rgba(0, 0, 0, 0.10)',
};

const tintColorLight = Colors.primary;
const tintColorDark = Colors.primary;

export default {
  light: {
    text: Colors.textPrimary,
    background: Colors.background,
    tint: tintColorLight,
    tabIconDefault: Colors.textMuted,
    tabIconSelected: tintColorLight,
    primary: Colors.primary,
    secondary: Colors.secondary,
    success: Colors.success,
    warning: Colors.warning,
    error: Colors.error,
  },
  dark: {
    text: Colors.textPrimary,
    background: Colors.background,
    tint: tintColorDark,
    tabIconDefault: Colors.textMuted,
    tabIconSelected: tintColorDark,
    primary: Colors.primary,
    secondary: Colors.secondary,
    success: Colors.success,
    warning: Colors.warning,
    error: Colors.error,
  },
};
