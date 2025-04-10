// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import UserManagement from './pages/Admin/UserManagement';
import TransactionsPage from './pages/Transactions/TransactionsPage';
import Header from './components/Header/Header';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import { ProductProvider } from './context/ProductContext';
import { TenantProvider, useTenant } from './context/TenantContext';
import TenantRedirect from './components/TenantRedirect/TenantRedirect';
import PublicTenantPage from './pages/PublicTenantPage/PublicTenantPage';
import NotFound from './pages/NotFound/NotFound';
import TenantThemeProvider from './components/TenantThemeProvider/TenantThemeProvider';
import TenantSettings from './pages/TenantSettings/TenantSettings';

// Componente para manejar la inicialización del tenant basado en el usuario
const TenantInitializer = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { currentTenant, loading: tenantLoading, switchTenant } = useTenant();
  
  useEffect(() => {
    // Si el usuario está autenticado y tiene un tenantId pero no hay tenant activo
    if (isAuthenticated && !authLoading && user?.tenantId && !currentTenant && !tenantLoading) {
      console.log("Inicializando tenant desde el usuario:", user.tenantId);
      switchTenant(user.tenantId);
    }
  }, [isAuthenticated, authLoading, user, currentTenant, tenantLoading, switchTenant]);
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      {/* TenantProvider debe estar fuera para manejar rutas públicas también */}
      <TenantProvider>
        <AuthProvider>
          <TenantInitializer>
            <TenantThemeProvider>
              <Header />
              <Routes>
                {/* TenantRedirect verifica si estamos en el dominio principal o en un subdominio */}
                <Route path="/" element={<TenantRedirect />} />
                
                {/* Rutas públicas específicas del tenant */}
                <Route path="/public" element={<PublicTenantPage />} />
                <Route path="/login" element={<Login />} />
                
                {/* Rutas protegidas (requieren autenticación y tenant) */}
                <Route element={<ProtectedRoute requireTenant={true} />}>
                  <Route path="/dashboard" element={
                    <ProductProvider>
                      <Dashboard />
                    </ProductProvider>
                  } />
                </Route>
                
                {/* Rutas solo para admin dentro del tenant */}
                <Route element={<ProtectedRoute requireAdmin={true} requireTenant={true} />}>
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/users/new" element={<Register />} />
                  <Route path="/admin/transactions" element={
                    <ProductProvider>
                      <TransactionProvider>
                        <TransactionsPage />
                      </TransactionProvider>
                    </ProductProvider>
                  } />
                </Route>
                
                {/* Rutas específicas para administradores del tenant */}
                <Route element={<ProtectedRoute requireTenant={true} requireTenantAdmin={true} />}>
                  <Route path="/tenant/settings" element={<TenantSettings />} />
                </Route>
                
                {/* Rutas específicas para el dominio principal (sin tenant) */}
                <Route path="/register-tenant" element={<Navigate to="/register" replace />} />
                <Route path="/register" element={<Register isTenantRegistration={true} />} />
                
                {/* Ruta 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TenantThemeProvider>
          </TenantInitializer>
        </AuthProvider>
      </TenantProvider>
    </Router>
  );
}

export default App;