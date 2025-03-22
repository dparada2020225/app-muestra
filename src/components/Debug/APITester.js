// Añade este componente a src/components/Debug/APITester.js

import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 20px;
  max-width: 800px;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-weight: bold;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  
  &:hover {
    background-color: #45a049;
  }
`;

const ResponseContainer = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: auto;
  max-height: 400px;
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 10px;
  padding: 10px;
  background-color: #ffecec;
  border-left: 4px solid red;
  border-radius: 4px;
`;

const InfoRow = styled.div`
  margin-bottom: 10px;
  padding: 5px;
  background-color: #f0f0f0;
  border-radius: 4px;
`;

const APITester = () => {
  const [url, setUrl] = useState('https://inventario-server-production-fc8d.up.railway.app/api/auth/users');
  const [method, setMethod] = useState('GET');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResponse(null);
    
    try {
      const config = {
        headers: {}
      };
      
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      let bodyJson = {};
      if (body.trim()) {
        try {
          bodyJson = JSON.parse(body);
        } catch (err) {
          setError(`Error en el formato JSON: ${err.message}`);
          return;
        }
      }
      
      let result;
      
      if (method === 'GET') {
        result = await axios.get(url, config);
      } else if (method === 'POST') {
        result = await axios.post(url, bodyJson, config);
      } else if (method === 'PUT') {
        result = await axios.put(url, bodyJson, config);
      } else if (method === 'DELETE') {
        result = await axios.delete(url, config);
      }
      
      setResponse(result.data);
    } catch (err) {
      console.error('Error en la solicitud:', err);
      
      if (err.response) {
        setError(`Error ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        setError('No se recibió respuesta del servidor');
      } else {
        setError(`Error: ${err.message}`);
      }
    }
  };

  return (
    <Container>
      <Title>Herramienta de Depuración API</Title>
      
      <InfoRow>
        <strong>Estado de autenticación:</strong> {token ? 'Token presente' : 'Sin token'}
      </InfoRow>
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>URL:</Label>
          <Input 
            type="text" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
            placeholder="Ej: https://inventario-server-production-fc8d.up.railway.app/api/auth/users"
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Método:</Label>
          <select 
            value={method} 
            onChange={(e) => setMethod(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px' }}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </FormGroup>
        
        <FormGroup>
          <Label>Token:</Label>
          <Input 
            type="text" 
            value={token} 
            onChange={(e) => setToken(e.target.value)} 
            placeholder="Bearer ..."
          />
        </FormGroup>
        
        {(method === 'POST' || method === 'PUT') && (
          <FormGroup>
            <Label>Cuerpo (JSON):</Label>
            <textarea 
              value={body} 
              onChange={(e) => setBody(e.target.value)} 
              rows="4"
              style={{ padding: '8px', borderRadius: '4px' }}
              placeholder='{"key": "value"}'
            />
          </FormGroup>
        )}
        
        <Button type="submit">Enviar Solicitud</Button>
      </Form>
      
      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}
      
      {response && (
        <ResponseContainer>
          <h3>Respuesta:</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </ResponseContainer>
      )}
    </Container>
  );
};

export default APITester;