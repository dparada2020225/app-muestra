// src/services/api.js (fragmento inicial con los interceptores)
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
console.log('API URL configurada:', API_URL);

export const getAuthenticatedImageUrl = (imageId) => {
  if (!imageId) return null;
  
  // Obtener el tenant utilizando la función mejorada
  const tenantSubdomain = getCurrentTenant();
  
  return `${API_URL}/images/${imageId}?tenantId=${tenantSubdomain}`;
};

// Obtener el tenant actual de manera consistente
const getCurrentTenant = () => {
  try {
    // Primero intentar obtener del localStorage
    const cachedTenant = localStorage.getItem('currentTenant');
    if (cachedTenant) {
      const tenant = JSON.parse(cachedTenant);
      if (tenant && tenant.subdomain) {
        return tenant.subdomain;
      }
    }
    
    // Si no hay dato en localStorage, intentar obtener del hostname
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // Para desarrollo local (localhost)
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Intentar obtener de los parámetros de URL
        const urlParams = new URLSearchParams(window.location.search);
        const tenantParam = urlParams.get('tenant');
        if (tenantParam) {
          return tenantParam;
        }
        
        // Intentar obtener del subdominio de localhost
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
    
    console.warn('No se pudo determinar el tenant, usando "demo" por defecto');
    return 'demo'; // Valor por defecto
  } catch (e) {
    console.error('Error al obtener el tenant:', e);
    return 'demo'; // Valor por defecto en caso de error
  }
};

