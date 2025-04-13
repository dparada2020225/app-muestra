// src/pages/TenantDashboard/TenantDashboard.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import axios from 'axios';

const Container = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  margin-bottom: 20px;
`;

const Subtitle = styled.h2`
  color: ${props => props.theme.colors.textLight};
  font-size: 1.2rem;
  font-weight: normal;
  margin-bottom: 30px;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  padding: 20px;
  box-shadow: ${props => props.theme.shadows.small};
  display: flex;
  flex-direction: column;
  border-top: 3px solid ${props => props.color || props.theme.colors.primary};
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

const StatTitle = styled.h3`
  color: ${props => props.theme.colors.textLight};
  font-size: 0.9rem;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme.colors.text};
  margin-bottom: 5px;
`;

const StatTrend = styled.div`
  font-size: 0.9rem;
  color: ${props => props.positive ? '#4caf50' : '#f44336'};
  display: flex;
  align-items: center;
  
  &::before {
    content: '${props => props.positive ? '▲' : '▼'}';
    margin-right: 5px;
  }
`;

const ChartContainer = styled.div`
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  padding: 20px;
  box-shadow: ${props => props.theme.shadows.small};
  margin-bottom: 30px;
  height: 300px;
  position: relative;
`;

const ChartTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  margin-bottom: 15px;
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
`;

const ActionCard = styled(Link)`
  text-decoration: none;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  padding: 20px;
  box-shadow: ${props => props.theme.shadows.small};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 150px;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

const ActionIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 10px;
  color: ${props => props.theme.colors.primary};
`;

const ActionTitle = styled.div`
  font-weight: bold;
  color: ${props => props.theme.colors.text};
  margin-bottom: 5px;
`;

const ActionDescription = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textLight};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.danger};
  background-color: rgba(255, 0, 0, 0.1);
  border-left: 3px solid ${props => props.theme.colors.danger};
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
`;

// Componente para simular un gráfico (placeholder)
const ChartPlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 250px;
  background-color: #f5f5f5;
  border-radius: 6px;
  color: #888;
  font-style: italic;
`;

const TenantDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalPurchases: 0,
    lowStockProducts: 0,
    recentSalesAmount: 0,
    recentPurchasesAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // En un caso real, obtendríamos los datos del dashboard de la API
        // Por ahora, simularemos los datos para la demostración
        
        // Simulando una solicitud a la API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Datos simulados para el dashboard
        setStats({
          totalProducts: 45,
          totalSales: 124,
          totalPurchases: 56,
          lowStockProducts: 8,
          recentSalesAmount: 12500,
          recentPurchasesAmount: 8900
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('No se pudieron cargar los datos del dashboard');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [API_URL]);
  
  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <div>Cargando datos del dashboard...</div>
        </LoadingContainer>
      </Container>
    );
  }
  
  return (
    <Container>
      <Title>Dashboard de Administración</Title>
      <Subtitle>
        Bienvenido, {user?.username}. Aquí tienes un resumen de {currentTenant?.name}.
      </Subtitle>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {/* Tarjetas de estadísticas */}
      <DashboardGrid>
        <StatCard color="#4caf50">
          <StatTitle>Total de Productos</StatTitle>
          <StatValue>{stats.totalProducts}</StatValue>
          <StatTrend positive={true}>5% desde el mes pasado</StatTrend>
        </StatCard>
        
        <StatCard color="#2196f3">
          <StatTitle>Ventas Realizadas</StatTitle>
          <StatValue>{stats.totalSales}</StatValue>
          <StatTrend positive={true}>12% desde el mes pasado</StatTrend>
        </StatCard>
        
        <StatCard color="#ff9800">
          <StatTitle>Compras Realizadas</StatTitle>
          <StatValue>{stats.totalPurchases}</StatValue>
          <StatTrend positive={true}>3% desde el mes pasado</StatTrend>
        </StatCard>
        
        <StatCard color="#f44336">
          <StatTitle>Productos con Stock Bajo</StatTitle>
          <StatValue>{stats.lowStockProducts}</StatValue>
          <StatTrend positive={false}>2 más que el mes pasado</StatTrend>
        </StatCard>
      </DashboardGrid>
      
      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <ChartContainer>
          <ChartTitle>Ventas de los Últimos 30 Días</ChartTitle>
          <ChartPlaceholder>
            Gráfico de Ventas (Demo)
          </ChartPlaceholder>
        </ChartContainer>
        
        <ChartContainer>
          <ChartTitle>Compras de los Últimos 30 Días</ChartTitle>
          <ChartPlaceholder>
            Gráfico de Compras (Demo)
          </ChartPlaceholder>
        </ChartContainer>
      </div>
      
      {/* Acciones Rápidas */}
      <h2 style={{ marginBottom: '20px' }}>Acciones Rápidas</h2>
      <QuickActionsGrid>
        <ActionCard to="/admin/users/new">
          <ActionIcon>👤</ActionIcon>
          <ActionTitle>Nuevo Usuario</ActionTitle>
          <ActionDescription>Agregar un nuevo usuario al sistema</ActionDescription>
        </ActionCard>
        
        <ActionCard to="/products">
          <ActionIcon>📦</ActionIcon>
          <ActionTitle>Productos</ActionTitle>
          <ActionDescription>Gestionar inventario de productos</ActionDescription>
        </ActionCard>
        
        <ActionCard to="/admin/transactions">
          <ActionIcon>💰</ActionIcon>
          <ActionTitle>Ventas</ActionTitle>
          <ActionDescription>Registrar ventas y ver historial</ActionDescription>
        </ActionCard>
        
        <ActionCard to="/admin/transactions">
          <ActionIcon>🛒</ActionIcon>
          <ActionTitle>Compras</ActionTitle>
          <ActionDescription>Registrar compras de productos</ActionDescription>
        </ActionCard>
        
        <ActionCard to="/tenant/settings">
          <ActionIcon>⚙️</ActionIcon>
          <ActionTitle>Configuración</ActionTitle>
          <ActionDescription>Ajustes del sistema</ActionDescription>
        </ActionCard>
      </QuickActionsGrid>
      
      {/* Productos con stock bajo */}
      <ChartContainer>
        <ChartTitle>Productos con Stock Bajo</ChartTitle>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #eee' }}>Producto</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #eee' }}>Categoría</th>
              <th style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #eee' }}>Stock Actual</th>
              <th style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #eee' }}>Precio</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>Producto A</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>Categoría 1</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #eee', textAlign: 'right', color: '#f44336' }}>2</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #eee', textAlign: 'right' }}>Q 150.00</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>Producto B</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>Categoría 2</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #eee', textAlign: 'right', color: '#f44336' }}>3</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #eee', textAlign: 'right' }}>Q 85.50</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>Producto C</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>Categoría 1</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #eee', textAlign: 'right', color: '#f44336' }}>1</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #eee', textAlign: 'right' }}>Q 210.00</td>
            </tr>
          </tbody>
        </table>
      </ChartContainer>
    </Container>
  );
};

export default TenantDashboard;