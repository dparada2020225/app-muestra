// src/components/TenantThemeProvider/TenantThemeProvider.js
import React, { useEffect } from 'react';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useTenant } from '../../context/TenantContext';
import { theme } from '../../theme';

// Estilos globales que usan las variables CSS definidas por el tenant
const GlobalStyle = createGlobalStyle`
  :root {
    /* Valores predeterminados que se sobrescribirán por el tenant */
    --primary-color: ${props => props.theme.colors.primary};
    --secondary-color: ${props => props.theme.colors.secondary};
    --accent-color: ${props => props.theme.colors.accent};
    --currency-symbol: 'Q';
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 0;
    background-color: ${props => props.theme.colors.background};
  }
  
  * {
    box-sizing: border-box;
  }

  h1, h2, h3 {
    color: ${props => props.theme.colors.text};
  }

  /* Aplicar colores específicos del tenant en clases útiles */
  .tenant-primary-bg {
    background-color: var(--primary-color);
  }
  
  .tenant-primary-text {
    color: var(--primary-color);
  }
  
  .tenant-secondary-bg {
    background-color: var(--secondary-color);
  }
  
  .tenant-secondary-text {
    color: var(--secondary-color);
  }

  /* Clase para botones con el estilo del tenant */
  .tenant-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      opacity: 0.9;
    }
  }
`;

const TenantThemeProvider = ({ children }) => {
  const { currentTenant, loading } = useTenant();
  
  // Aplicar estilos específicos del tenant cuando se carga
  useEffect(() => {
    if (currentTenant && currentTenant.customization) {
      // Definir variables CSS para el tema del tenant
      document.documentElement.style.setProperty(
        '--primary-color', 
        currentTenant.customization.primaryColor || theme.colors.primary
      );
      document.documentElement.style.setProperty(
        '--secondary-color', 
        currentTenant.customization.secondaryColor || theme.colors.secondary
      );
      
      // Definir colores derivados (hover, etc.)
      const primaryColor = currentTenant.customization.primaryColor || theme.colors.primary;
      // Crear una versión más oscura para hover (simplificada)
      const primaryHoverColor = adjustColor(primaryColor, -15);
      document.documentElement.style.setProperty('--primary-hover-color', primaryHoverColor);
      
      const secondaryColor = currentTenant.customization.secondaryColor || theme.colors.secondary;
      const secondaryHoverColor = adjustColor(secondaryColor, -15);
      document.documentElement.style.setProperty('--secondary-hover-color', secondaryHoverColor);
      
      // Aplicar símbolo de moneda del tenant si existe
      if (currentTenant.customization.currencySymbol) {
        document.documentElement.style.setProperty(
          '--currency-symbol', 
          currentTenant.customization.currencySymbol
        );
      }
    }
  }, [currentTenant]);

  // Función auxiliar para ajustar el color (oscurecer/aclarar)
  function adjustColor(color, amount) {
    // Función básica para oscurecer o aclarar colores
    const clamp = (num) => Math.min(255, Math.max(0, num));
    
    // Manejar colores en formato hex
    if (color.startsWith('#')) {
      let hex = color.slice(1);
      
      // Expandir shorthand hex (e.g. #ABC to #AABBCC)
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      
      const newR = clamp(r + amount);
      const newG = clamp(g + amount);
      const newB = clamp(b + amount);
      
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    
    // Por simplicidad, si no es hex, devolvemos el color original
    return color;
  }

  // Usamos el tema base y le aplicamos las personalizaciones
  const tenantTheme = {
    ...theme,
    tenant: currentTenant
  };

  return (
    <ThemeProvider theme={tenantTheme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

export default TenantThemeProvider;