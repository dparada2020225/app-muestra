// src/pages/Admin/SuperAdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Container = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  margin-bottom: 20px;
  text-align: center;
`;

const Subtitle = styled.h2`
  color: ${props => props.theme.colors.textLight};
  font-size: 1.2rem;
  font-weight: normal;
  margin-bottom: 30px;
  text-align: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  padding: 20px;
  box-shadow: ${props => props.theme.shadows.small};
  border-top: 3px solid ${props => props.color || props.theme.colors.primary};
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

const StatTitle = styled.div`
  color: ${props => props.theme.colors.textLight};
  font-size: 0.9rem;
  margin-bottom: 10px;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme.colors.text};
  margin-bottom: 5px;
`;

const TenantGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  margin-bottom: 30px;
`;

const TenantCard = styled.div`
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  padding: 15px;
  box-shadow: ${props => props.theme.shadows.small};
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

const TenantInfo = styled.div`
  display: flex;
  align-items: center;
`;

const TenantLogo = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background-color: ${props => props.color || '#f0f0f0'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  margin-right: 15px;
`;

const TenantDetails = styled.div``;

const TenantName = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  color: ${props => props.theme.colors.text};
`;

const TenantSubdomain = styled.div`
  color: ${props => props.theme.colors.textLight};
  font-size: 0.9rem;
`;

const TenantStatus = styled.div`
  background-color: ${props => {
    switch(props.status) {
      case 'active': return '#4caf50';
      case 'trial': return '#ff9800';
      case 'suspended': return '#f44336';
      default: return '#9e9e9e';
    }
  }};
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
`;

const TenantActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled(Link)`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.secondary};
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
  }
`;

const CreateButton = styled(Link)`
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

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
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

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
 
  
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Obtener el token de autenticación
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No se encontró un token de autenticación');
        setLoading(false);
        return;
      }
      
      // Configurar headers
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Cargar estadísticas y tenants en paralelo
      const [statsResponse, tenantsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats`, config),
        axios.get(`${API_URL}/api/admin/tenants`, config)
      ]);
      
      setStats(statsResponse.data);
      setTenants(tenantsResponse.data);
      setError('');
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      
      if (err.response && err.response.status === 403) {
        setError('No tienes permiso para acceder al panel de administración.');
      } else {
        setError('Error al cargar datos. Por favor, intenta nuevamente.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_URL]);

   // Cargar estadísticas y tenants
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };
  
  // Verificar si el usuario es un superadmin
  if (!user || user.role !== 'superAdmin') {
    return (
      <Container>
        <ErrorMessage>No tienes permiso para acceder a esta página. Esta sección es exclusiva para superadministradores.</ErrorMessage>
      </Container>
    );
  }
  
  if (loading && !stats) {
    return (
      <Container>
        <LoadingMessage>Cargando panel de administración...</LoadingMessage>
      </Container>
    );
  }
  
  return (
    <Container>
      <Title>Panel de Super Administrador</Title>
      <Subtitle>Gestión de tenants y usuarios de la plataforma</Subtitle>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <CreateButton to="/admin/tenants/new">Crear Nuevo Tenant</CreateButton>
        <RefreshButton onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? 'Actualizando...' : 'Actualizar Datos'}
        </RefreshButton>
      </div>
      
      {stats && (
        <StatsGrid>
          <StatCard color="#4caf50">
            <StatTitle>Tenants Totales</StatTitle>
            <StatValue>{stats.totalTenants}</StatValue>
          </StatCard>
          <StatCard color="#2196f3">
            <StatTitle>Tenants Activos</StatTitle>
            <StatValue>{stats.tenantsByStatus.active}</StatValue>
          </StatCard>
          <StatCard color="#ff9800">
            <StatTitle>Tenants en Prueba</StatTitle>
            <StatValue>{stats.tenantsByStatus.trial}</StatValue>
          </StatCard>
          <StatCard color="#f44336">
            <StatTitle>Tenants Suspendidos</StatTitle>
            <StatValue>{stats.tenantsByStatus.suspended}</StatValue>
          </StatCard>
        </StatsGrid>
      )}
      
      <h2>Tenants Recientes</h2>
      
      <TenantGrid>
        {tenants.length > 0 ? (
          tenants.map(tenant => (
            <TenantCard key={tenant._id}>
              <TenantInfo>
                <TenantLogo color={tenant.customization?.primaryColor}>
                  {tenant.name.charAt(0)}
                </TenantLogo>
                <TenantDetails>
                  <TenantName>{tenant.name}</TenantName>
                  <TenantSubdomain>{tenant.subdomain}.tuapp.com</TenantSubdomain>
                </TenantDetails>
              </TenantInfo>
              
              <TenantStatus status={tenant.status}>
                {tenant.status === 'active' ? 'Activo' : 
                 tenant.status === 'trial' ? 'Prueba' : 
                 tenant.status === 'suspended' ? 'Suspendido' : 'Cancelado'}
              </TenantStatus>
              
              <TenantActions>
                <ActionButton to={`/admin/tenants/${tenant._id}`}>
                  Editar
                </ActionButton>
                <ActionButton to={`/admin/tenants/${tenant._id}/users`}>
                  Usuarios
                </ActionButton>
                <ActionButton to={`/admin/impersonate/${tenant._id}`}>
                  Impersonar
                </ActionButton>
              </TenantActions>
            </TenantCard>
          ))
        ) : (
          <div>No hay tenants para mostrar</div>
        )}
      </TenantGrid>
    </Container>
  );
};

export default SuperAdminDashboard;