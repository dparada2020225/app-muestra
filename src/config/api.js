// Crear un nuevo archivo src/config/api.js

const API_URL = "https://inventario-server-production-fc8d.up.railway.app";

export default API_URL;

// Actualiza src/services/api.js (primera parte)

import axios from 'axios';
import API_URL from '../config/api';

// Interceptor para añadir el token a todas las solicitudes
axios.interceptors.request.use(
  config => {
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

// Interceptor para manejo de errores
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