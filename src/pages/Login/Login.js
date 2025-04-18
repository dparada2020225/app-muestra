// src/pages/Login/Login.js - con soporte mejorado para superadmin
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  max-width: 400px;
  margin: 80px auto;
  padding: 30px;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 10px;
  box-shadow: ${props => props.theme.shadows.medium};
  animation: ${fadeIn} 0.5s ease forwards;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 30px;
  color: ${props => props.theme.colors.text};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(150, 255, 0, 0.2);
  }
`;

const Button = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.secondary};
  border: none;
  border-radius: 6px;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.danger};
  background-color: rgba(255, 0, 0, 0.1);
  border-left: 3px solid ${props => props.theme.colors.danger};
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;
`;

const LogoImage = styled.img`
  max-width: 100px;
  height: auto;
`;

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
// En el método handleSuperAdminLogin de Login.js
const handleSuperAdminLogin = async () => {
  try {
    setIsLoading(true);
    
    // URL exacta del endpoint
    const loginUrl = process.env.REACT_APP_API_URL + '/api/auth/login' || 'http://localhost:5000/api/auth/login';
    
    console.log("Intentando login de superadmin directamente con:", {
      username: formData.username
    });
    
    // Crear una instancia de axios independiente sin interceptores
    const axiosInstance = axios.create();
    
    // Eliminar cualquier configuración previa
    delete axiosInstance.defaults.headers.common['Authorization'];
    delete axiosInstance.defaults.headers.common['X-Tenant-ID'];
    
    // Petición directa con un tenant por defecto para superar la validación
    const response = await axiosInstance.post(loginUrl, {
      username: formData.username,
      password: formData.password,
      tenantId: "demo" // Añadir un tenant por defecto solo para superar la validación
    });
    
    console.log("Respuesta del servidor:", response.status);
    
    if (response.data && response.data.token) {
      // // Guardar el token en localStorage
      // localStorage.setItem('token', response.data.token);
      
      // // Establecer el token en los headers por defecto
      // axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      // console.log("Login superadmin exitoso, redirigiendo...");
      
      // // Redirigir a la página de superadmin
      // navigate('/super-admin-welcome', { replace: true });
      // return true;

      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      console.log("Login superadmin exitoso, redirigiendo...");

      // 🔁 Forzar recarga para que AuthContext detecte el token y verifique al usuario
      window.location.href = "/super-admin-welcome";
      return true;
    } else {
      setFormError('Respuesta inválida del servidor');
      return false;
    }
  } catch (error) {
    console.error("Error en login de superadmin:", error);
    if (error.response) {
      console.error("Respuesta de error:", error.response.status, error.response.data);
      setFormError(error.response.data.message || error.response.data.error || `Error ${error.response.status}: Credenciales inválidas`);
    } else if (error.request) {
      setFormError('No se recibió respuesta del servidor');
    } else {
      setFormError(`Error: ${error.message}`);
    }
    return false;
  } finally {
    setIsLoading(false);
  }
};
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!formData.username || !formData.password) {
      setFormError('Por favor completa todos los campos');
      return;
    }
    
    // Si es superadmin, usar la función específica
    if (formData.username === 'superadmin') {
      console.log("Detectado intento de login como superadmin, usando método directo");
      await handleSuperAdminLogin();
      return;
    }
    
    // Para otros usuarios, usar el método normal
    try {
      console.log("Intentando login con usuario normal:", {username: formData.username});
      const success = await login(formData.username, formData.password);
      
      if (success) {
        console.log("Login exitoso, redirigiendo...");
        navigate('/products', { replace: true });
      } else {
        console.log("Login falló");
      }
    } catch (error) {
      console.error("Error en login:", error);
    }
  };
  
  return (
    <Container>
     <Logo>
      <LogoImage src="/logoMuestra.png" alt="Inventory System" />
    </Logo>
      <Title>Iniciar Sesión</Title>
      
      {(error || formError) && <ErrorMessage>{error || formError}</ErrorMessage>}
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="username">Usuario</Label>
          <Input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Ingresa tu nombre de usuario"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Ingresa tu contraseña"
            required
          />
        </FormGroup>
        
        <Button type="submit" disabled={loading || isLoading}>
          {loading || isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </Form>
    </Container>
  );
};

export default Login;