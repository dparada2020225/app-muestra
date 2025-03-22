// src/components/Purchase/CreatePurchaseForm.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTransactions } from '../../context/TransactionContext';
import productService from '../../services/api';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(150, 255, 0, 0.2);
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Button = styled.button`
  background-color: ${props => props.danger 
    ? props.theme.colors.danger 
    : props.theme.colors.primary};
  color: ${props => props.danger ? 'white' : props.theme.colors.secondary};
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    background-color: ${props => props.danger 
      ? props.theme.colors.dangerHover 
      : props.theme.colors.primaryHover};
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const ItemsContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
`;

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr auto;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #eee;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemHeader = styled(ItemRow)`
  font-weight: bold;
  background-color: #f9f9f9;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const RemoveButton = styled.button`
  background-color: #f44336;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
  
  &:hover {
    background-color: #d32f2f;
    transform: scale(1.1);
  }
`;

const AddButton = styled(Button)`
  margin-bottom: 20px;
`;

const Summary = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 6px;
  text-align: right;
`;

const TotalAmount = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${props => props.theme.colors.text};
  
  span {
    color: ${props => props.theme.colors.primary};
  }
`;

const SearchBox = styled.div`
  margin-bottom: 10px;
`;

const SearchInput = styled(Input)`
  width: 100%;
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.danger};
  background-color: rgba(255, 0, 0, 0.1);
  border-left: 3px solid ${props => props.theme.colors.danger};
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 10px;
`;

const LoadingSpinner = styled.div`
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-left-color: ${props => props.theme.colors.primary};
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const CreatePurchaseForm = ({ onSuccess, onCancel }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [productsLoading, setProductsLoading] = useState(false);
  
  const { createPurchase } = useTransactions();
  
  // Cargar productos al iniciar
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const data = await productService.getAllProducts();
        setProducts(data);
        setFilteredProducts(data);
        setProductsLoading(false);
      } catch (err) {
        setError('Error al cargar los productos');
        console.error(err);
        setProductsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Filtrar productos cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.color.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);
  
  // Actualizar precio sugerido cuando cambia el producto seleccionado
  useEffect(() => {
    if (selectedProduct) {
      const product = products.find(p => p._id === selectedProduct);
      if (product && product.lastPurchasePrice) {
        setPrice(product.lastPurchasePrice.toString());
      } else {
        setPrice('');
      }
    }
  }, [selectedProduct, products]);
  
  // Calcular el total de la compra
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.quantity * item.price), 
    0
  );
  
  // Agregar item a la compra
  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0 || price <= 0) {
      setError('Por favor selecciona un producto y proporciona cantidad y precio válidos');
      return;
    }
    
    const product = products.find(p => p._id === selectedProduct);
    
    const newItem = {
      product: selectedProduct,
      productName: product.name,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      total: parseFloat(quantity) * parseFloat(price)
    };
    
    setItems([...items, newItem]);
    setSelectedProduct('');
    setQuantity(1);
    setPrice('');
    setError('');
  };
  
  // Eliminar item
  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };
  
  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      setError('Debes agregar al menos un producto a la compra');
      return;
    }
    
    if (!supplier.trim()) {
      setError('Por favor ingresa el nombre del proveedor');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Preparar datos para la API
      const purchaseData = {
        supplier,
        items: items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      await createPurchase(purchaseData);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error al crear compra:', err);
      setError(err.response?.data?.message || 'Error al registrar la compra');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <FormGroup>
        <Label htmlFor="supplier">Proveedor</Label>
        <Input
          type="text"
          id="supplier"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          placeholder="Nombre del proveedor"
          required
        />
      </FormGroup>
      
      <div>
        <h3>Agregar Productos</h3>
        
        <SearchBox>
          <Label htmlFor="searchTerm">Buscar productos</Label>
          <SearchInput
            type="text"
            id="searchTerm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, categoría o color"
          />
        </SearchBox>
        
        <FormGroup>
          <Label htmlFor="product">Producto</Label>
          {productsLoading ? (
            <LoadingSpinner />
          ) : (
            <Select
              id="product"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">Seleccionar producto</option>
              {filteredProducts.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name} - {product.category} ({product.color})
                </option>
              ))}
            </Select>
          )}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="quantity">Cantidad</Label>
          <Input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            step="1"
            placeholder="Cantidad"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="price">Precio de compra</Label>
          <Input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0.01"
            step="0.01"
            placeholder="Precio unitario"
          />
        </FormGroup>
        
        <AddButton 
          type="button" 
          onClick={handleAddItem}
          disabled={!selectedProduct || quantity <= 0 || price <= 0}
        >
          Agregar a la compra
        </AddButton>
      </div>
      
      {items.length > 0 && (
        <ItemsContainer>
          <ItemHeader>
            <div>Producto</div>
            <div>Cantidad</div>
            <div>Precio</div>
            <div>Total</div>
            <div></div>
          </ItemHeader>
          
          {items.map((item, index) => (
            <ItemRow key={index}>
              <div>{item.productName}</div>
              <div>{item.quantity}</div>
              <div>Q {item.price.toFixed(2)}</div>
              <div>Q {item.total.toFixed(2)}</div>
              <RemoveButton 
                type="button"
                onClick={() => handleRemoveItem(index)}
              >
                ×
              </RemoveButton>
            </ItemRow>
          ))}
        </ItemsContainer>
      )}
      
      {items.length > 0 && (
        <Summary>
          <TotalAmount>
            Total: <span>Q {totalAmount.toFixed(2)}</span>
          </TotalAmount>
        </Summary>
      )}
      
      <ButtonGroup>
        <Button 
          type="button" 
          danger 
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          disabled={loading || items.length === 0}
        >
          {loading ? 'Procesando...' : 'Registrar Compra'}
        </Button>
      </ButtonGroup>
    </Form>
  );
};

export default CreatePurchaseForm;