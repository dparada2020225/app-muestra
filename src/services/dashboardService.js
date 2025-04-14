// src/services/dashboardService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Función para obtener el tenant actual de manera consistente
const getCurrentTenant = () => {
  try {
    // Primero intentar obtener del localStorage
    const cachedTenant = localStorage.getItem('currentTenant');
    if (cachedTenant) {
      const tenant = JSON.parse(cachedTenant);
      if (tenant && tenant.subdomain) {
        return tenant.subdomain;
      }
    }
    
    // Si no hay dato en localStorage, intentar obtener del hostname
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // Para desarrollo local (localhost)
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Intentar obtener de los parámetros de URL
        const urlParams = new URLSearchParams(window.location.search);
        const tenantParam = urlParams.get('tenant');
        if (tenantParam) {
          return tenantParam;
        }
        
        // Intentar obtener del subdominio de localhost
        const parts = hostname.split('.');
        if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost') {
          return parts[0];
        }
      } else {
        // En producción, obtener del subdominio
        const parts = hostname.split('.');
        if (parts.length >= 2 && parts[0] !== 'www') {
          return parts[0];
        }
      }
    }
    
    return 'demo'; // Valor por defecto
  } catch (e) {
    console.error('Error al obtener el tenant:', e);
    return 'demo'; // Valor por defecto en caso de error
  }
};

const dashboardService = {
  // Obtener estadísticas básicas (productos, ventas, compras)
  getStats: async () => {
    try {
      const tenantId = getCurrentTenant();
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'X-Tenant-ID': tenantId
      };
      
      const response = await axios.get(`${API_URL}/api/dashboard/stats`, { headers });
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      
      // En caso de error, podemos intentar construir estadísticas a partir de datos disponibles
      try {
        // Intentar obtener productos, ventas y compras por separado
        const [products, sales, purchases] = await Promise.all([
          axios.get(`${API_URL}/api/products`, { 
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'X-Tenant-ID': getCurrentTenant()
            }
          }),
          axios.get(`${API_URL}/api/sales`, { 
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'X-Tenant-ID': getCurrentTenant()
            }
          }),
          axios.get(`${API_URL}/api/purchases`, { 
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'X-Tenant-ID': getCurrentTenant()
            }
          })
        ]);
        
        // Calcular estadísticas básicas
        const lowStockThreshold = 5; // Umbral de stock bajo
        return {
          totalProducts: products.data.length,
          totalSales: sales.data.length,
          totalPurchases: purchases.data.length,
          lowStockProducts: products.data.filter(p => p.stock <= lowStockThreshold).length,
          recentSalesAmount: sales.data.reduce((sum, sale) => sum + sale.totalAmount, 0),
          recentPurchasesAmount: purchases.data.reduce((sum, purchase) => sum + purchase.totalAmount, 0),
          productsWithLowStock: products.data
            .filter(p => p.stock <= lowStockThreshold)
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 10) // Obtener los 10 productos con menos stock
        };
      } catch (secondError) {
        console.error('Error al obtener datos alternativos:', secondError);
        throw error; // Devolver el error original
      }
    }
  },
  
  // Obtener datos para gráficos de ventas en los últimos 30 días
  getSalesChartData: async (days = 30) => {
    try {
      const tenantId = getCurrentTenant();
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'X-Tenant-ID': tenantId
      };
      
      // Preparar fechas para la consulta
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };
      
      const response = await axios.get(`${API_URL}/api/sales`, { 
        headers,
        params
      });
      
      // Procesar datos para el gráfico
      const salesByDate = {};
      
      // Inicializar todas las fechas del período con valor 0
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        salesByDate[dateStr] = 0;
      }
      
      // Sumar ventas por fecha
      response.data.forEach(sale => {
        const saleDate = new Date(sale.date).toISOString().split('T')[0];
        if (salesByDate[saleDate] !== undefined) {
          salesByDate[saleDate] += sale.totalAmount;
        }
      });
      
      // Convertir a formato para gráficas
      const chartData = Object.keys(salesByDate)
        .sort() // Ordenar fechas cronológicamente
        .map(date => ({
          date,
          amount: salesByDate[date]
        }));
      
      return chartData;
    } catch (error) {
      console.error('Error al obtener datos de gráfico de ventas:', error);
      return [];
    }
  },
  
  // Obtener datos para gráficos de compras en los últimos 30 días
  getPurchasesChartData: async (days = 30) => {
    try {
      const tenantId = getCurrentTenant();
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'X-Tenant-ID': tenantId
      };
      
      // Preparar fechas para la consulta
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };
      
      const response = await axios.get(`${API_URL}/api/purchases`, { 
        headers,
        params
      });
      
      // Procesar datos para el gráfico
      const purchasesByDate = {};
      
      // Inicializar todas las fechas del período con valor 0
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        purchasesByDate[dateStr] = 0;
      }
      
      // Sumar compras por fecha
      response.data.forEach(purchase => {
        const purchaseDate = new Date(purchase.date).toISOString().split('T')[0];
        if (purchasesByDate[purchaseDate] !== undefined) {
          purchasesByDate[purchaseDate] += purchase.totalAmount;
        }
      });
      
      // Convertir a formato para gráficas
      const chartData = Object.keys(purchasesByDate)
        .sort() // Ordenar fechas cronológicamente
        .map(date => ({
          date,
          amount: purchasesByDate[date]
        }));
      
      return chartData;
    } catch (error) {
      console.error('Error al obtener datos de gráfico de compras:', error);
      return [];
    }
  },
  
  // Obtener productos con stock bajo
  getLowStockProducts: async (threshold = 5, limit = 10) => {
    try {
      const tenantId = getCurrentTenant();
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'X-Tenant-ID': tenantId
      };
      
      const response = await axios.get(`${API_URL}/api/products`, { headers });
      
      // Filtrar productos con stock bajo
      const lowStockProducts = response.data
        .filter(product => product.stock <= threshold)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, limit);
      
      return lowStockProducts;
    } catch (error) {
      console.error('Error al obtener productos con stock bajo:', error);
      return [];
    }
  },
  
  // Obtener resumen de categorías de productos
  getCategoryStats: async () => {
    try {
      const tenantId = getCurrentTenant();
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'X-Tenant-ID': tenantId
      };
      
      const response = await axios.get(`${API_URL}/api/products`, { headers });
      
      // Contar productos por categoría
      const categoryCounts = {};
      response.data.forEach(product => {
        if (!categoryCounts[product.category]) {
          categoryCounts[product.category] = 0;
        }
        categoryCounts[product.category]++;
      });
      
      // Convertir a formato para gráficas
      const chartData = Object.keys(categoryCounts).map(category => ({
        name: category,
        value: categoryCounts[category]
      }));
      
      return chartData;
    } catch (error) {
      console.error('Error al obtener estadísticas de categorías:', error);
      return [];
    }
  }
};

export default dashboardService;