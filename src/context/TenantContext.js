// src/context/TenantContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const TenantContext = createContext();

export const useTenant = () => useContext(TenantContext);

export const TenantProvider = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // IMPORTANTE: Definir applyTenantSettings ANTES de usarla en fetchTenantInfo
  // Aplicar configuraciones del tenant (tema, logo, etc.)
  const applyTenantSettings = useCallback((tenant) => {
    if (!tenant) return;
    
    // Aplicar tema personalizado si existe
    if (tenant.customization) {
      // Aplicar colores primarios y secundarios como variables CSS
      document.documentElement.style.setProperty('--primary-color', tenant.customization.primaryColor || '#3b82f6');
      document.documentElement.style.setProperty('--secondary-color', tenant.customization.secondaryColor || '#333333');
      
      // También establecer otras variables CSS útiles
      if (tenant.customization.accentColor) {
        document.documentElement.style.setProperty('--accent-color', tenant.customization.accentColor);
      }
      
      // Establecer formato de moneda si está disponible
      if (tenant.customization.currencySymbol) {
        document.documentElement.style.setProperty('--currency-symbol', tenant.customization.currencySymbol);
      }
      
      console.log(`Aplicando tema personalizado para ${tenant.name}: `, {
        primaryColor: tenant.customization.primaryColor,
        secondaryColor: tenant.customization.secondaryColor
      });
    }
    
    // Establecer el favicon y el título si existen
    if (tenant.favicon) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = tenant.favicon;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    
    if (tenant.name) {
      document.title = tenant.name + ' - Sistema de Inventario';
    }
  }, []);

  // Función para detectar el tenant basado en el subdominio
  const detectTenant = useCallback(() => {
    const hostname = window.location.hostname;
    
    // Para desarrollo local (localhost u otras URLs locales)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Primero intentar obtener desde los parámetros de URL
      const urlParams = new URLSearchParams(window.location.search);
      const tenantParam = urlParams.get('tenant');
      
      if (tenantParam) {
        console.log(`Usando tenant de URL param: ${tenantParam}`);
        return tenantParam;
      }
      
      // Si no hay parámetro, intentar extraer de un subdominio de localhost
      const parts = hostname.split('.');
      if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost') {
        console.log(`Usando subdominio de localhost: ${parts[0]}`);
        return parts[0];
      }
      
      // Si llegamos aquí, usar el valor por defecto pero loguear una advertencia
      console.warn("No se detectó tenant específico, usando 'demo' por defecto");
      return 'demo'; // Valor por defecto para desarrollo
    }
    
    // En producción, extraer el tenant del subdominio
    const parts = hostname.split('.');
    
    // Si es un subdominio (al menos 3 partes: tenant.domain.tld)
    if (parts.length >= 2) {
      console.log(`Subdominio detectado en producción: ${parts[0]}`);
      return parts[0];
    }
    
    // Si es dominio principal, podría ser la página de landing o registro
    return null;
  }, []);

  // Cargar información del tenant
  const fetchTenantInfo = useCallback(async (tenantId) => {
    if (!tenantId) {
      setCurrentTenant(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log(`Intentando cargar información del tenant: ${tenantId}`);
      
      // Intentar obtener datos del tenant desde el servidor
      const response = await axios.get(`${API_URL}/api/tenants/${tenantId}`);
      
      if (response.data) {
        console.log("Datos del tenant recibidos:", response.data);
        localStorage.setItem('currentTenant', JSON.stringify(response.data));
        setCurrentTenant(response.data);
        setError(null);
        
        // Aplicar configuraciones específicas del tenant
        applyTenantSettings(response.data);
      } else {
        // Si estamos en desarrollo, usar datos simulados
        if (process.env.NODE_ENV === 'development') {
          console.log("Usando datos de tenant simulados para desarrollo");
          const mockedTenant = {
            id: tenantId,
            _id: tenantId,
            name: tenantId.charAt(0).toUpperCase() + tenantId.slice(1), // Capitalizar
            slogan: 'Sistema de Gestión de Inventario',
            description: 'Accede a tu cuenta para gestionar tu inventario, realizar compras, ventas y mucho más.',
            customization: {
              primaryColor: '#3b82f6',
              secondaryColor: '#333333',
              logoText: tenantId.charAt(0).toUpperCase() + tenantId.slice(1),
              currencySymbol: 'Q',
              dateFormat: 'DD/MM/YYYY'
            }
          };
          
          localStorage.setItem('currentTenant', JSON.stringify(mockedTenant));
          setCurrentTenant(mockedTenant);
          setError(null);
          
          // Aplicar configuraciones específicas del tenant simulado
          applyTenantSettings(mockedTenant);
        } else {
          setCurrentTenant(null);
          setError('Tenant no encontrado');
        }
      }
    } catch (err) {
      console.error('Error al cargar información del tenant:', err);
      
      // En caso de error, usar datos del usuario autenticado como respaldo
      const userToken = localStorage.getItem('token');
      if (userToken) {
        try {
          const decoded = JSON.parse(atob(userToken.split('.')[1]));
          if (decoded.tenantId && decoded.tenantId === tenantId) {
            console.log("Usando tenantId del token como respaldo");
            
            // Crear un tenant básico a partir del ID
            const basicTenant = {
              id: tenantId,
              _id: tenantId,
              name: "Tenant " + tenantId,
              customization: {
                primaryColor: '#3b82f6',
                secondaryColor: '#333333'
              }
            };
            
            setCurrentTenant(basicTenant);
            applyTenantSettings(basicTenant);
            setError('Usando información básica del tenant');
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Error al decodificar token:', e);
        }
      }
      
      // Intentar usar caché si existe
      const cachedTenant = localStorage.getItem('currentTenant');
      if (cachedTenant) {
        try {
          const parsedTenant = JSON.parse(cachedTenant);
          if (parsedTenant.id === tenantId || parsedTenant._id === tenantId) {
            setCurrentTenant(parsedTenant);
            setError('Usando datos en caché. Algunos datos podrían no estar actualizados.');
            applyTenantSettings(parsedTenant);
          } else {
            setCurrentTenant(null);
            setError('Tenant no encontrado');
          }
        } catch (e) {
          setCurrentTenant(null);
          setError('Error al procesar datos del tenant');
        }
      } else {
        setCurrentTenant(null);
        setError('Error al cargar información del tenant');
      }
    } finally {
      setLoading(false);
    }
  }, [API_URL, applyTenantSettings]);

  // Inicialización al cargar el componente
  useEffect(() => {
    const tenantId = detectTenant();
    fetchTenantInfo(tenantId);
  }, [detectTenant, fetchTenantInfo]);

  // Función para cambiar de tenant (principalmente para desarrollo/testing)
  const switchTenant = async (tenantId) => {
    if (!tenantId) return;
    
    await fetchTenantInfo(tenantId);
    
    // En desarrollo, actualizar la URL para reflejar el cambio
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const url = new URL(window.location);
      url.searchParams.set('tenant', tenantId);
      window.history.pushState({}, '', url);
    }
  };

  // Obtener la URL específica del tenant para un endpoint dado
  const getTenantApiUrl = (endpoint) => {
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }
    return `${API_URL}/api/tenants/${currentTenant?.id}${endpoint}`;
  };

  // Verificar si el tenant actual tiene una característica específica
  const hasTenantFeature = (featureName) => {
    if (!currentTenant || !currentTenant.settings || !currentTenant.settings.features) {
      return false;
    }
    return currentTenant.settings.features[featureName] === true;
  };

  // Verificar si el usuario tiene un rol específico en el tenant actual
  const hasTenantRole = (roleName, userId) => {
    if (!currentTenant || !currentTenant.userRoles) {
      return false;
    }
    const userRole = currentTenant.userRoles.find(
      role => role.userId === userId
    );
    return userRole && userRole.role === roleName;
  };

  // Obtener un valor de configuración específico del tenant
  const getTenantConfig = (key, defaultValue) => {
    if (!currentTenant || !currentTenant.customization) {
      return defaultValue;
    }
    
    return currentTenant.customization[key] || defaultValue;
  };

  return (
    <TenantContext.Provider value={{
      currentTenant,
      loading,
      error,
      switchTenant,
      getTenantApiUrl,
      hasTenantFeature,
      hasTenantRole,
      getTenantConfig,
      applyTenantSettings
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export default TenantContext;