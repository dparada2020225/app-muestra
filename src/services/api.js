// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
console.log('API URL configurada:', API_URL);

export const getAuthenticatedImageUrl = (imageId) => {
  if (!imageId) return null;
  const token = localStorage.getItem('token');
  return `${API_URL}/images/${imageId}${token ? `?token=${token}` : ''}`;
};

// Interceptor para añadir el token a todas las solicitudes
axios.interceptors.request.use(
  config => {
    // Obtener el subdominio actual
    const host = window.location.host;
    const hostParts = host.split('.');
    
    // Si hay un subdominio, agregarlo como header
    if (hostParts.length > 1) {
      const subdomain = hostParts[0];
      config.headers['X-Tenant-ID'] = subdomain;
      console.log(`Enviando petición con X-Tenant-ID: ${subdomain}`);
    }
    
    // Añadir el token si existe
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => response,
  error => {
    // Registrar errores para depuración
    console.error('Error en solicitud API:', error);
    
    if (error.response) {
      // La solicitud fue hecha y el servidor respondió con un código de estado
      // que no está en el rango 2xx
      console.error('Datos de respuesta de error:', error.response.data);
      console.error('Código de estado:', error.response.status);
      console.error('Headers de respuesta:', error.response.headers);
      
      // Manejar token expirado o inválido (401)
      if (error.response.status === 401) {
        console.warn('Error de autenticación detectado, limpiando sesión...');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        
        // Si estamos en un entorno con window, podemos intentar redireccionar
        if (typeof window !== 'undefined') {
          console.log('Redirigiendo a login...');
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error('No se recibió respuesta:', error.request);
      
      // Intentar detectar si es un problema de CORS
      if (error.message && error.message.includes('Network Error')) {
        console.error('Posible error de CORS o problema de red');
      }
    } else {
      // Algo sucedió al configurar la solicitud que desencadenó un error
      console.error('Error al configurar la solicitud:', error.message);
    }
    
    return Promise.reject(error);
  }
);
const getCurrentTenant = () => {
  // try {
  //   const cachedTenant = localStorage.getItem('currentTenant');
  //   if (cachedTenant) {
  //     return JSON.parse(cachedTenant).id || 'demo';
  //   }
  // } catch (e) {
  //   console.error('Error al obtener el tenant del localStorage:', e);
  // }
  return 'demo'; // Tenant por defecto
};

// Interceptor para añadir el tenant a todas las solicitudes
axios.interceptors.request.use(
  config => {
    console.log(`Realizando petición a: ${config.url}`);
    
    // Añadir token de autorización si existe
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Añadir tenant ID a los headers
    const tenantId = getCurrentTenant();
    config.headers['X-Tenant-ID'] = tenantId;
    
    // Si es una solicitud FormData (para subir archivos)
    if (config.data instanceof FormData) {
      // Añadir tenantId al FormData
      if (!config.data.has('tenantId')) {
        console.log('Añadiendo tenantId al FormData para subida de archivo:', tenantId);
        config.data.append('tenantId', tenantId);
      }
    } 
    // Si es un objeto regular
    else if (config.data && typeof config.data === 'object' && !config.data.tenantId) {
      console.log('Añadiendo tenantId a los datos de la solicitud:', tenantId);
      config.data = {
        ...config.data,
        tenantId: tenantId
      };
    }
    
    return config;
  },
  error => {
    console.error('Error en la configuración de la solicitud:', error);
    return Promise.reject(error);
  }
);

export const productService = {
  // Obtener todos los productos
  getAllProducts: async () => {
    try {
      console.log('Obteniendo todos los productos...');
      
      // Añadir el tenant a los headers
      const headers = {
        'X-Tenant-ID': 'demo'
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
      
      // Asegurarse de que el tenant esté incluido en los datos
      const dataWithTenant = {
        ...productData,
        tenantId: 'demo'
      };
      
      const headers = {
        'X-Tenant-ID': 'demo'
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
      
      // Asegurarse de que el tenant esté incluido en los datos
      const dataWithTenant = {
        ...productData,
        tenantId: 'demo'
      };
      
      const headers = {
        'X-Tenant-ID': 'demo'
      };
      
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
      
      const headers = {
        'X-Tenant-ID': 'demo'
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
      formData.append('tenantId', 'demo'); // Añadir el tenant al FormData
      
      const headers = {
        'Content-Type': 'multipart/form-data',
        'X-Tenant-ID': 'demo' // Añadir el tenant a los headers
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
      console.log('Iniciando sesión...');
      // Usar la ruta directa, no la ruta del tenant
      const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      console.log('Sesión iniciada con éxito');
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