// src/utils/theme.js

export const colors = {
  // Base colors
  background: '#0c0c0c',
  surface: 'rgba(255, 255, 255, 0.04)',
  surfaceLight: 'rgba(255, 255, 255, 0.08)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.12)',
  text: '#ffffff',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  textDim: 'rgba(255, 255, 255, 0.35)',
  textFaint: 'rgba(255, 255, 255, 0.2)',
  
  // Brand colors - RADA KE Red theme
  primary: '#FF2020',
  primaryLight: '#FF4444',
  primaryDark: '#CC0000',
  primaryMuted: '#FF5555',
  primaryBorder: 'rgba(255, 68, 68, 0.25)',
  primarySurface: 'rgba(255, 32, 32, 0.1)',
  
  // Category colors (updated with red accents)
  fundi: '#FF4444',      // Red - Skilled trades/repair
  food: '#FF8C00',       // Orange - Food/Restaurants
  bodaboda: '#FFD700',   // Yellow - Motorcycle taxis
  salon: '#FF69B4',      // Pink - Beauty/Salons
  tutor: '#FF5555',      // Light Red - Education
  delivery: '#FF2020',   // Bright Red - Delivery services
  health: '#14B8A6',     // Teal - Healthcare (kept for contrast)
  
  // Semantic colors (aligned with red theme)
  success: '#22C55E',     // Green - kept for success feedback
  error: '#FF2020',       // Red
  warning: '#FF8C00',     // Orange
  info: '#3B82F6',        // Blue
  
  // Map & overlay
  mapOverlay: 'rgba(0, 0, 0, 0.35)',
  vignette: 'rgba(0, 0, 0, 0.45)',
  
  // Gradient
  gradientStart: '#FF2020',
  gradientEnd: '#CC0000',
};

export const glassStyle = {
  borderRadius: 20,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.surface,
};

export const glassStyleLight = {
  borderRadius: 16,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: colors.borderLight,
  backgroundColor: colors.surfaceLight,
};

export const shadow = {
  // iOS shadow
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  // Android shadow (elevation)
  elevation: 5,
};

export const shadowRed = {
  // iOS shadow with red tint
  shadowColor: '#FF2020',
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.3,
  shadowRadius: 12,
  // Android shadow
  elevation: 8,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const fontSizes = {
  xs: 10,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 24,
  xxl: 30,
  xxxl: 32,
};

export const typography = {
  h1: {
    fontSize: fontSizes.xxxl,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 5,
  },
  h2: {
    fontSize: fontSizes.xxl,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 4,
  },
  h3: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    fontSize: fontSizes.md,
    color: colors.text,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  caption: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  button: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonLarge: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
};

export const categoryColors = {
  'fundi': colors.fundi,
  'food': colors.food,
  'bodaboda': colors.bodaboda,
  'salon': colors.salon,
  'tutor': colors.tutor,
  'delivery': colors.delivery,
  'health': colors.health,
};

// Helper function to get category color by category name
export const getCategoryColor = (category) => {
  return categoryColors[category.toLowerCase()] || colors.primaryLight;
};

// Helper function to get severity color
export const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical': return colors.primary;
    case 'high': return colors.primaryLight;
    case 'medium': return colors.warning;
    case 'low': return '#FFD700';
    default: return colors.textMuted;
  }
};

// Helper function to get status badge style
export const getStatusStyle = (status) => {
  switch (status) {
    case 'active':
    case 'open':
      return { backgroundColor: colors.primary, textColor: colors.text };
    case 'pending':
      return { backgroundColor: colors.warning, textColor: colors.text };
    case 'closed':
    case 'inactive':
      return { backgroundColor: colors.textFaint, textColor: colors.textMuted };
    default:
      return { backgroundColor: colors.surface, textColor: colors.textMuted };
  }
};

// Combined theme object for easy export
const theme = {
  colors,
  glassStyle,
  glassStyleLight,
  shadow,
  shadowRed,
  spacing,
  fontSizes,
  typography,
  categoryColors,
  getCategoryColor,
  getSeverityColor,
  getStatusStyle,
};

export default theme;