// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
`;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AuthProvider>
          {/* Movimos el ProductProvider y TransactionProvider dentro de protectedRoutes 
              para que no se inicialicen hasta que el usuario esté autenticado */}
          <GlobalStyle />
          <Header />
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            
            {/* Rutas protegidas (requieren autenticación) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={
                <ProductProvider>
                  <Dashboard />
                </ProductProvider>
              } />
            </Route>
            
            {/* Rutas solo para admin */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>
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
            
            {/* Ruta 404 */}
            <Route path="*" element={<div style={{padding: '40px', textAlign: 'center'}}>Página no encontrada</div>} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;