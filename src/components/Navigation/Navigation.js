// src/components/Navigation/Navigation.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';

const Nav = styled.nav`
  display: flex;
  gap: 15px;
`;

const StyledNavLink = styled(NavLink)`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(59, 130, 246, 0.15);
    transform: translateY(-2px);
  }
  
  &.active {
    background-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.secondary};
  }
`;

// src/components/Navigation/Navigation.js - Actualización
const Navigation = () => {
  const { user, isAuthenticated } = useAuth();
  const { currentTenant, loading: tenantLoading } = useTenant();
  
  // Si está cargando o no hay autenticación, no mostrar navegación
  if (tenantLoading || !isAuthenticated) {
    return null;
  }

  // Determinar el rol del usuario
  const role = user?.role;
  const isSuperAdmin = role === 'superAdmin';
  const isTenantAdmin = role === 'tenantAdmin';
  const isTenantManager = role === 'tenantManager';
  
  return (
    <Nav>
      {/* Dashboard de Tenant Admin - Primer enlace para administradores de tenant */}
      {isTenantAdmin && (
        <StyledNavLink to="/tenant/dashboard">Dashboard</StyledNavLink>
      )}
      
      {/* Enlaces visibles para todos los usuarios autenticados */}
      {!isSuperAdmin  && (
        <StyledNavLink to="/products">Productos</StyledNavLink>
      )}

      {/* Enlaces para tenantManager y superiores */}
      {(isTenantManager || isTenantAdmin ) && (
        <>
          <StyledNavLink to="/admin/transactions">Compras/Ventas</StyledNavLink>
        </>
      )}
      
      {/* Enlaces para tenantAdmin y superAdmin */}
      {(isTenantAdmin) && (
        <>
          <StyledNavLink to="/admin/users">Usuarios</StyledNavLink>
        </>
      )}
      
      {/* Configuración solo visible para tenantAdmin */}
      {isTenantAdmin && (
        <StyledNavLink to="/tenant/settings">Configuración</StyledNavLink>
      )}
      
      {/* Panel de superAdmin solo visible para superAdmin */}
      {isSuperAdmin  && (
        <StyledNavLink to="/admin/tenant-dashboard">Panel SuperAdmin</StyledNavLink>
      )}
    </Nav>
  );
};

export default Navigation;