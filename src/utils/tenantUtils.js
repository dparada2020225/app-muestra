// src/utils/tenantUtils.js

/**
 * Obtiene el ID del tenant actual de manera consistente
 * Prioridad: localStorage > subdominio > parámetro URL > 'demo'
 * @returns {string} ID del tenant
 */
export const getCurrentTenant = () => {
    try {
      // 1. Intentar obtener desde localStorage (fuente más confiable)
      const cachedTenant = localStorage.getItem('currentTenant');
      if (cachedTenant) {
        const tenant = JSON.parse(cachedTenant);
        if (tenant && (tenant.subdomain || tenant.id)) {
          return tenant.subdomain || tenant.id;
        }
      }
      
      // 2. Intentar obtener del hostname (subdominio)
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        
        // Para desarrollo local (localhost)
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          // 2.1 Intentar obtener de los parámetros de URL
          const urlParams = new URLSearchParams(window.location.search);
          const tenantParam = urlParams.get('tenant');
          if (tenantParam) {
            return tenantParam;
          }
          
          // 2.2 Intentar obtener del subdominio de localhost
          const parts = hostname.split('.');
          if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost') {
            return parts[0];
          }
        } else {
          // En producción, obtener del subdominio
          const parts = hostname.split('.');
          if (parts.length >= 2 && parts[0] !== 'www') {
            return parts[0];
          }
        }
      }
      
      // 3. Valor por defecto
      return 'demo';
    } catch (e) {
      console.error('Error al obtener el tenant:', e);
      return 'demo'; // Valor por defecto en caso de error
    }
  };
  
  /**
   * Verifica si el usuario actual es un superadmin
   * @param {Object} user - Objeto de usuario actual
   * @returns {boolean} true si es superadmin
   */
  export const isSuperAdmin = (user) => {
    return user && user.role === 'superAdmin';
  };
  
  /**
   * Construye una URL de API considerando si es para superadmin o para tenant
   * @param {string} endpoint - Endpoint de la API
   * @param {Object} user - Usuario actual (opcional)
   * @param {Object} options - Opciones adicionales
   * @returns {string} URL completa
   */
  export const buildApiUrl = (endpoint, user = null, options = {}) => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    // Si es superadmin o el endpoint es específico para superadmin
    if ((user && isSuperAdmin(user)) || options.superAdminEndpoint) {
      return `${API_URL}${endpoint}`;
    }
    
    // Si es un endpoint específico de tenant
    if (options.tenantEndpoint) {
      const tenantId = getCurrentTenant();
      return `${API_URL}/api/tenant${endpoint}`;
    }
    
    // Endpoint normal
    return `${API_URL}${endpoint}`;
  };