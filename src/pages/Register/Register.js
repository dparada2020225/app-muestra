// src/pages/Register/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../context/AuthContext';

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
  max-width: 500px;
  margin: 60px auto;
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

const Select = styled.select`
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const Button = styled.button`
  flex: 1;
  background-color: ${props => props.primary ? props.theme.colors.primary : '#6c757d'};
  color: ${props => props.primary ? props.theme.colors.secondary : 'white'};
  border: none;
  border-radius: 6px;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.primary ? props.theme.colors.primaryHover : '#5a6268'};
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

const SuccessMessage = styled.div`
  color: ${props => props.theme.colors.success};
  background-color: rgba(76, 175, 80, 0.1);
  border-left: 3px solid ${props => props.theme.colors.success};
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
`;

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { register, error, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');
    
    // Validaciones
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setFormError('Por favor completa todos los campos');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setFormError('Las contraseñas no coinciden');
      return;
    }
    
    if (formData.password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      setSuccess('Usuario registrado correctamente');
      
      // Limpiar el formulario
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'user'
      });
      
      setTimeout(() => {
        navigate('/admin/users');
      }, 2000);
    } catch (err) {
      console.error('Error en registro:', err);
    }
  };
  
  const handleCancel = () => {
    navigate(-1);
  };
  
  return (
    <Container>
      <Title>Registrar Nuevo Usuario</Title>
      
      {formError && <ErrorMessage>{formError}</ErrorMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="username">Nombre de Usuario</Label>
          <Input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Ingresa el nombre de usuario"
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
            placeholder="Ingresa la contraseña"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirma la contraseña"
            required
          />
        </FormGroup>
        
        {isAdmin && (
          <FormGroup>
            <Label htmlFor="role">Rol</Label>
            <Select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </Select>
          </FormGroup>
        )}
        
        <ButtonGroup>
          <Button type="button" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button primary type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Usuario'}
          </Button>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

export default Register;