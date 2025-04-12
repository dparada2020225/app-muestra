// src/components/Header/Header.js - actualizado
import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import Navigation from '../Navigation/Navigation';

const HeaderContainer = styled.header`
  background-color: ${props => props.theme.colors.secondary};
  color: white;
  padding: 8px 0;
  box-shadow: ${props => props.theme.shadows.small};
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LogoImage = styled.img`
  height: 45px;
  width: auto;
  display: block;
  margin-right: 12px;
`;

const Logo = styled(Link)`
  text-decoration: none;
  display: flex;
  align-items: center;
  padding: 5px 0;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

const TenantName = styled.span`
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  margin-left: 5px;
`;

const UserMenu = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Username = styled.span`
  color: ${props => props.theme.colors.primary};
  font-weight: bold;
  margin-right: 10px;
`;

const Dropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  background-color: transparent;
  color: ${props => props.theme.colors.primary};
  padding: 4px 10px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: rgba(59, 130, 246, 0.15);
    transform: translateY(-2px);
  }
  
  &:after {
    content: '▼';
    font-size: 8px;
    margin-left: 8px;
  }
`;

const DropdownContent = styled.div`
  display: ${props => (props.$isOpen ? 'block' : 'none')};
  position: absolute;
  right: 0;
  background-color: #f9f9f9;
  min-width: 180px;
  box-shadow: ${props => props.theme.shadows.medium};
  z-index: 10;
  border-radius: 4px;
  margin-top: 5px;
`;

const DropdownItem = styled.a`
  color: #333;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  font-weight: normal;
  cursor: pointer;
  
  &:hover {
    background-color: #f1f1f1;
  }
`;

const Badge = styled.span`
  display: inline-block;
  background-color: ${props => props.color || '#9c27b0'};
  color: white;
  font-size: 10px;
  padding: 3px 6px;
  border-radius: 10px;
  margin-left: 8px;
  text-transform: uppercase;
`;

const TenantBadge = styled(Badge)`
  background-color: var(--primary-color);
  padding: 3px 8px;
  font-size: 9px;
  margin-left: 12px;
`;

const LoginButton = styled(Link)`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  background-color: white;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
`;

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const { user, isAuthenticated, logout } = useAuth();
  const { currentTenant, loading: tenantLoading } = useTenant();
  const navigate = useNavigate();
  
  // Cerrar el dropdown al hacer clic fuera de él
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogout = () => {
    setDropdownOpen(false); // Cerrar el menú desplegable
    logout();
    navigate('/login');
  };
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Determinar rol para las badges
  const isSuperAdmin = user?.role === 'superAdmin';
  const isTenantAdmin = user?.role === 'tenantAdmin';
  const isTenantManager = user?.role === 'tenantManager';
  
  // Determinar si el usuario es un superadmin impersonando a un usuario del tenant
  const isImpersonating = user && user.impersonatedBy;
  
  return (
    <HeaderContainer>
      <Content>
        <Logo to={isAuthenticated ? "/dashboard" : "/"}>
          <LogoContainer>
            {currentTenant && currentTenant.logo ? (
              <LogoImage 
                src={currentTenant.logo} 
                alt={`${currentTenant.name} Logo`} 
              />
            ) : (
              <LogoImage 
                src="/logoMuestraInvertida.png" 
                alt="Inventory System" 
              />
            )}
            {currentTenant && (
              <TenantName>{currentTenant.name}</TenantName>
            )}
          </LogoContainer>
        </Logo>

        {isAuthenticated ? (
          <>
            <Navigation />
            
            <UserMenu>
              <Dropdown ref={dropdownRef}>
                <DropdownButton onClick={toggleDropdown}>
                  {user.username}
                  {isSuperAdmin && <Badge color="#9c27b0">SuperAdmin</Badge>}
                  {isTenantAdmin && <Badge color="#2196f3">Admin</Badge>}
                  {isTenantManager && <Badge color="#4caf50">Manager</Badge>}
                  {isImpersonating && <Badge color="#ff5722">Impersonando</Badge>}
                  {currentTenant && <TenantBadge>{currentTenant.name}</TenantBadge>}
                </DropdownButton>
                <DropdownContent $isOpen={dropdownOpen}>
                  <DropdownItem onClick={() => {
                    setDropdownOpen(false);
                    navigate('/profile');
                  }}>
                    Mi Perfil
                  </DropdownItem>
                  
                  {/* Opciones específicas para superadmin */}
                  {isSuperAdmin && currentTenant && (
                    <DropdownItem onClick={() => {
                      setDropdownOpen(false);
                      navigate('/admin/tenant-dashboard');
                    }}>
                      Panel Super Admin
                    </DropdownItem>
                  )}
                  
                  {/* Mostrar opción para finalizar impersonación si es necesario */}
                  {isImpersonating && (
                    <DropdownItem onClick={() => {
                      setDropdownOpen(false);
                      // Aquí llamarías a una función para terminar la impersonación
                      // Por ejemplo: endImpersonation();
                      navigate('/admin/dashboard');
                    }}>
                      Terminar Impersonación
                    </DropdownItem>
                  )}
                  
                  <DropdownItem onClick={handleLogout}>
                    Cerrar Sesión
                  </DropdownItem>
                </DropdownContent>
              </Dropdown>
            </UserMenu>
          </>
        ) : (
          tenantLoading ? (
            <span style={{ color: 'white' }}>Cargando...</span>
          ) : (
            <LoginButton to="/login">Iniciar Sesión</LoginButton>
          )
        )}
      </Content>
    </HeaderContainer>
  );
};

export default Header;