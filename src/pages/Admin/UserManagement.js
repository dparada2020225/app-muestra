// src/pages/Admin/UserManagement.js - corregido
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const Container = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
`;

const Title = styled.h1`
  margin-bottom: 30px;
  color: ${props => props.theme.colors.text};
  text-align: center;
`;

const Button = styled(Link)`
  display: inline-block;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.secondary};
  padding: 10px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 20px;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.small};
`;

const Th = styled.th`
  text-align: left;
  padding: 16px;
  background-color: ${props => props.theme.colors.secondary};
  color: white;
`;

const Td = styled.td`
  padding: 16px;
  border-bottom: 1px solid #eee;
`;

const Tr = styled.tr`
  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
  
  &:last-child td {
    border-bottom: none;
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background-color: ${props => {
    switch(props.role) {
      case 'tenantAdmin': return '#2196f3';
      case 'tenantManager': return '#4caf50';
      case 'tenantUser': return '#ff9800';
      default: return '#9c27b0';
    }
  }};
  color: white;
`;

const LoadingWrapper = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: ${props => props.theme.colors.textLight};
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.danger};
  background-color: rgba(255, 0, 0, 0.1);
  border-left: 3px solid ${props => props.theme.colors.danger};
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
`;

const RefreshButton = styled.button`
  background-color: ${props => props.theme.colors.secondary};
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  margin-left: 15px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    background-color: #333;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, token } = useAuth();
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Función corregida para obtener usuarios
  const fetchUsers = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Usar endpoint directo ya que el método getAllUsers puede tener problemas
      const response = await axios.get(`${API_URL}/api/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (Array.isArray(response.data)) {
        console.log("Datos de usuarios recibidos:", response.data);
        setUsers(response.data);
      } else {
        setError('La respuesta del servidor no es válida');
        console.error('Respuesta no válida del servidor:', response.data);
      }
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError(`Error al cargar usuarios: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);
  
  // Cargar usuarios cuando se monta el componente
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Función para forzar la actualización de usuarios
  const handleRefresh = () => {
    fetchUsers();
  };
  
  // Determinar si el usuario tiene permisos para administrar usuarios
  const isAuthorized = user && (user.role === 'tenantAdmin' || user.role === 'superAdmin');
  
  if (!isAuthorized) {
    return (
      <Container>
        <ErrorMessage>No tienes permiso para acceder a esta página</ErrorMessage>
      </Container>
    );
  }
  
  return (
    <Container>
      <Title>Administración de Usuarios</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button to="/admin/users/new">Crear Nuevo Usuario</Button>
        <RefreshButton onClick={handleRefresh} disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar lista'}
        </RefreshButton>
      </div>
      
      {loading ? (
        <LoadingWrapper>Cargando usuarios...</LoadingWrapper>
      ) : (
        <Table>
          <thead>
            <Tr>
              <Th>ID</Th>
              <Th>Usuario</Th>
              <Th>Rol</Th>
              <Th>Fecha de Creación</Th>
            </Tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? (
              users.map(user => (
                <Tr key={user._id}>
                  <Td>{user._id}</Td>
                  <Td>{user.username}</Td>
                  <Td>
                    <Badge role={user.role}>
                      {user.role === 'tenantAdmin' ? 'Administrador' : 
                       user.role === 'tenantManager' ? 'Manager' : 
                       user.role === 'tenantUser' ? 'Usuario' : user.role}
                    </Badge>
                  </Td>
                  <Td>{new Date(user.createdAt).toLocaleString()}</Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan="4" style={{ textAlign: 'center' }}>No hay usuarios para mostrar</Td>
              </Tr>
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default UserManagement;