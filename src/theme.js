// src/theme.js
export const theme = {
  colors: {
    // Usar variables CSS para colores principales (definidos por TenantContext)
    primary: 'var(--primary-color, #3b82f6)', // Fallback a azul
    primaryHover: 'var(--primary-hover-color, #2563eb)', // Azul más oscuro para hover
    primaryDark: 'var(--primary-dark-color, #1d4ed8)', // Azul aún más oscuro
    secondary: 'var(--secondary-color, #333333)', // Un poco más oscuro para mejor contraste
    secondaryHover: 'var(--secondary-hover-color, #444444)',
    accent: 'var(--accent-color, #f59e0b)', // Color de acento predeterminado
    
    // Colores de fondo y texto no específicos del tenant
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
  },
  // Función para obtener valores de tenant desde CSS Variables
  getCssVar: (name, fallback) => {
    if (typeof window === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }
};