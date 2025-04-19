// src/pages/AuthRedirect/AuthRedirect.js
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Obtener el token de la URL
    const params = new URLSearchParams(location.search);
    const impersonationToken = params.get('impersonationToken');
    
    if (impersonationToken) {
      // Guardar el token en localStorage
      localStorage.setItem('token', impersonationToken);
      
      // Configurar el token en los headers de Axios
      // (podrías importar axios aquí o usar un servicio)
      // axios.defaults.headers.common['Authorization'] = `Bearer ${impersonationToken}`;
      
      // Redirigir a la página de productos
      navigate('/products', { replace: true });
    } else {
      // Si no hay token, redirigir al login
      navigate('/login', { replace: true });
    }
  }, [navigate, location]);
  
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      Procesando autenticación...
    </div>
  );
};

export default AuthRedirect;