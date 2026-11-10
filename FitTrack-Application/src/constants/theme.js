export const colors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#DBEAFE',
  background: '#FFFFFF',
  surface: '#F3F4F6',
  card: '#FFFFFF',
  text: '#111827',
  textMuted: '#6B7280',
  textInverse: '#FFFFFF',
  border: '#E5E7EB',
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',
  pr: '#F59E0B', // personal-record highlight
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const radius = { sm: 6, md: 10, lg: 16, pill: 999 };

export const typography = {
  h1: { fontSize: 32, fontWeight: '700', color: colors.text },
  h2: { fontSize: 24, fontWeight: '700', color: colors.text },
  h3: { fontSize: 18, fontWeight: '600', color: colors.text },
  body: { fontSize: 16, color: colors.text },
  caption: { fontSize: 13, color: colors.textMuted },
  label: { fontSize: 14, fontWeight: '500', color: colors.text },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
};

const theme = { colors, spacing, radius, typography, shadow };
export default theme;
