// src/components/common/CurrencyDisplay.js
import React from 'react';
import { useTenant } from '../../context/TenantContext';

const CurrencyDisplay = ({ value, decimals = 2 }) => {
  const { currentTenant } = useTenant();
  
  // Obtener el símbolo de moneda del tenant o usar el predeterminado
  const currencySymbol = currentTenant?.customization?.currencySymbol || 'Q';
  
  // Formatear el valor con el número correcto de decimales
  const formattedValue = parseFloat(value).toFixed(decimals);
  
  return (
    <span>{currencySymbol} {formattedValue}</span>
  );
};

export default CurrencyDisplay;