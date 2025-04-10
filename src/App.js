// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import UserManagement from './pages/Admin/UserManagement';
import TransactionsPage from './pages/Transactions/TransactionsPage';
import Header from './components/Header/Header';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { theme } from './theme';
import { AuthProvider } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import { ProductProvider } from './context/ProductContext';
import { TenantProvider } from './context/TenantContext';
import TenantRedirect from './components/TenantRedirect/TenantRedirect';
import PublicTenantPage from './pages/PublicTenantPage/PublicTenantPage';
import NotFound from './pages/NotFound/NotFound';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 0;
    background-color: ${props => props.theme.colors.background};
  }
  
  * {
    box-sizing: border-box;
  }

  h1, h2, h3 {
    color: ${props => props.theme.colors.text};
  }

  /* Variables CSS para configuración específica de tenant */
  :root {
    --primary-color: ${props => props.theme.colors.primary};
    --secondary-color: ${props => props.theme.colors.secondary};
  }
`;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        {/* TenantProvider debe estar fuera para manejar rutas públicas también */}
        <TenantProvider>
          <AuthProvider>
            <GlobalStyle />
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
              
              {/* Rutas específicas para el dominio principal (sin tenant) */}
              <Route path="/register-tenant" element={<Navigate to="/register" replace />} />
              <Route path="/register" element={<Register isTenantRegistration={true} />} />
              
              {/* Ruta 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </TenantProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;