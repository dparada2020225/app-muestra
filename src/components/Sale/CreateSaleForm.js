// src/components/Sale/CreateSaleForm.js
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

const ProductSelectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
  margin-top: 15px;
  max-height: 300px;
  overflow-y: auto;
  padding: 5px;
`;

const ProductCard = styled.div`
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  ${props => props.selected && `
    border-color: ${props.theme.colors.primary};
    background-color: rgba(150, 255, 0, 0.1);
  `}
  
  ${props => props.disabled && `
    opacity: 0.5;
    cursor: not-allowed;
  `}
`;

const ProductName = styled.div`
  font-weight: 600;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductInfo = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textLight};
  margin-bottom: 3px;
`;

const ProductPrice = styled.div`
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  margin-top: 5px;
`;

const StockIndicator = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: ${props => props.inStock ? '#4caf50' : '#f44336'};
  color: white;
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
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

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
`;

const QuantityButton = styled.button`
  background-color: #f5f5f5;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  font-weight: bold;
  
  &:hover {
    background-color: #e0e0e0;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityInput = styled.input`
  width: 40px;
  text-align: center;
  border: none;
  padding: 5px 0;
  -moz-appearance: textfield;
  
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  &:focus {
    outline: none;
  }
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

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.danger};
  background-color: rgba(255, 0, 0, 0.1);
  border-left: 3px solid ${props => props.theme.colors.danger};
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 10px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const SearchBox = styled.div`
  margin-bottom: 15px;
`;

const SearchInput = styled(Input)`
  width: 100%;
`;

const CreateSaleForm = ({ onSuccess, onCancel }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customer, setCustomer] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { createSale } = useTransactions();
  
  // Cargar productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAllProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        setError('Error al cargar los productos');
        console.error(err);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Filtrar productos cuando cambie el término de búsqueda
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
  
  // Calcular total
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.quantity * item.price), 
    0
  );
  
  // Agregar item a la venta
  const handleAddItem = (product) => {
    // Verificar si ya está en los items
    const existingItemIndex = items.findIndex(item => item.product === product._id);
    
    if (existingItemIndex !== -1) {
      // Incrementar cantidad si ya existe
      const newItems = [...items];
      if (newItems[existingItemIndex].quantity < product.stock) {
        newItems[existingItemIndex].quantity += 1;
        newItems[existingItemIndex].total = 
          newItems[existingItemIndex].quantity * newItems[existingItemIndex].price;
        setItems(newItems);
      }
    } else {
      // Agregar nuevo item
      const newItem = {
        product: product._id,
        productName: product.name,
        quantity: 1,
        price: product.salePrice,
        total: product.salePrice,
        maxStock: product.stock
      };
      
      setItems([...items, newItem]);
    }
    
    setError('');
  };
  
  // Actualizar cantidad de un item
  const updateItemQuantity = (index, newQuantity) => {
    const newItems = [...items];
    const item = newItems[index];
    
    // Validar que no exceda el stock disponible
    if (newQuantity > item.maxStock) {
      setError(`Solo hay ${item.maxStock} unidades disponibles de ${item.productName}`);
      return;
    }
    
    if (newQuantity < 1) {
      newQuantity = 1;
    }
    
    item.quantity = newQuantity;
    item.total = item.quantity * item.price;
    
    setItems(newItems);
    setError('');
  };
  
  // Eliminar item
  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };
  
  // Comprobar si un producto está en la lista de items
  const isProductInItems = (productId) => {
    return items.some(item => item.product === productId);
  };
  
  // Obtener la cantidad actual de un producto en los items
  const getProductQuantityInItems = (productId) => {
    const item = items.find(item => item.product === productId);
    return item ? item.quantity : 0;
  };
  
  // Verificar si se puede agregar más cantidad de un producto
  const canAddMoreQuantity = (product) => {
    const currentQty = getProductQuantityInItems(product._id);
    return currentQty < product.stock;
  };
  
  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      setError('Debes agregar al menos un producto a la venta');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Preparar datos para la API
      const saleData = {
        customer: customer.trim() || 'Cliente general',
        items: items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      await createSale(saleData);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error al crear venta:', err);
      setError(err.response?.data?.message || 'Error al registrar la venta');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <FormGroup>
        <Label htmlFor="customer">Cliente</Label>
        <Input
          type="text"
          id="customer"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          placeholder="Nombre del cliente (opcional)"
        />
      </FormGroup>
      
      <div>
        <h3>Seleccionar Productos</h3>
        
        <SearchBox>
          <SearchInput
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>
        
        <ProductSelectionGrid>
          {filteredProducts.map(product => (
            <ProductCard
              key={product._id}
              selected={isProductInItems(product._id)}
              disabled={product.stock === 0 || 
                       (isProductInItems(product._id) && !canAddMoreQuantity(product))}
              onClick={() => {
                if (product.stock > 0 && 
                   (!isProductInItems(product._id) || canAddMoreQuantity(product))) {
                  handleAddItem(product);
                }
              }}
            >
              <StockIndicator inStock={product.stock > 0}>
                {product.stock} disp.
              </StockIndicator>
              <ProductName>{product.name}</ProductName>
              <ProductInfo>{product.category} - {product.color}</ProductInfo>
              <ProductPrice>Q {parseFloat(product.salePrice).toFixed(2)}</ProductPrice>
            </ProductCard>
          ))}
          
          {filteredProducts.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '20px', textAlign: 'center' }}>
              No se encontraron productos que coincidan con la búsqueda
            </div>
          )}
        </ProductSelectionGrid>
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
              <div>
                <QuantityControl>
                  <QuantityButton
                    type="button"
                    onClick={() => updateItemQuantity(index, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </QuantityButton>
                  <QuantityInput
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                    min="1"
                    max={item.maxStock}
                  />
                  <QuantityButton
                    type="button"
                    onClick={() => updateItemQuantity(index, item.quantity + 1)}
                    disabled={item.quantity >= item.maxStock}
                  >
                    +
                  </QuantityButton>
                </QuantityControl>
              </div>
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
          {loading ? 'Procesando...' : 'Registrar Venta'}
        </Button>
      </ButtonGroup>
    </Form>
  );
};

export default CreateSaleForm;