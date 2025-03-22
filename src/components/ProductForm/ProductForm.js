// src/components/ProductForm/ProductForm.js
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import ColorSelector from '../ColorSelector/ColorSelector';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  animation: ${fadeIn} 0.3s ease forwards;
`;

const FormGroup = styled.div`
  margin-bottom: 12px;  // Reducido desde 15px
  transition: all 0.2s ease;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;  // Reducido desde 10px
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 2px rgba(150, 255, 0, 0.2);
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.danger};
  font-size: 0.8rem;
  margin-top: 5px;
  padding: 8px 12px;
  background-color: #fff8f8;
  border-radius: 4px;
  border-left: 3px solid ${props => props.theme.colors.danger};
`;

const InfoMessage = styled.div`
  margin-top: 10px;
  color: #666;
  font-size: 0.9rem;
  padding: 8px 12px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border-left: 3px solid ${props => props.theme.colors.primary};
`;

// Componentes para el selector de archivos mejorado
const FileInputWrapper = styled.div`
  margin-bottom: 20px;
`;

const FileInputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const FileInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
`;

const CustomFileButton = styled.label`
  display: inline-block;
  padding: 8px 14px;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.secondary};
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
  box-shadow: ${props => props.theme.shadows.small};
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

const FileDisplay = styled.div`
  padding: 8px;
  background-color: #f8f8f8;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &::before {
    content: "📄";
    margin-right: 5px;
  }
`;

const HiddenInput = styled.input`
  position: absolute;
  left: -9999px;
  opacity: 0;
  visibility: hidden;
