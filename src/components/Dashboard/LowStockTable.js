// src/components/Dashboard/LowStockTable.js
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: #f5f5f5;
`;

const TableHeader = styled.th`
  text-align: ${props => props.align || 'left'};
  padding: 10px;
  border-bottom: 1px solid #eee;
  color: ${props => props.theme.colors.text};
  font-weight: 600;
`;

const TableRow = styled.tr`
  &:hover {
    background-color: #f9f9f9;
  }
`;

const TableCell = styled.td`
  padding: 10px;
  border-bottom: 1px solid #eee;
  text-align: ${props => props.align || 'left'};
  color: ${props => props.color || props.theme.colors.text};
`;

const StockCell = styled(TableCell)`
  color: ${props => {
    if (props.stock <= 0) return '#f44336';
    if (props.stock <= 3) return '#ff9800';
    return props.theme.colors.text;
  }};
  font-weight: ${props => props.stock <= 3 ? 'bold' : 'normal'};
`;

const ActionButton = styled(Link)`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.8rem;
  display: inline-block;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
  }
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: ${props => props.theme.colors.textLight};
  font-style: italic;
`;


const LoadingCell = styled.td`
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  
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
 * Componente para mostrar una tabla de productos con bajo stock
 * 
 * @param {array} products - Lista de productos con bajo stock
 * @param {boolean} loading - Indica si está cargando
 * @param {function} formatCurrency - Función para formatear moneda
 * @param {number} threshold - Umbral para considerar bajo stock
 */
const LowStockTable = ({ 
  products = [], 
  loading = false, 
  formatCurrency = (value) => `Q ${parseFloat(value).toFixed(2)}`,
  threshold = 5
}) => {
  
  const renderTableBody = () => {
    if (loading) {
      return Array(5).fill(0).map((_, index) => (
        <TableRow key={`loading-${index}`}>
          <LoadingCell></LoadingCell>
          <LoadingCell></LoadingCell>
          <LoadingCell></LoadingCell>
          <LoadingCell></LoadingCell>
        </TableRow>
      ));
    }
    
    if (!products || products.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan="4">
            <NoDataMessage>
              No hay productos con stock bajo
            </NoDataMessage>
          </TableCell>
        </TableRow>
      );
    }
    
    return products.map(product => (
      <TableRow key={product._id}>
        <TableCell>{product.name}</TableCell>
        <TableCell>{product.category}</TableCell>
        <StockCell stock={product.stock} align="right">
          {product.stock}
        </StockCell>
        <TableCell align="right">
          {formatCurrency(product.salePrice)}
        </TableCell>
        <TableCell align="center">
          <ActionButton to={`/purchases/new?productId=${product._id}`}>
            Comprar
          </ActionButton>
        </TableCell>
      </TableRow>
    ));
  };
  
  return (
    <Container>
      <Title>Productos con Stock Bajo ({products.length})</Title>
      <Table>
        <TableHead>
          <tr>
            <TableHeader>Producto</TableHeader>
            <TableHeader>Categoría</TableHeader>
            <TableHeader align="right">Stock Actual</TableHeader>
            <TableHeader align="right">Precio</TableHeader>
            <TableHeader align="center">Acción</TableHeader>
          </tr>
        </TableHead>
        <tbody>
          {renderTableBody()}
        </tbody>
      </Table>
    </Container>
  );
};

export default LowStockTable;