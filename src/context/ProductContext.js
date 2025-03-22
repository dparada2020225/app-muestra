// src/context/ProductContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { productService } from '../services/api';
import { useAuth } from './AuthContext';

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    searchTerm: '',
    category: '',
    color: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    withoutStock: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Obtener información de autenticación
  const { isAuthenticated } = useAuth();

  // Cargar productos desde la API
  const fetchProducts = useCallback(async () => {
    // No realizar la carga si no estamos autenticados
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data);
      applyFilters(data, filters);
      setError(null);
      setInitialized(true);
    } catch (err) {
      setError('Error al cargar productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filters]);

  // Inicializar datos solo cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated && !initialized) {
      fetchProducts();
    }
  }, [isAuthenticated, initialized, fetchProducts]);

  // Aplicar filtros cuando cambien los productos o los filtros
  useEffect(() => {
    applyFilters(products, filters);
  }, [filters, products]);

  const applyFilters = (productsList, currentFilters) => {
    const { searchTerm, category, color, minPrice, maxPrice, inStock, withoutStock } = currentFilters;
    
    const filtered = productsList.filter(product => {
      // Filtro por texto de búsqueda
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtro por categoría
      if (category && product.category !== category) {
        return false;
      }
      
      // Filtro por color
      if (color && product.color !== color) {
        return false;
      }
      
      // Filtro por precio
      const price = parseFloat(product.salePrice);
      if (minPrice && price < parseFloat(minPrice)) {
        return false;
      }
      if (maxPrice && price > parseFloat(maxPrice)) {
        return false;
      }
      
      // Filtro por stock
      if (inStock && product.stock <= 0) {
        return false;
      }
      if (withoutStock && product.stock > 0) {
        return false;
      }
      
      return true;
    });
    
    setFilteredProducts(filtered);
  };

  // Actualizar productos
  const updateProduct = async (updatedProduct) => {
    setLoading(true);
    try {
      const product = await productService.updateProduct(updatedProduct._id, updatedProduct);
      setProducts(products.map(p => p._id === product._id ? product : p));
      return product;
    } catch (err) {
      setError('Error al actualizar producto');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    setLoading(true);
    try {
      await productService.deleteProduct(productId);
      setProducts(products.filter(p => p._id !== productId));
    } catch (err) {
      setError('Error al eliminar producto');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener categorías y colores únicos para los filtros
  const categories = [...new Set(products.map(p => p.category))].filter(Boolean).sort();
  const colors = [...new Set(products.map(p => p.color))].filter(Boolean).sort();

  return (
    <ProductContext.Provider value={{
      products,
      filteredProducts,
      filters,
      categories,
      colors,
      loading,
      error,
      initialized,
      setFilters,
      updateProduct,
      deleteProduct,
      refreshProducts: fetchProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
};