`;

const ImagePreview = styled.div`
  margin: 15px auto;
  width: 100%;
  max-width: 300px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 15px rgba(0,0,0,0.1);
  
  img {
    width: 100%;
    height: auto;
    display: block;
    max-height: 300px;
    object-fit: contain;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  position: sticky;
  bottom: 0;
  background: white;
  padding: 15px 0 5px 0;
  margin-top: 25px;
  border-top: 1px solid #eee;
  z-index: 2;
`;

const ActionButton = styled.button`
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  box-shadow: ${props => props.theme.shadows.small};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

const SaveButton = styled(ActionButton)`
  background-color: ${props => props.theme.colors.primary};
  color: #111;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryHover};
  }
`;

const CancelButton = styled(ActionButton)`
  background-color: #6c757d;
  color: white;
  
  &:hover {
    background-color: #5a6268;
  }
`;

const DetailedErrorContainer = styled.div`
  margin-top: 10px;
  padding: 10px;
  background-color: #fff8f8;
  border-radius: 4px;
  border-left: 3px solid ${props => props.theme.colors.danger};
`;

const DetailedErrorTitle = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
  color: ${props => props.theme.colors.danger};
`;

const DetailedErrorContent = styled.pre`
  overflow: auto;
  max-height: 150px;
  font-size: 12px;
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-word;
`;

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ProductForm = ({ product, onSave, onCancel, availableColors = [] }) => {
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    category: '',
    color: '',
    salePrice: '',
    stock: 0,
    lastPurchasePrice: 0,
    image: null
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailedError, setDetailedError] = useState(null);

  useEffect(() => {
    if (product) {
      // Mapeo correcto de los campos del producto
      setFormData({
        _id: product._id || '',
        name: product.name || '',
        category: product.category || '',
        color: product.color || '',
        salePrice: product.salePrice || '',
        stock: product.stock || 0,
        lastPurchasePrice: product.lastPurchasePrice || 0,
        image: product.image || null
      });
      
      // Si hay una imagen, establecer la URL de vista previa
      if (product.image) {
        setPreviewUrl(`${API_URL}/images/${product.image}`);
      }
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError('Por favor selecciona una imagen válida (JPEG, PNG o GIF)');
        setSelectedFile(null);
        setPreviewUrl('');
        return;
      }
      
      // Validar tamaño del archivo (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen debe ser menor a 5MB');
        setSelectedFile(null);
        setPreviewUrl('');
        return;
      }
      
      setError('');
      setSelectedFile(file);
      
      // Crear URL para vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewUrl('');
    }
  };

// Función handleSubmit corregida para el componente ProductForm
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setDetailedError(null);
  
  try {
    let imageId = formData.image;
    
    // Si hay un archivo seleccionado, subirlo primero
    if (selectedFile) {
      const formDataFile = new FormData();
      formDataFile.append('image', selectedFile);
      
      try {
        console.log('Subiendo imagen...');
        const uploadResponse = await axios.post(`${API_URL}/upload`, formDataFile);
        console.log('Respuesta de subida de imagen:', uploadResponse.data);
        imageId = uploadResponse.data.imageId;
      } catch (imageError) {
        console.error('Error al subir imagen:', imageError);
        console.log('Respuesta de error imagen:', imageError.response?.data);
        setDetailedError({
          message: 'Error al subir imagen',
          details: imageError.response?.data || imageError.message,
          status: imageError.response?.status,
          statusText: imageError.response?.statusText
        });
        setError('Error al subir imagen. Intenta con otra imagen o más tarde.');
        setLoading(false);
        return;
      }
    }
    
    // Preparar los datos del producto asegurándose de que los tipos sean correctos
    const productData = {
      // Si estamos editando, incluimos el _id, si estamos creando, lo omitimos
      ...(formData._id ? { _id: formData._id } : {}),
      name: formData.name,
      category: formData.category,
      color: formData.color,
      salePrice: parseFloat(formData.salePrice) || 0,
      stock: parseInt(formData.stock, 10) || 0,
      lastPurchasePrice: parseFloat(formData.lastPurchasePrice) || 0,
      image: imageId
    };
    
    console.log('Enviando datos del producto:', productData);
    
    // Luego enviamos el producto completo usando la función onSave proporcionada
    await onSave(productData);
  } catch (error) {
    console.error('Error al guardar producto:', error);
    
    // Mostrar información detallada del error
    const errorResponse = error.response?.data;
    console.log('Respuesta de error:', errorResponse);
    
    setError('Error al guardar producto. Verifica todos los campos e intenta nuevamente.');
    setDetailedError({
      message: 'Error detallado al guardar producto',
      details: errorResponse || error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <Form onSubmit={handleSubmit}>
      <input type="hidden" name="_id" value={formData._id} />
      
      <FormGroup>
        <Label htmlFor="name">Nombre:</Label>
        <Input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="category">Categoría:</Label>
        <Input
          type="text"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        />
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="color">Color:</Label>
        <ColorSelector
          value={formData.color}
          onChange={(value) => setFormData({...formData, color: value})}
          availableColors={availableColors}
          placeholder="Selecciona o escribe un color"
        />
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="salePrice">Precio de Venta:</Label>
        <Input
          type="number"
          id="salePrice"
          name="salePrice"
          step="0.01"
          min="0"
          value={formData.salePrice}
          onChange={handleChange}
          required
        />
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="stock">Stock:</Label>
        <Input
          type="number"
          id="stock"
          name="stock"
          step="1"
          min="0"
          value={formData.stock}
          onChange={handleChange}
          required
        />
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="lastPurchasePrice">Precio de Compra:</Label>
        <Input
          type="number"
          id="lastPurchasePrice"
          name="lastPurchasePrice"
          step="0.01"
          min="0"
          value={formData.lastPurchasePrice}
          onChange={handleChange}
          required
        />
      </FormGroup>
      
      <FileInputWrapper>
        <FileInputLabel htmlFor="fileInput">Imagen:</FileInputLabel>
        <FileInputContainer>
          <CustomFileButton htmlFor="fileInput">
            Seleccionar archivo
          </CustomFileButton>
          <FileDisplay>
            {selectedFile ? selectedFile.name : 'Ningún archivo seleccionado'}
          </FileDisplay>
          <HiddenInput
            type="file"
            id="fileInput"
            accept="image/*"
            onChange={handleFileChange}
          />
        </FileInputContainer>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {detailedError && (
          <DetailedErrorContainer>
            <DetailedErrorTitle>{detailedError.message}</DetailedErrorTitle>
            <DetailedErrorContent>
              {JSON.stringify(detailedError.details, null, 2)}
              {detailedError.status && `\nStatus: ${detailedError.status} ${detailedError.statusText}`}
            </DetailedErrorContent>
          </DetailedErrorContainer>
        )}
        
        {previewUrl && (
          <ImagePreview>
            <img src={previewUrl} alt="Vista previa" />
          </ImagePreview>
        )}
        
        {formData.image && !selectedFile && !previewUrl && (
          <InfoMessage>
            Imagen actual guardada. Sube una nueva para reemplazarla.
          </InfoMessage>
        )}
      </FileInputWrapper>
      
      <ButtonContainer>
        <SaveButton type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </SaveButton>
        <CancelButton type="button" onClick={onCancel} disabled={loading}>
          Cancelar
        </CancelButton>
      </ButtonContainer>
    </Form>
  );
};

export default ProductForm;