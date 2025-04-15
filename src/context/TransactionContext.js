// src/context/TransactionContext.js
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useTenant } from './TenantContext';

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

  // Obtener información de autenticación y tenant
  const { isAuthenticated, token } = useAuth();
  const { currentTenant } = useTenant();
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Cargar compras - usando useCallback para evitar recreación de funciones
  const fetchPurchases = useCallback(async (startDate, endDate) => {
    // No realizar peticiones si el usuario no está autenticado
    if (!isAuthenticated || !token) {
      console.log("No autenticado. No se pueden cargar compras.");
      return [];
    }

    try {
      setPurchasesLoading(true);
      setPurchasesError(null);
      
      console.log("Cargando compras con token:", token);
      
      // Construir parámetros de consulta para el filtro de fecha
      let params = {};
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      
      // Usar url específica para compras
      const url = `${API_URL}/api/purchases`;
      console.log("Solicitud a:", url, "con params:", params);
      
      const response = await axios.get(url, {
        params,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Respuesta de compras:", response.data);
      setPurchases(response.data);
      return response.data;
    } catch (error) {
      console.error('Error al cargar compras:', error);
      if (error.response) {
        console.error('Respuesta de error:', error.response.data);
        console.error('Status:', error.response.status);
        setPurchasesError(`Error ${error.response.status}: ${error.response.data.message || 'Error al cargar compras'}`);
      } else if (error.request) {
        console.error('No se recibió respuesta:', error.request);
        setPurchasesError('Error de red: No se pudo conectar con el servidor');
      } else {
        console.error('Error:', error.message);
        setPurchasesError(`Error: ${error.message}`);
      }
      return [];
    } finally {
      setPurchasesLoading(false);
    }
  }, [isAuthenticated, token, API_URL]);
  
  // Cargar ventas
  const fetchSales = useCallback(async (startDate, endDate) => {
    // No realizar peticiones si el usuario no está autenticado
    if (!isAuthenticated || !token) {
      console.log("No autenticado. No se pueden cargar ventas.");
      return [];
    }

    try {
      setSalesLoading(true);
      setSalesError(null);
      
      console.log("Cargando ventas con token:", token);
      
      // Construir parámetros de consulta para el filtro de fecha
      let params = {};
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      
      // Usar url específica para ventas
      const url = `${API_URL}/api/sales`;
      console.log("Solicitud a:", url, "con params:", params);
      
      const response = await axios.get(url, {
        params,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Respuesta de ventas:", response.data);
      setSales(response.data);
      return response.data;
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      if (error.response) {
        console.error('Respuesta de error:', error.response.data);
        console.error('Status:', error.response.status);
        setSalesError(`Error ${error.response.status}: ${error.response.data.message || 'Error al cargar ventas'}`);
      } else if (error.request) {
        console.error('No se recibió respuesta:', error.request);
        setSalesError('Error de red: No se pudo conectar con el servidor');
      } else {
        console.error('Error:', error.message);
        setSalesError(`Error: ${error.message}`);
      }
      return [];
    } finally {
      setSalesLoading(false);
    }
  }, [isAuthenticated, token, API_URL]);
  
  // Crear nueva compra
  const createPurchase = async (purchaseData) => {
    try {
      setPurchasesLoading(true);
      setPurchasesError(null);
      
      const url = `${API_URL}/api/purchases`;
      console.log("Creando compra en:", url, "con datos:", purchaseData);
      
      const response = await axios.post(url, purchaseData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Respuesta de creación de compra:", response.data);
      setPurchases(prev => [response.data, ...prev]); // Añadir al inicio de la lista
      return response.data;
    } catch (error) {
      console.error('Error al crear compra:', error);
      if (error.response) {
        console.error('Respuesta de error:', error.response.data);
        setPurchasesError(error.response.data.message || 'Error al registrar la compra');
      } else {
        setPurchasesError('Error de conexión al servidor');
      }
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
      
      const url = `${API_URL}/api/sales`;
      console.log("Creando venta en:", url, "con datos:", saleData);
      
      const response = await axios.post(url, saleData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Respuesta de creación de venta:", response.data);
      setSales(prev => [response.data, ...prev]); // Añadir al inicio de la lista
      return response.data;
    } catch (error) {
      console.error('Error al crear venta:', error);
      if (error.response) {
        console.error('Respuesta de error:', error.response.data);
        setSalesError(error.response.data.message || 'Error al registrar la venta');
      } else {
        setSalesError('Error de conexión al servidor');
      }
      throw error;
    } finally {
      setSalesLoading(false);
    }
  };
  
  // Obtener información de una compra específica
  const getPurchase = async (id) => {
    try {
      setPurchasesLoading(true);
      setPurchasesError(null);
      
      const url = `${API_URL}/api/purchases/${id}`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
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
    try {
      setSalesLoading(true);
      setSalesError(null);
      
      const url = `${API_URL}/api/sales/${id}`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalle de venta:', error);
      setSalesError('Error al obtener información de la venta');
      throw error;
    } finally {
      setSalesLoading(false);
    }
  };
  
  // Recargar todos los datos de transacciones
  const refreshAll = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    
    try {
      await Promise.all([fetchPurchases(), fetchSales()]);
      setDataInitialized(true);
    } catch (error) {
      console.error('Error al cargar datos de transacciones:', error);
    }
  }, [fetchPurchases, fetchSales, isAuthenticated, token]);
  
  // Esta función se llama cuando el componente se monta o cuando el usuario/tenant cambia
  const initializeData = useCallback(() => {
    if (isAuthenticated && token && !dataInitialized) {
      console.log("Inicializando datos de transacciones...");
      refreshAll();
    }
  }, [isAuthenticated, token, dataInitialized, refreshAll]);
  
  // Carga automática cuando el usuario está autenticado y hay un tenant
  useEffect(() => {
    if (isAuthenticated && token && currentTenant && !dataInitialized) {
      console.log("Cargando automáticamente datos de transacciones...");
      initializeData();
    }
  }, [isAuthenticated, token, currentTenant, dataInitialized, initializeData]);
  
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