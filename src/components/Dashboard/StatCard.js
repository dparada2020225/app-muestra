// src/components/Dashboard/StatCard.js
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Card = styled.div`
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

const Title = styled.h3`
  color: ${props => props.theme.colors.textLight};
  font-size: 0.9rem;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Value = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme.colors.text};
  margin-bottom: 5px;
`;

const Trend = styled.div`
  font-size: 0.9rem;
  color: ${props => props.positive ? '#4caf50' : '#f44336'};
  display: flex;
  align-items: center;
  
  &::before {
    content: '${props => props.positive ? '▲' : '▼'}';
    margin-right: 5px;
  }
`;

const Icon = styled.div`
  font-size: 2rem;
  margin-bottom: 10px;
  color: ${props => props.color || props.theme.colors.primary};
`;

const LinkContainer = styled.div`
  margin-top: auto;
  padding-top: 15px;
`;

const ActionLink = styled(Link)`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  
  &:hover {
    text-decoration: underline;
  }
  
  &::after {
    content: '→';
    margin-left: 5px;
  }
`;

const LoadingValue = styled.div`
  height: 2rem;
  width: 100px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 5px;
  
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
 * Componente para mostrar una tarjeta de estadística en el dashboard
 * 
 * @param {string} title - Título de la estadística
 * @param {string|number} value - Valor de la estadística
 * @param {boolean} trend - Tendencia (true = positiva, false = negativa)
 * @param {string} trendLabel - Etiqueta para la tendencia
 * @param {string} color - Color de la tarjeta
 * @param {string} icon - Ícono a mostrar (emoji o ícono)
 * @param {string} linkTo - URL para el enlace de acción
 * @param {string} linkText - Texto para el enlace de acción
 * @param {boolean} loading - Indica si está cargando
 */
const StatCard = ({ 
  title, 
  value, 
  trend, 
  trendLabel, 
  color, 
  icon,
  linkTo,
  linkText,
  loading = false,
  formatValue
}) => {
  // Función para formatear el valor si se proporciona
  const displayValue = formatValue ? formatValue(value) : value;
  
  return (
    <Card color={color}>
      {icon && <Icon color={color}>{icon}</Icon>}
      <Title>{title}</Title>
      
      {loading ? (
        <LoadingValue />
      ) : (
        <Value>{displayValue}</Value>
      )}
      
      {trendLabel && !loading && (
        <Trend positive={trend}>
          {trendLabel}
        </Trend>
      )}
      
      {linkTo && linkText && (
        <LinkContainer>
          <ActionLink to={linkTo}>
            {linkText}
          </ActionLink>
        </LinkContainer>
      )}
    </Card>
  );
};

export default StatCard;