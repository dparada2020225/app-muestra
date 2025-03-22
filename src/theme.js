// src/theme.js
export const theme = {
  colors: {
    primary: '#3b82f6', // Cambiado de verde neón (#96ff00) a azul
    primaryHover: '#2563eb', // Azul más oscuro para hover
    primaryDark: '#1d4ed8', // Azul aún más oscuro
    secondary: '#333333', // Un poco más oscuro para mejor contraste
    secondaryHover: '#444444',
    background: '#f8f9fa',
    cardBackground: '#ffffff',
    text: '#222222',
    textLight: '#666666',
    danger: '#ef4444', // Rojo ligeramente actualizado
    dangerHover: '#dc2626',
    success: '#22c55e', // Verde actualizado
    successHover: '#16a34a',
    warning: '#f59e0b'
  },
  shadows: {
    small: '0 2px 4px rgba(0,0,0,0.05)',
    medium: '0 4px 8px rgba(0,0,0,0.1)',
    large: '0 8px 16px rgba(0,0,0,0.15)'
  },
  breakpoints: {
    mobile: '576px',
    tablet: '768px',
    desktop: '992px',
    largeDesktop: '1200px'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    round: '50%'
  }
};