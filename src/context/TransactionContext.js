// src/context/TransactionContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';
import { purchaseService, saleService } from '../services/api';
import { useAuth } from './AuthContext';

const TransactionContext = createContext();

export const useTransactions = () => useContext(TransactionContext);

export const TransactionProvider = ({ children }) => {
  // Estado para compras
  const [purchases, setPurchases] = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [purchasesError, setPurchasesError] = useState(null);
  
  // Estado para ventas
  const [sales, setSales] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState(null);
  
  // Flag para controlar si los datos ya fueron cargados
  const [dataInitialized, setDataInitialized] = useState(false);

  // Obtener información de autenticación
  const { isAuthenticated, isAdmin } = useAuth();
  
  // Cargar compras - usando useCallback para evitar recreación de funciones
  const fetchPurchases = useCallback(async (startDate, endDate) => {
    // No realizar peticiones si el usuario no está autenticado o no es admin
    if (!isAuthenticated || !isAdmin) {
      return [];
    }

    try {
      setPurchasesLoading(true);
      setPurchasesError(null);
      
      // Construir parámetros de consulta para el filtro de fecha
      let params = {};
      if (startDate && endDate) {
        params = { startDate, endDate };
      }
      
      const data = await purchaseService.getAllPurchases(params);
      setPurchases(data);
      return data;
    } catch (error) {
      console.error('Error al cargar compras:', error);
      setPurchasesError('Error al cargar el historial de compras');
      return [];
    } finally {
      setPurchasesLoading(false);
    }
  }, [isAuthenticated, isAdmin]);
  
  // Cargar ventas
  const fetchSales = useCallback(async (startDate, endDate) => {
    // No realizar peticiones si el usuario no está autenticado o no es admin
    if (!isAuthenticated || !isAdmin) {
      return [];
    }

    try {
      setSalesLoading(true);
      setSalesError(null);
      
      // Construir parámetros de consulta para el filtro de fecha
      let params = {};
      if (startDate && endDate) {
        params = { startDate, endDate };
      }
      
      const data = await saleService.getAllSales(params);
      setSales(data);
      return data;
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      setSalesError('Error al cargar el historial de ventas');
      return [];
    } finally {
      setSalesLoading(false);
    }
  }, [isAuthenticated, isAdmin]);
  
  // Crear nueva compra
  const createPurchase = async (purchaseData) => {
    try {
      setPurchasesLoading(true);
      setPurchasesError(null);
      const result = await purchaseService.createPurchase(purchaseData);
      setPurchases(prev => [result, ...prev]); // Añadir al inicio de la lista
      return result;
    } catch (error) {
      console.error('Error al crear compra:', error);
      setPurchasesError('Error al registrar la compra');
      throw error;
    } finally {
      setPurchasesLoading(false);
    }
  };
  
  // Crear nueva venta
  const createSale = async (saleData) => {
    try {
      setSalesLoading(true);
      setSalesError(null);
      const result = await saleService.createSale(saleData);
      setSales(prev => [result, ...prev]); // Añadir al inicio de la lista
      return result;
    } catch (error) {
      console.error('Error al crear venta:', error);
      setSalesError('Error al registrar la venta');
      throw error;
    } finally {
      setSalesLoading(false);
    }
  };
  
  // Obtener información de una compra específica
  const getPurchase = async (id) => {
    if (!isAuthenticated || !isAdmin) return null;
    
    try {
      setPurchasesLoading(true);
      setPurchasesError(null);
      return await purchaseService.getPurchaseById(id);
    } catch (error) {
      console.error('Error al obtener detalle de compra:', error);
      setPurchasesError('Error al obtener información de la compra');
      throw error;
    } finally {
      setPurchasesLoading(false);
    }
  };
  
  // Obtener información de una venta específica
  const getSale = async (id) => {
    if (!isAuthenticated || !isAdmin) return null;
    
    try {
      setSalesLoading(true);
      setSalesError(null);
      return await saleService.getSaleById(id);
    } catch (error) {
      console.error('Error al obtener detalle de venta:', error);
      setSalesError('Error al obtener información de la venta');
      throw error;
    } finally {
      setSalesLoading(false);
    }
  };
  
  // Recargar todos los datos de transacciones solo cuando se necesite
  const refreshAll = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) return;
    
    try {
      await Promise.all([fetchPurchases(), fetchSales()]);
      setDataInitialized(true);
    } catch (error) {
      console.error('Error al cargar datos de transacciones:', error);
    }
  }, [fetchPurchases, fetchSales, isAuthenticated, isAdmin]);
  
  // Inicializar datos solo cuando el usuario está autenticado y es admin
  // y solo cuando se navega a la página de transacciones
  const initializeData = useCallback(() => {
    if (isAuthenticated && isAdmin && !dataInitialized) {
      refreshAll();
    }
  }, [isAuthenticated, isAdmin, dataInitialized, refreshAll]);
  
  // NO cargar datos automáticamente al montar el componente
  // Ahora la carga se hará explícitamente cuando se necesite
  
  // Valor del contexto
  const value = {
    // Compras
    purchases,
    purchasesLoading,
    purchasesError,
    fetchPurchases,
    createPurchase,
    getPurchase,
    
    // Ventas
    sales,
    salesLoading,
    salesError,
    fetchSales,
    createSale,
    getSale,
    
    // Funciones de utilidad
    refreshAll,
    initializeData,
    dataInitialized
  };
  
  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export default TransactionContext;