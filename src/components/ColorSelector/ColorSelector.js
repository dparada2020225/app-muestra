// src/components/ColorSelector/ColorSelector.js
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { getColorCode } from '../../utils/colorUtils';

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 8px 8px ${props => props.hasPreview ? '36px' : '8px'};
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 2px rgba(150, 255, 0, 0.2);
  }
`;

const ColorPreview = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  position: absolute;
  left: 8px;
  background-color: ${props => props.color || '#cccccc'};
  border: 1px solid #ddd;
  z-index: 1;
`;

const DropdownButton = styled.button`
  background: transparent;
  border: none;
  position: absolute;
  right: 8px;
  cursor: pointer;
  z-index: 1;
  font-size: 16px;
  color: #777;
  
  &:focus {
    outline: none;
  }
`;

const DropdownList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-top: 5px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: ${props => props.theme.shadows.medium};
  display: ${props => props.show ? 'block' : 'none'};
`;

const ColorItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const ColorDot = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 1px solid #ddd;
  margin-right: 10px;
`;

const ColorName = styled.span`
  flex: 1;
`;

// Lista de colores comunes que se mostrarán en el dropdown
const commonColors = [
  { name: 'Rojo', color: '#ff0000' },
  { name: 'Verde', color: '#00ff00' },
  { name: 'Azul', color: '#0000ff' },
  { name: 'Amarillo', color: '#ffff00' },
  { name: 'Negro', color: '#000000' },
  { name: 'Blanco', color: '#ffffff' },
  { name: 'Gris', color: '#808080' },
  { name: 'Naranja', color: '#ffa500' },
  { name: 'Morado', color: '#800080' },
  { name: 'Rosa', color: '#ffc0cb' },
  { name: 'Marrón', color: '#a52a2a' },
  { name: 'Celeste', color: '#87ceeb' },
  { name: 'Dorado', color: '#ffd700' },
  { name: 'Plateado', color: '#c0c0c0' },
  { name: 'Cromado', color: '#e8e8e8' },
  // Colores adicionales
  { name: 'Beige', color: '#f5f5dc' },
  { name: 'Turquesa', color: '#40e0d0' },
  { name: 'Ocre', color: '#cc7722' },
  { name: 'Verde Oliva', color: '#808000' },
  { name: 'Coral', color: '#ff7f50' },
  { name: 'Índigo', color: '#4b0082' },
  { name: 'Vino', color: '#722f37' },
  { name: 'Mostaza', color: '#ffdb58' }
];

const ColorSelector = ({ 
  value, 
  onChange, 
  availableColors = [], 
  placeholder = "Selecciona o escribe un color",
  useOnlyAvailableColors = false 
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [colorPreview, setColorPreview] = useState('#cccccc');
  const containerRef = useRef(null);
  
  // Determinar qué colores mostrar en el dropdown
  let allColors;
  if (useOnlyAvailableColors) {
    // Si useOnlyAvailableColors es true, solo usar los colores disponibles
    allColors = [...availableColors].sort();
  } else {
    // Si no, combinar los colores disponibles con los colores comunes
    allColors = [...new Set([...availableColors, ...commonColors.map(c => c.name)])].sort();
  }
  
  // Actualiza la previsualización del color cuando cambia el valor de entrada
  useEffect(() => {
    if (inputValue) {
      const colorCode = getColorCode(inputValue);
      setColorPreview(colorCode);
    } else {
      setColorPreview('#cccccc');
    }
  }, [inputValue]);
  
  // Actualiza el inputValue cuando cambia el prop value
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);
  
  // Cierra el dropdown cuando se hace clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Solo llamamos a onChange si el valor ha cambiado
    if (newValue !== value) {
      onChange(newValue);
    }
  };
  
  const handleColorSelect = (colorName) => {
    setInputValue(colorName);
    onChange(colorName);
    setShowDropdown(false);
  };
  
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  
  // Filtrar los colores basados en el texto de entrada
  const filteredColors = inputValue
    ? allColors.filter(color => color.toLowerCase().includes(inputValue.toLowerCase()))
    : allColors;
    
  // Si no hay colores filtrados y el usuario ha escrito algo, mostrar el texto ingresado
  // como opción (solo si no estamos restringidos a los colores disponibles)
  if (filteredColors.length === 0 && inputValue && !useOnlyAvailableColors) {
    filteredColors.push(inputValue);
  }
  
  return (
    <Container ref={containerRef}>
      <InputContainer>
        <ColorPreview color={colorPreview} />
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          hasPreview={true}
        />
        <DropdownButton type="button" onClick={toggleDropdown}>
          ▼
        </DropdownButton>
      </InputContainer>
      
      <DropdownList show={showDropdown}>
        {filteredColors.map((color, index) => (
          <ColorItem key={index} onClick={() => handleColorSelect(color)}>
            <ColorDot color={getColorCode(color)} />
            <ColorName>{color}</ColorName>
          </ColorItem>
        ))}
        {filteredColors.length === 0 && (
          <ColorItem>
            <ColorDot color="#cccccc" />
            <ColorName>No se encontraron colores</ColorName>
          </ColorItem>
        )}
      </DropdownList>
    </Container>
  );
};

export default ColorSelector;