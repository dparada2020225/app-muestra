// src/utils/csvUtils.js

// Función para analizar CSV y convertirlo a array de objetos
export const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length <= 1) {
      return [];
    }
    
    const headers = lines[0].split(';').map(header => header.trim());
    
    // Índices de columnas importantes
    const idIndex = headers.indexOf('id');
    const nameIndex = headers.indexOf('nombre');
    const categoryIndex = headers.indexOf('categoria');
    const colorIndex = headers.indexOf('color');
    const priceIndex = headers.indexOf('precio');
    const imageIndex = headers.indexOf('imagen');
    
    // Validar que existan las columnas necesarias
    if (nameIndex === -1 || categoryIndex === -1) {
      return [];
    }
    
    const products = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      if (values.length !== headers.length) {
        continue;
      }
      
      const product = {
        id: idIndex !== -1 ? values[idIndex] : i.toString(),
        name: values[nameIndex],
        category: categoryIndex !== -1 ? values[categoryIndex] : '',
        color: colorIndex !== -1 ? values[colorIndex] : '',
        price: priceIndex !== -1 ? parseFloat(values[priceIndex]) : 0,
        image: imageIndex !== -1 ? values[imageIndex] : ''
      };
      
      products.push(product);
    }
    
    return products;
  };
  
  // Función para analizar líneas CSV correctamente (maneja comillas)
  const parseCSVLine = (line) => {
    const result = [];
    let currentValue = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
        insideQuotes = !insideQuotes;
      } else if (char === ';' && !insideQuotes) {
        result.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Agregar el último valor
    result.push(currentValue.trim());
    
    return result;
  };
  
  // Función para generar contenido CSV desde array de productos
  export const generateCSV = (products) => {
    const headers = ['id', 'nombre', 'categoria', 'color', 'precio', 'imagen'];
    let csv = headers.join(';') + '\n';
    
    products.forEach(product => {
      const row = [
        product.id,
        product.name,
        product.category,
        product.color,
        product.price,
        product.image
      ];
      
      csv += row.join(';') + '\n';
    });
    
    return csv;
  };