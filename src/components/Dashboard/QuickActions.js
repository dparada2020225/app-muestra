// src/components/Dashboard/QuickActions.js
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Container = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h2`
  color: ${props => props.theme.colors.text};
  margin-bottom: 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
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
    background-color: ${props => props.hoverBackground || 'rgba(59, 130, 246, 0.05)'};
  }
`;

const Icon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 10px;
  color: ${props => props.color || props.theme.colors.primary};
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

/**
 * Componente para mostrar acciones rápidas en el dashboard
 * 
 * @param {array} actions - Lista de acciones rápidas a mostrar
 */
const QuickActions = ({ actions = [] }) => {
  // Acciones predeterminadas si no se proporcionan
  const defaultActions = [
    {
      title: 'Nuevo Usuario',
      description: 'Agregar un nuevo usuario al sistema',
      icon: '👤',
      to: '/admin/users/new',
      color: '#2196f3'
    },
    {
      title: 'Productos',
      description: 'Gestionar inventario de productos',
      icon: '📦',
      to: '/products',
      color: '#4caf50'
    },
    {
      title: 'Ventas y Compras',
      description: 'Registrar ventas/compras y ver historial',
      icon: '💰/🛒',
      to: '/admin/transactions',
      color: '#ff9800'
    },
    {
      title: 'Configuración',
      description: 'Ajustes del sistema',
      icon: '⚙️',
      to: '/tenant/settings',
      color: '#9c27b0'
    }
  ];
  
  // Usar acciones proporcionadas o las predeterminadas
  const actionsToRender = actions.length > 0 ? actions : defaultActions;
  
  return (
    <Container>
      <Title>Acciones Rápidas</Title>
      <Grid>
        {actionsToRender.map((action, index) => (
          <ActionCard 
            key={index} 
            to={action.to}
            hoverBackground={action.hoverBackground}
          >
            <Icon color={action.color}>{action.icon}</Icon>
            <ActionTitle>{action.title}</ActionTitle>
            <ActionDescription>{action.description}</ActionDescription>
          </ActionCard>
        ))}
      </Grid>
    </Container>
  );
};

export default QuickActions;