// Interceptor para añadir el tenant a todas las solicitudes
// Interceptor para añadir el tenant a todas las solicitudes
axios.interceptors.request.use(
  config => {
    // Verificar si es una petición de login para superadmin
    if (config.url && config.url.includes('/api/auth/login') && 
        config.data && config.data.username === 'superadmin') {
      console.log("Detectada petición de login para superadmin, no aplicando interceptor");
      return config; // No modificar la configuración
    }
    
    // Añadir token de autorización si existe
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      
      // Verificar si es un token de superadmin
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedToken = JSON.parse(window.atob(base64));
        
        // Si es superadmin, no necesitamos añadir el tenant ID
        if (decodedToken.role === 'superAdmin') {
          console.log("Petición de superAdmin detectada, no se añade tenant ID");
          return config; // Devolver config sin modificar para superAdmin
        }
      } catch (error) {
        console.error("Error al decodificar token:", error);
        // Continuar con el proceso normal si hay error al decodificar
      }
    }
    
    // Para usuarios normales, añadir tenant ID a los headers
    const tenantId = getCurrentTenant(); // Usar la función mejorada
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }
    
    // Si es una solicitud FormData (para subir archivos)
    if (config.data instanceof FormData) {
      // Añadir tenantId al FormData si aún no está presente
      if (!config.data.has('tenantId') && tenantId) {
        config.data.append('tenantId', tenantId);
      }
    } 
    // Si es un objeto regular
    else if (config.data && typeof config.data === 'object' && !config.data.tenantId && tenantId) {
      config.data = {
        ...config.data,
        tenantId: tenantId
      };
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export const productService = {
  // Obtener todos los productos
  getAllProducts: async () => {
    try {
      console.log('Obteniendo todos los productos...');
      const tenantSubdomain = getCurrentTenant();
      // Añadir el tenant a los headers
      const headers = {
        'X-Tenant-ID': tenantSubdomain
      };
      
      const response = await axios.get(`${API_URL}/api/products`, { headers });
      console.log('Productos obtenidos:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      console.log('Detalles del error:', error.response?.data);
      throw error;
    }
  },
  
  // Crear un nuevo producto
  createProduct: async (productData) => {
    try {
      console.log('Creando nuevo producto con datos:', productData);
      
      // Obtener el tenant actual (usar la función mejorada getCurrentTenant)
      const tenantSubdomain = getCurrentTenant();
      
      // Asegurarse de que el tenant esté incluido en los datos
      const dataWithTenant = {
        ...productData,
        tenantId: tenantSubdomain
      };
      
      const headers = {
        'X-Tenant-ID': tenantSubdomain
      };
      
      const response = await axios.post(`${API_URL}/api/products`, dataWithTenant, { headers });
      console.log('Producto creado con éxito:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      console.log('Respuesta de error:', error.response?.data);
      throw error;
    }
  },
  
  // Actualizar un producto existente
  updateProduct: async (id, productData) => {
    try {
      console.log(`Actualizando producto ${id} con datos:`, productData);
      
      // Obtener el tenant actual (usar la función mejorada getCurrentTenant)
      const tenantSubdomain = getCurrentTenant();
      
      // Asegurarse de que el tenant esté incluido en los datos
      const dataWithTenant = {
        ...productData,
        tenantId: tenantSubdomain
      };
      
      const headers = {
        'X-Tenant-ID': tenantSubdomain
      };
      
      console.log(`Enviando solicitud con tenant: ${tenantSubdomain}`);
      
      const response = await axios.put(`${API_URL}/api/products/${id}`, dataWithTenant, { headers });
      console.log('Producto actualizado con éxito:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      console.log('Respuesta de error:', error.response?.data);
      throw error;
    }
  },
  
  // Eliminar un producto
  deleteProduct: async (id) => {
    try {
      console.log(`Eliminando producto con ID: ${id}`);
      const tenantSubdomain = getCurrentTenant();
      const headers = {
        'X-Tenant-ID': tenantSubdomain
      };
      
      await axios.delete(`${API_URL}/api/products/${id}`, { headers });
      console.log('Producto eliminado con éxito');
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      console.log('Respuesta de error:', error.response?.data);
      throw error;
    }
  },
  
  // Subir imagen
  uploadImage: async (file) => {
    try {
      console.log('Subiendo imagen:', file.name);
      const formData = new FormData();
      formData.append('image', file);
      const tenantSubdomain = getCurrentTenant();
      formData.append('tenantId', tenantSubdomain); // Añadir el tenant al FormData
      
      const headers = {
        'Content-Type': 'multipart/form-data',
        'X-Tenant-ID': tenantSubdomain // Añadir el tenant a los headers
      };
      
      const response = await axios.post(`${API_URL}/upload`, formData, { headers });
      
      console.log('Imagen subida correctamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      console.log('Respuesta de error:', error.response?.data);
      throw error;
    }
  }
};

// Servicios para compras
export const purchaseService = {
  // Obtener todas las compras con opción de filtrado por fecha
  getAllPurchases: async (params = {}) => {
    try {
      console.log('Obteniendo compras con parámetros:', params);
      
      // Construir la URL con los parámetros de consulta
      let url = `${API_URL}/api/purchases`;
      
      // Si hay parámetros de fecha, agregar como query string
      if (params.startDate && params.endDate) {
        const queryParams = new URLSearchParams({
          startDate: params.startDate,
          endDate: params.endDate
        }).toString();
        
        url = `${url}?${queryParams}`;
      }
      
      const response = await axios.get(url);
      console.log('Compras obtenidas:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('Error fetching purchases:', error);
      console.log('Detalles del error:', error.response?.data);
      throw error;
    }
  },
  
  // Obtener una compra por ID
  getPurchaseById: async (id) => {
    try {
      console.log(`Obteniendo compra con ID: ${id}`);
      const response = await axios.get(`${API_URL}/api/purchases/${id}`);
      console.log('Compra obtenida:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching purchase:', error);
      console.log('Detalles del error:', error.response?.data);
      throw error;
    }
  },
  
  // Crear una nueva compra
  createPurchase: async (purchaseData) => {
    try {
      console.log('Creando nueva compra con datos:', purchaseData);
      const response = await axios.post(`${API_URL}/api/purchases`, purchaseData);
      console.log('Compra creada con éxito:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating purchase:', error);
      console.log('Detalles del error:', error.response?.data);
      throw error;
    }
  }
};

// Servicios para ventas
export const saleService = {
  // Obtener todas las ventas con opción de filtrado por fecha
  getAllSales: async (params = {}) => {
    try {
      console.log('Obteniendo ventas con parámetros:', params);
      
      // Construir la URL con los parámetros de consulta
      let url = `${API_URL}/api/sales`;
      
      // Si hay parámetros de fecha, agregar como query string
      if (params.startDate && params.endDate) {
        const queryParams = new URLSearchParams({
          startDate: params.startDate,
          endDate: params.endDate
        }).toString();
        
        url = `${url}?${queryParams}`;
      }
      
      const response = await axios.get(url);
      console.log('Ventas obtenidas:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales:', error);
      console.log('Detalles del error:', error.response?.data);
      throw error;
    }
  },
  
  // Obtener una venta por ID
  getSaleById: async (id) => {
    try {
      console.log(`Obteniendo venta con ID: ${id}`);
      const response = await axios.get(`${API_URL}/api/sales/${id}`);
      console.log('Venta obtenida:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching sale:', error);
      console.log('Detalles del error:', error.response?.data);
      throw error;
    }
  },
  
  // Crear una nueva venta
  createSale: async (saleData) => {
    try {
      console.log('Creando nueva venta con datos:', saleData);
      const response = await axios.post(`${API_URL}/api/sales`, saleData);
      console.log('Venta creada con éxito:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating sale:', error);
      console.log('Detalles del error:', error.response?.data);
      throw error;
    }
  }
};

// Servicio de autenticación
export const authService = {
  // Iniciar sesión
  login: async (credentials) => {
    try {
      console.log('Iniciando sesión...', credentials.username);
      
      // Verificar si es superadmin
      const isSuperAdmin = credentials.username === 'superadmin';
      
      // Preparar configuración para la petición
      let config = {};
      
      // Si no es superadmin y hay un tenant, añadirlo a los headers
      if (!isSuperAdmin) {
        const tenantId = getCurrentTenant();
        if (tenantId) {
          config.headers = {
            'X-Tenant-ID': tenantId
          };
          // También añadir al body para mayor compatibilidad
          credentials.tenantId = tenantId;
        }
      }
      
      // Usar la ruta directa, no la ruta del tenant
      const response = await axios.post(`${API_URL}/api/auth/login`, credentials, config);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        console.log('Sesión iniciada con éxito');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      console.log('Detalles del error:', error.response?.data);
      throw error;
    }
  },
  
  // Registrar usuario
  register: async (userData) => {
    try {
      console.log('Registrando nuevo usuario:', userData.username);
      // Usar la ruta directa, no la ruta del tenant
      const response = await axios.post(`${API_URL}/api/auth/register`, userData);
      console.log('Usuario registrado con éxito');
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      console.log('Detalles del error:', error.response?.data);
      throw error;
    }
  },
  
  // Obtener información del usuario actual
  getCurrentUser: async () => {
    try {
      console.log('Obteniendo información del usuario actual...');
      // Usar la ruta directa, no la ruta del tenant
      const response = await axios.get(`${API_URL}/api/auth/me`);
      console.log('Información de usuario obtenida');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      console.log('Detalles del error:', error.response?.data);
      throw error;
    }
  },
  
  // Obtener todos los usuarios (solo para admin)
  getAllUsers: async () => {
    try {
      console.log('Obteniendo todos los usuarios...');
      const response = await axios.get(`${API_URL}/api/auth/users`);
      console.log('Usuarios obtenidos:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('Error getting all users:', error);
      console.log('Detalles del error:', error.response?.data);
      throw error;
    }
  },
  
  // Cerrar sesión
  logout: () => {
    console.log('Cerrando sesión...');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    console.log('Sesión cerrada');
  }
};

export default productService;