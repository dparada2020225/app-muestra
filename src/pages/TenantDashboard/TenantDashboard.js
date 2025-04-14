// src/pages/TenantDashboard/TenantDashboard.js - versión actualizada
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import StatCard from '../../components/Dashboard/StatCard';
import DashboardChart from '../../components/Dashboard/DashboardChart';
import LowStockTable from '../../components/Dashboard/LowStockTable';
import QuickActions from '../../components/Dashboard/QuickActions';
import FinancialSummary from '../../components/Dashboard/FinancialSummary';
import dashboardService from '../../services/dashboardService';

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

const ChartContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
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

const RefreshButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.secondary};
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const TenantDashboard = () => {
  const [stats, setStats] = useState(null);
  const [salesChartData, setSalesChartData] = useState([]);
  const [purchasesChartData, setPurchasesChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  
  // Función para cargar todos los datos del dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar estadísticas básicas
      const statsData = await dashboardService.getStats();
      setStats(statsData);
      
      // Cargar datos para gráficos en paralelo
      setChartsLoading(true);
      const [salesData, purchasesData, categoryStats, lowStockData] = await Promise.all([
        dashboardService.getSalesChartData(),
        dashboardService.getPurchasesChartData(),
        dashboardService.getCategoryStats(),
        dashboardService.getLowStockProducts()
      ]);
      
      setSalesChartData(salesData);
      setPurchasesChartData(purchasesData);
      setCategoryData(categoryStats);
      setLowStockProducts(lowStockData);
      setChartsLoading(false);
      
      // Actualizar timestamp de la última actualización
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      setError('Error al cargar datos del dashboard. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Cargar datos cuando se monta el componente
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  // Función para manejar la actualización manual de datos
  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };
  
  // Formatear moneda
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'Q 0.00';
    
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Formatear fecha y hora
  const formatDateTime = (date) => {
    if (!date) return '';
    
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading && !stats) {
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
      
      <RefreshButton onClick={handleRefresh} disabled={refreshing}>
        {refreshing ? 'Actualizando...' : '🔄 Actualizar Datos'}
      </RefreshButton>
      
      {lastUpdate && (
        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '20px' }}>
          Última actualización: {formatDateTime(lastUpdate)}
        </p>
      )}
      
      {/* Tarjetas de estadísticas */}
      <DashboardGrid>
        <StatCard 
          title="Total de Productos"
          value={stats?.totalProducts || 0}
          color="#4caf50"
          icon="📦"
          linkTo="/products"
          linkText="Ver todos los productos"
          loading={loading}
        />
        
        <StatCard 
          title="Ventas Realizadas"
          value={stats?.totalSales || 0}
          color="#2196f3"
          icon="💰"
          trend={true}
          trendLabel="Últimos 30 días"
          linkTo="/admin/transactions"
          linkText="Ver historial de ventas"
          loading={loading}
        />
        
        <StatCard 
          title="Compras Realizadas"
          value={stats?.totalPurchases || 0}
          color="#ff9800"
          icon="🛒"
          trend={true}
          trendLabel="Últimos 30 días"
          linkTo="/admin/transactions"
          linkText="Ver historial de compras"
          loading={loading}
        />
        
        <StatCard 
          title="Productos con Stock Bajo"
          value={stats?.lowStockProducts || 0}
          color="#f44336"
          icon="⚠️"
          trend={false}
          trendLabel="Requieren atención"
          loading={loading}
        />
      </DashboardGrid>
      
      {/* Resumen Financiero */}
      <FinancialSummary 
        data={stats} 
        loading={loading}
        formatCurrency={formatCurrency}
      />
      
      {/* Gráficos */}
      <ChartContainer>
        <DashboardChart 
          title="Ventas de los Últimos 30 Días"
          data={salesChartData}
          type="line"
          loading={chartsLoading}
          lineColor="#2196f3"
        />
        
        <DashboardChart 
          title="Compras de los Últimos 30 Días"
          data={purchasesChartData}
          type="line"
          loading={chartsLoading}
          lineColor="#ff9800"
        />
      </ChartContainer>
      
      {/* Acciones Rápidas */}
      <QuickActions />
      
      {/* Gráficos adicionales */}
      <ChartContainer>
        <DashboardChart 
          title="Distribución por Categoría"
          data={categoryData}
          type="pie"
          pieDataNameKey="name"
          pieDataValueKey="value"
          loading={chartsLoading}
        />
        
        <DashboardChart 
          title="Comparativa Ventas vs Compras"
          data={[
            ...salesChartData.slice(-7).map(item => ({
              ...item,
              tipo: 'Ventas'
            })),
            ...purchasesChartData.slice(-7).map(item => ({
              ...item,
              tipo: 'Compras'
            }))
          ]}
          type="bar"
          loading={chartsLoading}
        />
      </ChartContainer>
      
      {/* Productos con stock bajo */}
      <LowStockTable 
        products={lowStockProducts} 
        loading={loading}
        formatCurrency={formatCurrency}
      />
    </Container>
  );
};

export default TenantDashboard;