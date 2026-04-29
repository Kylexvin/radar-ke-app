// src/utils/theme.js

export const colors = {
  // Base colors
  background: '#0a0a0a',
  surface: 'rgba(255, 255, 255, 0.05)',
  border: 'rgba(255, 255, 255, 0.12)',
  text: '#ffffff',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  primary: '#22C55E',
  
  // Category colors
  fundi: '#3B82F6',      // Blue - Skilled trades/repair
  food: '#F97316',       // Orange - Food/Restaurants
  bodaboda: '#EAB308',   // Yellow - Motorcycle taxis
  salon: '#A855F7',      // Purple - Beauty/Salons
  tutor: '#22C55E',      // Green - Education
  delivery: '#EF4444',   // Red - Delivery services
  health: '#14B8A6',     // Teal - Healthcare
  
  // Semantic colors
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F97316',
  info: '#3B82F6',
};

export const glassStyle = {
  borderRadius: 20,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.surface,
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

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const fontSizes = {
  sm: 13,
  md: 15,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const typography = {
  h1: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  h2: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  h3: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
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
  return categoryColors[category.toLowerCase()] || colors.primary;
};

// Combined theme object for easy export
const theme = {
  colors,
  glassStyle,
  shadow,
  spacing,
  fontSizes,
  typography,
  categoryColors,
  getCategoryColor,
};

export default theme;