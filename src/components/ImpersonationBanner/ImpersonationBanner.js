// src/components/ImpersonationBanner/ImpersonationBanner.js
import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

const Banner = styled.div`
  background-color: #ff5722;
  color: white;
  padding: 8px 10px;
  text-align: center;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const EndButton = styled.button`
  background-color: white;
  color: #ff5722;
  border: none;
  font-weight: bold;
  padding: 4px 8px;
  font-size: 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 15px;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const ImpersonationBanner = () => {
  const { user } = useAuth();
  
  // Verificar si estamos en modo impersonación
  // Lo podemos determinar si el token actual tiene el campo 'impersonatedBy'
  const isImpersonating = user && user.impersonatedBy;
  
  if (!isImpersonating) {
    return null;
  }
  
  const endImpersonation = () => {
    // Restaurar el token original
    const originalToken = localStorage.getItem('originalToken');
    if (originalToken) {
      localStorage.setItem('token', originalToken);
      localStorage.removeItem('originalToken');
      window.location.reload(); // Refrescar para aplicar el cambio
    } else {
      // Si no hay token original, simplemente eliminar el token de impersonación
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };
  
  return (
    <Banner>
      <div>
        Estás impersonando a {user.username}
        <EndButton onClick={endImpersonation}>
          Terminar Impersonación
        </EndButton>
      </div>
    </Banner>
  );
};

export default ImpersonationBanner;