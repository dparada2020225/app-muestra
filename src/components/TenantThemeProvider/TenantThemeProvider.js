// src/components/TenantThemeProvider/TenantThemeProvider.js - versión mejorada
import React, { useEffect } from 'react';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useTenant } from '../../context/TenantContext';
import { theme } from '../../theme';

// Estilos globales que usan las variables CSS definidas por el tenant
const GlobalStyle = createGlobalStyle`
  :root {
    /* Valores predeterminados que se sobrescribirán por el tenant */
    --primary-color: ${props => props.theme.colors.primary};
    --primary-hover-color: ${props => props.primaryHoverColor || props.theme.colors.primaryHover};
    --secondary-color: ${props => props.theme.colors.secondary};
    --secondary-hover-color: ${props => props.secondaryHoverColor || props.theme.colors.secondaryHover};
    --accent-color: ${props => props.theme.colors.accent};
    --currency-symbol: '${props => props.currencySymbol || 'Q'}';
    --logo-text: '${props => props.logoText || 'Sistema de Inventario'}';
    --font-family: ${props => props.fontFamily || "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"};
  }

  body {
    font-family: var(--font-family);
    margin: 0;
    padding: 0;
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
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
      background-color: var(--primary-hover-color);
      transform: translateY(-2px);
    }
  }
  
  /* Clase para encabezados con el estilo del tenant */
  .tenant-heading {
    color: var(--primary-color);
    border-bottom: 2px solid var(--primary-color);
    padding-bottom: 8px;
    margin-bottom: 20px;
  }
  
  /* Clase para badges con el estilo del tenant */
  .tenant-badge {
    background-color: var(--primary-color);
    color: white;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
  }
  
  /* Clase para bordes con el estilo del tenant */
  .tenant-border {
    border: 2px solid var(--primary-color);
    border-radius: 4px;
  }
  
  /* Clase para inputs con el estilo del tenant */
  .tenant-input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
    outline: none;
  }
`;

const TenantThemeProvider = ({ children }) => {
  const { currentTenant, loading } = useTenant();
  
  // Función para convertir color hex a RGB para usar en rgba()
  const hexToRgb = (hex) => {
    // Remover # si está presente
    hex = hex.replace('#', '');
    
    // Expandir shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
  };
  
  // Función para ajustar el brillo de un color (para hover states)
  const adjustBrightness = (hex, percent) => {
    const { r, g, b } = hexToRgb(hex);
    
    const amount = Math.floor(2.55 * percent);
    
    const newR = Math.max(0, Math.min(255, r + amount));
    const newG = Math.max(0, Math.min(255, g + amount));
    const newB = Math.max(0, Math.min(255, b + amount));
    
    return `#${(newR.toString(16).padStart(2, '0'))}${(newG.toString(16).padStart(2, '0'))}${(newB.toString(16).padStart(2, '0'))}`;
  };
  
  // Aplicar estilos específicos del tenant cuando se carga
  useEffect(() => {
    if (currentTenant && currentTenant.customization) {
      // Obtener colores del tenant
      const primaryColor = currentTenant.customization.primaryColor || theme.colors.primary;
      const secondaryColor = currentTenant.customization.secondaryColor || theme.colors.secondary;
      
      // Generar variantes de color para hover, etc.
      const primaryHoverColor = adjustBrightness(primaryColor, -10); // 10% más oscuro
      const secondaryHoverColor = adjustBrightness(secondaryColor, -10);
      
      // Convertir a RGB para usar en rgba()
      const primaryRgb = hexToRgb(primaryColor);
      
      // Aplicar variables CSS
      document.documentElement.style.setProperty('--primary-color', primaryColor);
      document.documentElement.style.setProperty('--primary-hover-color', primaryHoverColor);
      document.documentElement.style.setProperty('--secondary-color', secondaryColor);
      document.documentElement.style.setProperty('--secondary-hover-color', secondaryHoverColor);
      document.documentElement.style.setProperty('--primary-color-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
      
      // Aplicar otros aspectos de personalización
      if (currentTenant.customization.currencySymbol) {
        document.documentElement.style.setProperty('--currency-symbol', currentTenant.customization.currencySymbol);
      }
      
      if (currentTenant.customization.logoText) {
        document.documentElement.style.setProperty('--logo-text', currentTenant.customization.logoText);
      }
      
      // Actualizar favicon si existe
      if (currentTenant.favicon) {
        const faviconLink = document.querySelector("link[rel*='icon']") || document.createElement('link');
        faviconLink.type = 'image/x-icon';
        faviconLink.rel = 'shortcut icon';
        faviconLink.href = currentTenant.favicon;
        document.head.appendChild(faviconLink);
      }
      
      // Actualizar título de la página
      if (currentTenant.name) {
        document.title = `${currentTenant.name} - Sistema de Inventario`;
      }
      
      console.log(`Tema personalizado aplicado para tenant: ${currentTenant.name}`);
    }
  }, [currentTenant]);

  // Crear un tema modificado con colores del tenant
  const tenantTheme = {
    ...theme,
    tenant: currentTenant,
    primaryHoverColor: currentTenant?.customization?.primaryColor 
      ? adjustBrightness(currentTenant.customization.primaryColor, -10) 
      : theme.colors.primaryHover,
    secondaryHoverColor: currentTenant?.customization?.secondaryColor 
      ? adjustBrightness(currentTenant.customization.secondaryColor, -10) 
      : theme.colors.secondaryHover,
    currencySymbol: currentTenant?.customization?.currencySymbol || 'Q',
    logoText: currentTenant?.customization?.logoText || 'Sistema de Inventario'
  };

  return (
    <ThemeProvider theme={tenantTheme}>
      <GlobalStyle 
        primaryHoverColor={tenantTheme.primaryHoverColor}
        secondaryHoverColor={tenantTheme.secondaryHoverColor}
        currencySymbol={tenantTheme.currencySymbol}
        logoText={tenantTheme.logoText}
      />
      {children}
    </ThemeProvider>
  );
};

export default TenantThemeProvider;