// src/pages/Admin/UserManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

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
  background-color: ${props => props.role === 'admin' ? '#9c27b0' : '#2196f3'};
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
  const [initialized, setInitialized] = useState(false);
  
  const { getAllUsers, isAdmin } = useAuth();
  
  // Función para cargar usuarios una sola vez
  const fetchUsers = useCallback(async (forceRefresh = false) => {
    if (!isAdmin) return;
    
    // No cargar si ya estamos cargando, excepto si es forzado
    if (loading && !forceRefresh) return;
    
    try {
      setLoading(true);
      
      // Pasar el parámetro forceRefresh para indicar si debe ignorar la caché
      const data = await getAllUsers(forceRefresh);
      
      if (Array.isArray(data)) {
        console.log("Datos de usuarios recibidos:", data);
        setUsers(data);
        setError('');
        setInitialized(true);
      } else {
        setError('La respuesta del servidor no es válida');
        console.error('Respuesta no válida del servidor:', data);
      }
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError(`Error al cargar usuarios: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  }, [getAllUsers, isAdmin, loading]);
  
  // Cargar usuarios solo cuando se monta el componente
  useEffect(() => {
    if (!initialized && isAdmin) {
      fetchUsers();
    }
  }, [fetchUsers, initialized, isAdmin]);
  
  // Función para forzar la actualización de usuarios
  const handleRefresh = () => {
    fetchUsers(true); // Pasar true para forzar actualización
  };
  
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
                      {user.role === 'admin' ? 'Administrador' : 'Usuario'}
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