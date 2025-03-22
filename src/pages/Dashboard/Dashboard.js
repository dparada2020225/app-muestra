// src/pages/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { ProductProvider, useProducts } from '../../context/ProductContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import Modal from '../../components/Modal/Modal';
import ProductForm from '../../components/ProductForm/ProductForm';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import productService from '../../services/api';
import ColorSelector from '../../components/ColorSelector/ColorSelector';

// Animaciones
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Componentes estilizados
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const DashboardHeader = styled.header`
  margin-bottom: 30px;
  text-align: center;
`;

const textShine = keyframes`
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background-color: ${props => props.theme.colors.primary};
    border-radius: 2px;
  }
  
  background: linear-gradient(
    to right,
    ${props => props.theme.colors.text} 20%,
    ${props => props.theme.colors.primary} 40%,
    ${props => props.theme.colors.text} 60%
  );
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${textShine} 4s linear infinite;
`;

const SubTitle = styled.h2`
  color: ${props => props.theme.colors.textLight};
  font-size: 1.2rem;
  font-weight: normal;
  margin-top: 10px;
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const AdminMessage = styled.div`
  background-color: #f8f8f8;
  border-left: 3px solid ${props => props.theme.colors.primary};
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  
  a {
    color: ${props => props.theme.colors.primary};
    font-weight: bold;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const StyledButton = styled.button`
  background-color: ${props => 
    props.primary ? props.theme.colors.primary : 
    props.danger ? props.theme.colors.danger : 
    props.theme.colors.secondary};
  color: ${props => props.primary ? props.theme.colors.secondary : 'white'};
  border: none;
  padding: 10px 16px;
  cursor: pointer;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.theme.shadows.small};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.medium};
    background-color: ${props => 
      props.primary ? props.theme.colors.primaryHover : 
      props.danger ? props.theme.colors.dangerHover : 
      props.theme.colors.secondaryHover};
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: ${props => props.theme.shadows.small};
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatsContainer = styled.div`
  text-align: right;
  margin-bottom: 10px;
  color: ${props => props.theme.colors.textLight};
  font-size: 0.9em;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  
  & > * {
    animation: ${fadeIn} 0.4s ease forwards;
    opacity: 0;
  }
  
  & > *:nth-child(1) { animation-delay: 0.1s; }
  & > *:nth-child(2) { animation-delay: 0.2s; }
  & > *:nth-child(3) { animation-delay: 0.3s; }
  & > *:nth-child(4) { animation-delay: 0.4s; }
  & > *:nth-child(5) { animation-delay: 0.5s; }
  & > *:nth-child(6) { animation-delay: 0.6s; }
`;

const NoResults = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: ${props => props.theme.colors.textLight};
  font-style: italic;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  box-shadow: ${props => props.theme.shadows.small};
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: ${props => props.theme.colors.textLight};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: white;
  background-color: ${props => props.theme.colors.danger};
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const SearchContainer = styled.div`
  background-color: ${props => props.theme.colors.cardBackground};
  padding: 20px;
  border-radius: 8px;
  box-shadow: ${props => props.theme.shadows.small};
  margin-bottom: 20px;
`;

const FilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
`;

const FilterItem = styled.div`
  flex: 1;
  min-width: 200px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 2px rgba(150, 255, 0, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 2px rgba(150, 255, 0, 0.2);
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  margin-top: 20px;
  
  input {
    margin-right: 10px;
  }
  
  label {
    color: ${props => props.theme.colors.text};
    font-weight: 600;
  }
`;

// Dashboard interno (para usar el contexto de productos)
const DashboardContent = () => {
  const {
    filteredProducts,
    products,
    filters,
    setFilters,
    categories,
    colors,
    loading,
    error,
    deleteProduct,
    refreshProducts
  } = useProducts();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  
  // Usar el contexto de autenticación
  const { isAdmin } = useAuth();
  
  // Crear estado local para los filtros
  const [localFilters, setLocalFilters] = useState({
    ...filters,
    withoutStock: false  // Añadir esta propiedad
  });
  
  // Manejar cambios en los inputs sin aplicar los filtros inmediatamente
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Si está activando un filtro de stock, desactivar el otro
    if (name === 'inStock' && checked) {
      setLocalFilters(prev => ({
        ...prev,
        inStock: checked,
        withoutStock: false
      }));
    } else if (name === 'withoutStock' && checked) {
      setLocalFilters(prev => ({
        ...prev,
        withoutStock: checked,
        inStock: false
      }));
    } else {
      setLocalFilters(prev => ({
        ...prev, 
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };
  
  // Aplicar los filtros cuando se hace clic en el botón Buscar
  const handleSearch = () => {
    setFilters(localFilters);
  };
  
  // Reiniciar filtros
  const handleReset = () => {
    const emptyFilters = {
      searchTerm: '',
      category: '',
      color: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      withoutStock: false
    };
    setLocalFilters(emptyFilters);
    setFilters(emptyFilters);
  };
  
  const handleDeleteClick = (productId) => {
    setProductToDelete(productId);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteProduct(productToDelete);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err) {
      console.error("Error al eliminar producto:", err);
    }
  };
  

  const handleCreateProduct = () => {
    setProductToEdit(null);
    setIsCreateModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setProductToEdit(product);
    setIsCreateModalOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    try {
      console.log('Datos del producto a guardar:', productData);
      
      if (productData._id) {
        // Actualizar producto existente
        console.log('Actualizando producto existente con ID:', productData._id);
        const updatedProduct = await productService.updateProduct(productData._id, productData);
        console.log('Producto actualizado correctamente:', updatedProduct);
      } else {
        // Crear nuevo producto - asegurarse de que no enviamos _id vacío
        console.log('Creando nuevo producto');
        // Clonar el objeto para evitar referencias
        const newProductData = { ...productData };
        // Eliminar explícitamente el _id si existe y está vacío
        delete newProductData._id;
        const newProduct = await productService.createProduct(newProductData);
        console.log('Nuevo producto creado:', newProduct);
      }
      
      setIsCreateModalOpen(false);
      refreshProducts(); // Recargar la lista de productos
      return true;
    } catch (error) {
      console.error("Error al guardar producto:", error);
      console.log("Detalles del error:", error.response?.data);
      // No cerramos el modal para que el usuario pueda ver el error y corregirlo
      return false;
    }
  };
  
  // Renderizar el componente
  return (
    <Container>
      <DashboardHeader>
        <Title>Sistema de Inventario</Title>
        {isAdmin && (
          <SubTitle>Administra tus productos, compras y ventas</SubTitle>
        )}
      </DashboardHeader>
      
      
      {isAdmin && (
        <ActionsContainer>
          <StyledButton primary onClick={handleCreateProduct}>
            Crear Nuevo Producto
          </StyledButton>
        </ActionsContainer>
      )}
      
      <SearchContainer>
        <FilterSection>
          <FilterItem>
            <Label htmlFor="searchTerm">Buscar por nombre:</Label>
            <Input
              type="text"
              id="searchTerm"
              name="searchTerm"
              value={localFilters.searchTerm || ''}
              onChange={handleInputChange}
              placeholder="Escribe para buscar..."
            />
          </FilterItem>
          
          <FilterItem>
            <Label htmlFor="category">Categoría:</Label>
            <Select
              id="category"
              name="category"
              value={localFilters.category || ''}
              onChange={handleInputChange}
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>
          </FilterItem>
          
          <FilterItem>
            <Label htmlFor="color">Color:</Label>
            <ColorSelector
              value={localFilters.color || ''}
              onChange={(value) => setLocalFilters({...localFilters, color: value})}
              availableColors={colors}
              placeholder="Todos los colores"
              useOnlyAvailableColors={true}
            />
          </FilterItem>
        </FilterSection>
        
        <FilterSection>
          <FilterItem>
            <Label htmlFor="minPrice">Precio mínimo:</Label>
            <Input
              type="number"
              id="minPrice"
              name="minPrice"
              value={localFilters.minPrice || ''}
              onChange={handleInputChange}
              placeholder="Mínimo"
            />
          </FilterItem>
          
          <FilterItem>
            <Label htmlFor="maxPrice">Precio máximo:</Label>
            <Input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={localFilters.maxPrice || ''}
              onChange={handleInputChange}
              placeholder="Máximo"
            />
          </FilterItem>
        </FilterSection>
        
        <FilterSection>
    <FilterItem>
      <Label>Filtrar por stock:</Label>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
        <Checkbox>
          <input
            type="checkbox"
            id="inStock"
            name="inStock"
            checked={localFilters.inStock || false}
            onChange={handleInputChange}
          />
          <label htmlFor="inStock">Mostrar solo productos con stock</label>
        </Checkbox>
        <Checkbox>
          <input
            type="checkbox"
            id="withoutStock"
            name="withoutStock"
            checked={localFilters.withoutStock || false}
            onChange={handleInputChange}
          />
          <label htmlFor="withoutStock">Mostrar solo productos sin stock</label>
        </Checkbox>
      </div>
    </FilterItem>
  </FilterSection>
        
        <div style={{ marginTop: '20px' }}>
          <StyledButton primary onClick={handleSearch}>Buscar</StyledButton>
          <StyledButton onClick={handleReset} style={{marginLeft: '10px', backgroundColor: '#f44336'}}>
            Reiniciar filtros
          </StyledButton>
        </div>
      </SearchContainer>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {loading ? (
        <LoadingIndicator>Cargando productos...</LoadingIndicator>
      ) : (
        <>
          <StatsContainer>
            Mostrando <strong>{filteredProducts.length}</strong> de <strong>{products.length}</strong> productos
          </StatsContainer>
          
          <ProductGrid>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  onDelete={isAdmin ? handleDeleteClick : null}
                  onEdit={isAdmin ? handleEditProduct : null}
                  isAdmin={isAdmin}
                />
              ))
            ) : (
              <NoResults>
                No se encontraron productos que coincidan con los criterios de búsqueda
              </NoResults>
            )}
          </ProductGrid>
        </>
      )}
      
      {isAdmin && (
        <>
          <ConfirmDialog 
            isOpen={isDeleteModalOpen}
            title="Confirmar Eliminación"
            message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
            onConfirm={confirmDelete}
            onCancel={() => setIsDeleteModalOpen(false)}
          />
          
          <Modal
            isOpen={isCreateModalOpen}
            title={productToEdit ? "Editar Producto" : "Crear Nuevo Producto"}
            onClose={() => setIsCreateModalOpen(false)}
          >
            <ProductForm 
              product={productToEdit}
              onSave={handleSaveProduct}
              onCancel={() => setIsCreateModalOpen(false)}
              availableColors={colors} // Pasamos los colores disponibles
            />
          </Modal>
        </>
      )}
    </Container>
  );
};

// Componente Dashboard que envuelve el contenido con el contexto de productos
const Dashboard = () => {
  return (
    <ProductProvider>
      <DashboardContent />
    </ProductProvider>
  );
};

export default Dashboard;