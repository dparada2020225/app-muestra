// src/components/Dashboard/FinancialSummary.js
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  padding: 20px;
  box-shadow: ${props => props.theme.shadows.small};
  margin-bottom: 30px;
`;

const Title = styled.h3`
  color: ${props => props.theme.colors.text};
  margin-bottom: 15px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  background-color: ${props => props.backgroundColor || '#f8f9fa'};
  border-left: 3px solid ${props => props.borderColor || props.theme.colors.primary};
`;

const ItemLabel = styled.div`
  font-size: 0.9rem;
  margin-bottom: 10px;
  color: ${props => props.theme.colors.textLight};
`;

const ItemValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.color || props.theme.colors.text};
`;


const LoadingPlaceholder = styled.div`
  height: 24px;
  width: 100px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  
  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

/**
 * Componente para mostrar un resumen financiero en el dashboard
 * 
 * @param {object} data - Datos del resumen financiero
 * @param {boolean} loading - Indica si está cargando
 * @param {function} formatCurrency - Función para formatear moneda
 */
const FinancialSummary = ({ 
  data = {}, 
  loading = false, 
  formatCurrency = (value) => `Q${parseFloat(value).toFixed(2)}` 
}) => {
  // Calcular la ganancia/pérdida
  const calculateProfit = () => {
    if (!data.recentSalesAmount || !data.recentPurchasesAmount) return 0;
    return data.recentSalesAmount - data.recentPurchasesAmount;
  };
  
  // Determinar si hay ganancia
  const profit = calculateProfit();
  const isProfit = profit >= 0;
  
  return (
    <Container>
      <Title>Resumen Financiero (Últimos 30 días)</Title>
      
      <SummaryGrid>
        <SummaryItem 
          borderColor="#2196f3"
          backgroundColor="rgba(33, 150, 243, 0.1)"
        >
          <ItemLabel>Ingresos por Ventas</ItemLabel>
          {loading ? (
            <LoadingPlaceholder />
          ) : (
            <ItemValue color="#2196f3">
              {formatCurrency(data.recentSalesAmount || 0)}
            </ItemValue>
          )}
        </SummaryItem>
        
        <SummaryItem
          borderColor="#ff9800"
          backgroundColor="rgba(255, 152, 0, 0.1)"
        >
          <ItemLabel>Gastos en Compras</ItemLabel>
          {loading ? (
            <LoadingPlaceholder />
          ) : (
            <ItemValue color="#ff9800">
              {formatCurrency(data.recentPurchasesAmount || 0)}
            </ItemValue>
          )}
        </SummaryItem>
        
        <SummaryItem
          borderColor={isProfit ? "#4caf50" : "#f44336"}
          backgroundColor={isProfit ? "rgba(76, 175, 80, 0.1)" : "rgba(244, 67, 54, 0.1)"}
        >
          <ItemLabel>Ganancia/Pérdida</ItemLabel>
          {loading ? (
            <LoadingPlaceholder />
          ) : (
            <ItemValue color={isProfit ? "#4caf50" : "#f44336"}>
              {formatCurrency(profit)}
            </ItemValue>
          )}
        </SummaryItem>
        
        <SummaryItem
          borderColor="#9c27b0"
          backgroundColor="rgba(156, 39, 176, 0.1)"
        >
          <ItemLabel>Margen</ItemLabel>
          {loading ? (
            <LoadingPlaceholder />
          ) : (
            <ItemValue color="#9c27b0">
              {data.recentSalesAmount 
                ? `${((profit / data.recentSalesAmount) * 100).toFixed(1)}%` 
                : '0%'}
            </ItemValue>
          )}
        </SummaryItem>
      </SummaryGrid>
    </Container>
  );
};

export default FinancialSummary;