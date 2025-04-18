// src/context/AuthContext.js - con verificación de usuarios inactivos
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTenant } from './TenantContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Obtener información del tenant actual
  const { currentTenant, getTenantApiUrl } = useTenant();
  
  // Caché para la lista de usuarios con tiempo de expiración
  const [usersCache, setUsersCache] = useState({
    data: null,
    timestamp: 0,
    loading: false
  });
  
  // Tiempo de expiración de la caché: 1 minuto (60000 ms)
  const CACHE_EXPIRY_TIME = 60000;
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Configurar el token en los headers por defecto
  // useEffect(() => {}, [token]);


  // Verificar token al cargar el componente o cuando cambia el tenant
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  
    const verifyToken = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
    
      try {
        console.log("Verificando token...");
        
        // CAMBIAR ESTA PARTE: No usar la URL específica del tenant para /auth/me
        // Usar la URL directa en su lugar
        const url = `${API_URL}/api/auth/me`;
        console.log("Consultando ruta:", url);
        
        const res = await axios.get(url);
        console.log("Respuesta de verificación de token:", res.data);
        
        // Verificar si el usuario está activo
        if (res.data && res.data.isActive === false) {
          console.error('El usuario está desactivado');
          setToken(null);
          setUser(null);
          setError('Tu cuenta ha sido desactivada. Por favor, contacta con el administrador.');
          
          // Limpiar el token y redirigir al login
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
          return;
        }
        
        // Verificar si el usuario pertenece al tenant actual
        if (currentTenant && res.data.tenantId !== currentTenant.id) {
          console.error('El usuario no pertenece a este tenant');
          setToken(null);
          setUser(null);
          setError('No tienes acceso a este tenant. Por favor inicia sesión con una cuenta válida.');
        } else {
          setUser(res.data);
          setError(null);
        }
      } catch (err) {
        console.error('Error verificando token:', err);
        // Mostrar detalles específicos del error para depuración
        if (err.response) {
          console.error('Respuesta del servidor:', err.response.data);
          console.error('Código de estado:', err.response.status);
        } else if (err.request) {
          console.error('No se recibió respuesta del servidor:', err.request);
        } else {
          console.error('Error en la configuración de la solicitud:', err.message);
        }
        
        setToken(null);
        setUser(null);
        setError('Sesión expirada. Por favor inicia sesión nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, API_URL, currentTenant, getTenantApiUrl, navigate]);

// Función login actualizada con manejo especial para superadmin y verificación de usuario inactivo
const login = async (username, password) => {
  try {
    setLoading(true);
    setError('');
    console.log("Iniciando sesión con:", { username });
    
    // Verificar si es un intento de login como superadmin
    const isSuperAdminLogin = username === 'superadmin';
    
    // URL para login
    const url = `${API_URL}/api/auth/login`;
    
    // Preparar datos para login
    let loginData = { username, password };
    
    // Configuración para la petición
    const config = {};
    
    // Si NO es superadmin, buscar tenantId
    if (!isSuperAdminLogin) {
      // Obtener el subdominio actual
      const host = window.location.host;
      console.log("Host actual:", host);
      
      // Si estamos en un subdominio, extraerlo y agregarlo a la solicitud
      if (host.includes('.') && !host.startsWith('www.')) {
        const subdomain = host.split('.')[0];
        if (subdomain !== 'localhost' && subdomain !== 'www') {
          console.log(`Detectado subdominio: ${subdomain}`);
          loginData.tenantId = subdomain;
          
          // También añadir en los headers para mayor compatibilidad
          config.headers = {
            'X-Tenant-ID': subdomain
          };
        }
      }
    }
    
    console.log("Datos de login:", loginData);
    console.log("Configuración:", config);
    
    // Realizar la petición con los datos y configuración apropiados
    const response = await axios.post(url, loginData, config);
    console.log("Respuesta de login:", response.data);
    
    // Verificar si el usuario está activo
    if (response.data.user && response.data.user.isActive === false) {
      setError('Tu cuenta ha sido desactivada. Por favor, contacta con el administrador.');
      return false;
    }
    
    if (response.data.token) {
      setToken(response.data.token);
      setUser(response.data.user);
      setError(null);
      
      // Almacenar en localStorage
      localStorage.setItem('token', response.data.token);
      
      // Configurar el token en los encabezados de Axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      // Si es superadmin, redirigir al dashboard correspondiente
      if (isSuperAdminLogin) {
        navigate('/super-admin-welcome');
      }
      
      return true;
    } else {
      setError('Respuesta inválida del servidor');
      return false;
    }
  } catch (error) {
    console.error('Error en login:', error);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
      
      // Verificar si el error es por usuario inactivo
      if (error.response.data && error.response.data.isActive === false) {
        setError('Tu cuenta ha sido desactivada. Por favor, contacta con el administrador.');
      } else {
        setError(error.response.data.message || error.response.data.error || 'Error al iniciar sesión');
      }
    } else {
      setError('Error de conexión al servidor');
    }
    return false;
  } finally {
    setLoading(false);
  }
};

  // Registrar usuario - actualizado para incluir tenantId
  const register = async (userData) => {
    try {
      setLoading(true);
      console.log("Registrando usuario:", userData.username);
      
      // Para registro de usuarios normales (dentro de un tenant)
      let url, registrationData;
      
      if (userData.isTenantRegistration) {
        // Si es registro de tenant (en el dominio principal)
        url = `${API_URL}/api/tenants/register`;
        registrationData = userData;
      } else {
        // Si es registro de usuario dentro de un tenant
        url = currentTenant 
          ? getTenantApiUrl('/auth/register')
          : `${API_URL}/api/auth/register`;
        
        // Incluir tenantId en la solicitud si está disponible
        registrationData = { 
          ...userData,
          ...(currentTenant && { tenantId: currentTenant.id }),
          isActive: true // Asegurar que el usuario nuevo se crea como activo
        };
      }
      
      const res = await axios.post(url, registrationData);
      console.log("Respuesta de registro:", res.data);
      setError(null);
      
      // Invalidar caché de usuarios después de registrar uno nuevo
      setUsersCache(prev => ({
        ...prev,
        data: null,
        timestamp: 0
      }));
      
      return res.data;
    } catch (err) {
      console.error('Error en registro:', err);
      if (err.response) {
        console.error('Respuesta del servidor:', err.response.data);
        setError(err.response.data.message || 'Error al registrar usuario');
      } else {
        setError('Error de conexión al servidor');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const logout = () => {
    setToken(null);
    setUser(null);
    
    // Limpiar caché al cerrar sesión
    setUsersCache({
      data: null,
      timestamp: 0,
      loading: false
    });
    
    navigate('/login');
  };

  // Obtener todos los usuarios (solo admin) - versión optimizada con caché
  const getAllUsers = useCallback(async (forceRefresh = false) => {
    // Verificar si es admin antes de intentar obtener usuarios
    if (!user || user.role !== 'admin') {
      return Promise.reject(new Error('No autorizado para obtener usuarios'));
    }
    
    // Si ya hay una solicitud en curso, esperar a que termine
    if (usersCache.loading) {
      console.log("Solicitud de usuarios en curso, esperando...");
      
      // Devolver la promesa de datos anteriores si están disponibles
      if (usersCache.data) {
        return Promise.resolve(usersCache.data);
      }
      
      // Esperar 500ms y volver a intentar
      return new Promise(resolve => {
        setTimeout(() => {
          getAllUsers().then(resolve);
        }, 500);
      });
    }
    
    const now = Date.now();
    
    // Verificar si ya tenemos datos en caché y no están expirados
    if (
      !forceRefresh &&
      usersCache.data && 
      (now - usersCache.timestamp < CACHE_EXPIRY_TIME)
    ) {
      console.log("Usando datos de usuarios en caché");
      return Promise.resolve(usersCache.data);
    }
    
    try {
      // Marcar que hay una solicitud en curso
      setUsersCache(prev => ({ ...prev, loading: true }));
      
      console.log("Solicitando lista de usuarios...");
      
      // Usar la URL específica del tenant si está disponible
      const url = currentTenant 
        ? getTenantApiUrl('/auth/users')
        : `${API_URL}/api/auth/users`;
      
      // Usar el token desde el state para mayor seguridad
      const res = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        // Añadir timestamp para evitar cacheo del navegador
        params: {
          _t: new Date().getTime()
        }
      });
      
      // Actualizar la caché
      setUsersCache({
        data: res.data,
        timestamp: now,
        loading: false
      });
      
      return res.data;
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      
      // Información detallada del error para depuración
      if (err.response) {
        console.error('Respuesta del servidor:', err.response.data);
        console.error('Código de estado:', err.response.status);
        setError(err.response.data.message || 'Error al obtener usuarios');
      } else if (err.request) {
        console.error('No se recibió respuesta:', err.request);
        setError('Error de red: No se pudo conectar con el servidor');
      } else {
        console.error('Error en la configuración:', err.message);
        setError(`Error: ${err.message}`);
      }
      
      // Marcar que ya no hay solicitud en curso
      setUsersCache(prev => ({ ...prev, loading: false }));
      
      throw err;
    }
  }, [API_URL, token, user, usersCache, currentTenant, getTenantApiUrl]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      login,
      logout,
      register,
      getAllUsers,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      tenantId: user?.tenantId || currentTenant?.id // Proporcionar tenantId actual
    }}>
      {children}
    </AuthContext.Provider>
  );
};