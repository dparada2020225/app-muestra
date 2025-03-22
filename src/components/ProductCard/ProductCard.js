// src/components/ProductCard/ProductCard.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { getColorCode } from '../../utils/colorUtils';
import ImageViewer from '../ImageViewer/ImageViewer';

const Card = styled.div`
  background-color: ${props => props.theme.colors.cardBackground};
  padding: 15px;
  border-radius: 8px;
  box-shadow: ${props => props.theme.shadows.small};
  transition: transform 0.2s, box-shadow 0.2s;
  border-top: 3px solid ${props => props.theme.colors.primary};
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

const ImageContainer = styled.div`
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
  overflow: hidden;
  cursor: zoom-in;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.03);
  }
`;

const Placeholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #eee;
  color: #999;
  font-size: 32px;
  font-weight: bold;
`;

const ProductImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const ProductName = styled.h3`
  margin: 0 0 10px 0;
  color: ${props => props.theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductDetail = styled.p`
  margin: 5px 0;
  color: ${props => props.theme.colors.textLight};
  display: flex;
  align-items: center;
  gap: 5px;
`;

const PriceContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  align-items: center;
`;

const SalePrice = styled.p`
  margin: 0;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  font-size: 1.1rem;
`;

const PurchasePrice = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${props => props.theme.colors.textLight};
`;

const StockBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: ${props => props.inStock ? '#4caf50' : '#f44336'};
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 12px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
`;

const Button = styled.button`
  background-color: ${props => props.danger ? props.theme.colors.danger : props.theme.colors.primary};
  color: ${props => props.danger ? 'white' : props.theme.colors.secondary};
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    background-color: ${props => props.danger ? props.theme.colors.dangerHover || '#d32f2f' : props.theme.colors.primaryHover};
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ColorDot = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 1px solid #ddd;
  margin-right: 8px;
  vertical-align: middle;
`;

const API_URL = process.env.REACT_APP_API_URL || 'https://inventario-server-production-fc8d.up.railway.app';

const ProductCard = ({ product, onEdit, onDelete, onAddToSale, isAdmin }) => {
  const [imageError, setImageError] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageClick = () => {
    if (!imageError && product.image) {
      setIsViewerOpen(true);
    }
  };

  const fullImageUrl = `${API_URL}/images/${product.image}`;

  return (
    <>
      <Card>
        <StockBadge inStock={product.stock > 0}>
          {product.stock > 0 ? `Stock: ${product.stock}` : 'Sin stock'}
        </StockBadge>
        
        <ImageContainer onClick={handleImageClick}>
          {!imageError && product.image ? (
            <ProductImage 
              src={fullImageUrl}
              alt={product.name}
              onError={handleImageError}
            />
          ) : (
            <Placeholder>
              {product.name.charAt(0).toUpperCase()}
            </Placeholder>
          )}
        </ImageContainer>
        
        <ProductName>{product.name}</ProductName>
        <ProductDetail>Categoría: {product.category}</ProductDetail>
        <ProductDetail>
          <ColorDot color={getColorCode(product.color)} />
          Color: {product.color}
        </ProductDetail>
        
        <PriceContainer>
          <SalePrice>
            Precio: Q {parseFloat(product.salePrice).toFixed(2)}
          </SalePrice>
          <PurchasePrice>
            Compra: Q {parseFloat(product.lastPurchasePrice || 0).toFixed(2)}
          </PurchasePrice>
        </PriceContainer>
        
        {isAdmin && (
          <ButtonContainer>
            {onAddToSale && (
              <Button 
                disabled={product.stock <= 0}
                onClick={() => onAddToSale(product)}
              >
                Agregar a venta
              </Button>
            )}
            
            <ButtonGroup>
              {onEdit && (
                <Button onClick={() => onEdit(product)}>
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button danger onClick={() => onDelete(product._id)}>
                  Eliminar
                </Button>
              )}
            </ButtonGroup>
          </ButtonContainer>
        )}
      </Card>

      {/* Visor de imágenes con el nombre del producto como título */}
      <ImageViewer 
        isOpen={isViewerOpen}
        image={fullImageUrl}
        altText={product.name}
        onClose={() => setIsViewerOpen(false)}
      />
    </>
  );
};

export default ProductCard;