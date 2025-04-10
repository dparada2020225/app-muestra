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

  // Función para detectar el tenant basado en el subdominio
  // const detectTenant = useCallback(() => {
  //   const hostname = window.location.hostname;
    
  //   // Para desarrollo local (localhost), permitir especificar tenant mediante searchParams
  //   if (hostname === 'localhost' || hostname === '127.0.0.1') {
  //     const urlParams = new URLSearchParams(window.location.search);
  //     const tenantParam = urlParams.get('tenant');
      
  //     if (tenantParam) {
  //       return tenantParam;
  //     }
      
  //     // Si no hay parámetro tenant, usar 'default' para desarrollo
  //     return 'default';
  //   }
    
  //   // En producción, extraer el tenant del subdominio
  //   const parts = hostname.split('.');
    
  //   // Si es un subdominio (al menos 3 partes: tenant.domain.tld)
  //   if (parts.length >= 3) {
  //     return parts[0];
  //   }
    
  //   // Si es dominio principal, podría ser la página de landing o registro
  //   return null;
  // }, []);

  // Modificar la función detectTenant en TenantContext.js
const detectTenant = useCallback(() => {
  const hostname = window.location.hostname;
  
  // Para desarrollo local (localhost), permitir especificar tenant mediante searchParams
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const urlParams = new URLSearchParams(window.location.search);
    const tenantParam = urlParams.get('tenant');
    
    if (tenantParam) {
      return tenantParam;
    }
    
    // MODIFICACIÓN TEMPORAL: Devolver un tenant predeterminado para desarrollo
    console.log("Usando tenant predeterminado para desarrollo: 'default'");
    return 'default';
  }
  
  // En producción, extraer el tenant del subdominio
  const parts = hostname.split('.');
  
  // Si es un subdominio (al menos 3 partes: tenant.domain.tld)
  if (parts.length >= 3) {
    return parts[0];
  }
  
  // Si es dominio principal, podría ser la página de landing o registro
  return null;
}, []);

  // Cargar información del tenant
  // const fetchTenantInfo = useCallback(async (tenantId) => {
  //   if (!tenantId) {
  //     setCurrentTenant(null);
  //     setLoading(false);
  //     return;
  //   }
    
  //   try {
  //     setLoading(true);
  //     const response = await axios.get(`${API_URL}/api/tenants/${tenantId}`);
      
  //     if (response.data) {
  //       // Guardar en localStorage para acceso rápido en futuras cargas
  //       localStorage.setItem('currentTenant', JSON.stringify(response.data));
  //       setCurrentTenant(response.data);
  //       setError(null);
        
  //       // Aplicar configuraciones específicas del tenant (tema, etc.)
  //       applyTenantSettings(response.data);
  //     } else {
  //       setCurrentTenant(null);
  //       setError('Tenant no encontrado');
  //     }
  //   } catch (err) {
  //     console.error('Error al cargar información del tenant:', err);
      
  //     // En caso de error, intentar usar datos en caché
  //     const cachedTenant = localStorage.getItem('currentTenant');
  //     if (cachedTenant) {
  //       try {
  //         const parsedTenant = JSON.parse(cachedTenant);
  //         if (parsedTenant.id === tenantId) {
  //           setCurrentTenant(parsedTenant);
  //           setError('Usando datos en caché. Algunos datos podrían no estar actualizados.');
  //           applyTenantSettings(parsedTenant);
  //         } else {
  //           setCurrentTenant(null);
  //           setError('Tenant no encontrado');
  //         }
  //       } catch (e) {
  //         setCurrentTenant(null);
  //         setError('Error al procesar datos del tenant');
  //       }
  //     } else {
  //       setCurrentTenant(null);
  //       setError('Error al cargar información del tenant');
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [API_URL]);

  // Modificar la función fetchTenantInfo en TenantContext.js
const fetchTenantInfo = useCallback(async (tenantId) => {
  if (!tenantId) {
    setCurrentTenant(null);
    setLoading(false);
    return;
  }
  
  try {
    setLoading(true);
    
    // MODIFICACIÓN TEMPORAL: Simular datos del tenant para desarrollo
    // Quitar o comentar esto cuando el backend esté listo
    console.log("Usando datos de tenant simulados para desarrollo");
    const mockedTenant = {
      id: tenantId,
      name: tenantId.charAt(0).toUpperCase() + tenantId.slice(1), // Capitalizar
      slogan: 'Sistema de Gestión de Inventario',
      description: 'Accede a tu cuenta para gestionar tu inventario, realizar compras, ventas y mucho más.',
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#333333'
      }
    };
    
    localStorage.setItem('currentTenant', JSON.stringify(mockedTenant));
    setCurrentTenant(mockedTenant);
    setError(null);
    setLoading(false);
    return;
    
    // Cuando el backend esté listo, descomentar esto:
    /*
    const response = await axios.get(`${API_URL}/api/tenants/${tenantId}`);
    
    if (response.data) {
      localStorage.setItem('currentTenant', JSON.stringify(response.data));
      setCurrentTenant(response.data);
      setError(null);
      
      // Aplicar configuraciones específicas del tenant (tema, etc.)
      applyTenantSettings(response.data);
    } else {
      setCurrentTenant(null);
      setError('Tenant no encontrado');
    }
    */
  } catch (err) {
    console.error('Error al cargar información del tenant:', err);
    
    // En caso de error, intentar usar datos en caché
    const cachedTenant = localStorage.getItem('currentTenant');
    if (cachedTenant) {
      try {
        const parsedTenant = JSON.parse(cachedTenant);
        if (parsedTenant.id === tenantId) {
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
}, [API_URL]);

  // Aplicar configuraciones del tenant (tema, logo, etc.)
  const applyTenantSettings = (tenant) => {
    if (!tenant) return;
    
    // Aplicar tema personalizado si existe
    if (tenant.theme) {
      // Aquí puedes implementar la lógica para aplicar el tema
      // Por ejemplo, modificando CSS variables
      document.documentElement.style.setProperty('--primary-color', tenant.theme.primaryColor || '#3b82f6');
      document.documentElement.style.setProperty('--secondary-color', tenant.theme.secondaryColor || '#333333');
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
  };

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
    if (!currentTenant || !currentTenant.features) {
      return false;
    }
    return currentTenant.features.includes(featureName);
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

  return (
    <TenantContext.Provider value={{
      currentTenant,
      loading,
      error,
      switchTenant,
      getTenantApiUrl,
      hasTenantFeature,
      hasTenantRole
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export default TenantContext;