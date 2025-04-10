// src/pages/NotFound/NotFound.js
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  padding: 0 20px;
`;

const Title = styled.h1`
  font-size: 80px;
  margin-bottom: 0;
  color: #e91e63;
`;

const Subtitle = styled.h2`
  margin-top: 0;
  margin-bottom: 30px;
  color: #333;
`;

const Message = styled.p`
  font-size: 18px;
  color: #666;
  max-width: 500px;
  margin-bottom: 30px;
`;

const HomeLink = styled(Link)`
  display: inline-block;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #45a049;
  }
`;

const NotFound = () => {
  return (
    <Container>
      <Title>404</Title>
      <Subtitle>Página no encontrada</Subtitle>
      <Message>
        Lo sentimos, la página que estás buscando no existe o ha sido movida.
      </Message>
      <HomeLink to="/">Volver al Inicio</HomeLink>
    </Container>
  );
};

export default NotFound;