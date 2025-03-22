// src/pages/Login/Login.js
import React, { useState, useEffect } from 'react';
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

const Logo = styled.img`
  display: block;
  margin: 0 auto 30px;
  max-width: 150px;
  height: auto;
`;

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [formError, setFormError] = useState('');
  
  const { login, error, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
console.log("URL de la API:", process.env.REACT_APP_API_URL);

const testAPIConnection = async () => {
  try {
    const testUrl = `${process.env.REACT_APP_API_URL || 'https://inventario-server-production-fc8d.up.railway.app'}/api/test`;
    console.log("Intentando conectar a:", testUrl);
    const response = await axios.get(testUrl);
    console.log("Respuesta del servidor:", response.data);
  } catch (error) {
    console.error("Error conectando con la API:", error);
    if (error.response) {
      console.error("Datos de error:", error.response.data);
      console.error("Estado:", error.response.status);
    } else if (error.request) {
      console.error("No se recibió respuesta del servidor");
    } else {
      console.error("Error de configuración:", error.message);
    }
  }
};

testAPIConnection();
}, []);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!formData.username || !formData.password) {
      setFormError('Por favor completa todos los campos');
      return;
    }
    
    const success = await login(formData.username, formData.password);
    if (success) {
      navigate('/');
    }
  };
  
  if (loading) {
    return <Container><div>Cargando...</div></Container>;
  }
  
  return (
    <Container>
      <Logo src="/logotipoPng2.png" alt="Reconstructora Antigua Jr." />
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
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </Form>
    </Container>
  );
};

export default Login;