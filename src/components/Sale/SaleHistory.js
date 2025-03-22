// src/components/Sale/SaleHistory.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTransactions } from '../../context/TransactionContext';
import Modal from '../Modal/Modal';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h2`
  color: ${props => props.theme.colors.text};
  margin-bottom: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.small};
`;

const Th = styled.th`
  text-align: left;
  padding: 16px;
  background-color: ${props => props.theme.colors.secondary};
  color: white;
`;

const Td = styled.td`
  padding: 16px;
  border-bottom: 1px solid #eee;
`;

const Tr = styled.tr`
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  &:last-child td {
    border-bottom: none;
  }
`;

const NoRecords = styled.div`
  text-align: center;
  padding: 30px;
  color: ${props => props.theme.colors.textLight};
  font-style: italic;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  box-shadow: ${props => props.theme.shadows.small};
`;

const InfoBadge = styled.span`
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.secondary};
`;

const DetailContainer = styled.div`
  padding: 10px 0;
`;

const DetailTitle = styled.h3`
  margin-bottom: 15px;
  color: ${props => props.theme.colors.text};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DetailTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  border: 1px solid #eee;
`;

const DetailTh = styled.th`
  text-align: left;
  padding: 12px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
`;

const DetailTd = styled.td`
  padding: 12px;
  border-bottom: 1px solid #eee;
`;

const DetailTr = styled.tr`
  &:last-child td {
    border-bottom: none;
  }
`;

const DetailSummary = styled.div`
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 6px;
  margin-top: 20px;
  text-align: right;
  font-weight: bold;
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  width: 100%;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: ${props => props.theme.colors.primary};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.danger};
  background-color: rgba(255, 0, 0, 0.1);
  border-left: 3px solid ${props => props.theme.colors.danger};
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 10px;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`;

const DateRangeFilter = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterInput = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const FilterButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.secondary};
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryHover};
  }
`;

const RefreshButton = styled(FilterButton)`
  background-color: ${props => props.theme.colors.secondary};
  color: white;
  
  &:hover {
    background-color: #333;
  }
`;

const SaleHistory = () => {
  const [selectedSale, setSelectedSale] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localDataFetched, setLocalDataFetched] = useState(false);
  
  const { 
    sales, 
    salesLoading, 
    salesError, 
    fetchSales
  } = useTransactions();
  
  // Cargar ventas solo cuando el componente se monta o cuando se solicita explícitamente,
  // evitando cargas automáticas en cada render
  useEffect(() => {
    if (!localDataFetched && !salesLoading) {
      fetchSales();
      setLocalDataFetched(true);
    }
  }, [fetchSales, localDataFetched, salesLoading]);
  
  // Función para filtrar ventas por rango de fechas
  const handleFilterByDate = () => {
    if (!startDate || !endDate) {
      // Si no hay fechas, mostrar mensaje y no hacer nada
      alert('Por favor, selecciona fechas de inicio y fin para filtrar');
      return;
    }
    
    // Llamar a fetchSales con las fechas como parámetros
    fetchSales(startDate, endDate);
  };
  
  // Función para formatear fechas
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };
  
  // Manejar click en una fila para mostrar detalles
  const handleRowClick = (sale) => {
    setSelectedSale(sale);
    setIsDetailModalOpen(true);
  };
  
  // Función para refrescar los datos
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Si hay fechas seleccionadas, mantenerlas en la recarga
    if (startDate && endDate) {
      await fetchSales(startDate, endDate);
    } else {
      await fetchSales();
    }
    setIsRefreshing(false);
  };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    fetchSales(); // Recargar sin filtros
  };
  
  if (salesLoading && !isRefreshing) {
    return (
      <LoadingWrapper>
        <LoadingSpinner />
      </LoadingWrapper>
    );
  }
  
  if (salesError) {
    return <ErrorMessage>{salesError}</ErrorMessage>;
  }
  
  return (
    <Container>
      <Title>Historial de Ventas</Title>
      
      <FilterContainer>
        <DateRangeFilter>
          <label htmlFor="startDateSale">Desde:</label>
          <FilterInput 
            type="date" 
            id="startDateSale"
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label htmlFor="endDateSale">Hasta:</label>
          <FilterInput 
            type="date" 
            id="endDateSale"
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
          />
          <FilterButton onClick={handleFilterByDate}>Filtrar</FilterButton>
          {(startDate || endDate) && (
            <FilterButton 
              onClick={handleClearFilters}
              style={{ backgroundColor: '#6c757d' }}
            >
              Limpiar filtros
            </FilterButton>
          )}
        </DateRangeFilter>
        <RefreshButton onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? 'Actualizando...' : 'Actualizar'}
        </RefreshButton>
      </FilterContainer>
      
      {sales.length === 0 ? (
        <NoRecords>No hay registros de ventas</NoRecords>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Fecha</Th>
              <Th>Cliente</Th>
              <Th>Productos</Th>
              <Th>Total</Th>
              <Th>Usuario</Th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <Tr key={sale._id} onClick={() => handleRowClick(sale)}>
                <Td>{formatDate(sale.date)}</Td>
                <Td>{sale.customer || 'Cliente general'}</Td>
                <Td>
                  <InfoBadge>{sale.items.length} productos</InfoBadge>
                </Td>
                <Td>Q {sale.totalAmount.toFixed(2)}</Td>
                <Td>{sale.user?.username || 'Sistema'}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
      
      {/* Modal para ver detalles de la venta */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detalle de Venta"
      >
        {selectedSale && (
          <DetailContainer>
            <DetailTitle>
              Venta #{selectedSale._id.substring(0, 8)}
              <small>{formatDate(selectedSale.date)}</small>
            </DetailTitle>
            
            <p><strong>Cliente:</strong> {selectedSale.customer || 'Cliente general'}</p>
            <p><strong>Registrado por:</strong> {selectedSale.user?.username || 'Sistema'}</p>
            
            <h4>Productos vendidos:</h4>
            <DetailTable>
              <thead>
                <tr>
                  <DetailTh>Producto</DetailTh>
                  <DetailTh>Cantidad</DetailTh>
                  <DetailTh>Precio Unitario</DetailTh>
                  <DetailTh>Total</DetailTh>
                </tr>
              </thead>
              <tbody>
                {selectedSale.items.map((item, index) => (
                  <DetailTr key={index}>
                    <DetailTd>{item.product?.name || 'Producto'}</DetailTd>
                    <DetailTd>{item.quantity}</DetailTd>
                    <DetailTd>Q {item.price.toFixed(2)}</DetailTd>
                    <DetailTd>Q {item.total.toFixed(2)}</DetailTd>
                  </DetailTr>
                ))}
              </tbody>
            </DetailTable>
            
            <DetailSummary>
              Total: Q {selectedSale.totalAmount.toFixed(2)}
            </DetailSummary>
          </DetailContainer>
        )}
      </Modal>
    </Container>
  );
};

export default SaleHistory;