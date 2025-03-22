// src/utils/colorUtils.js

/**
 * Función para convertir nombres de colores a códigos HEX
 * @param {string} colorName - Nombre del color en español
 * @returns {string} Código hexadecimal del color
 */
export const getColorCode = (colorName) => {
  if (!colorName) return '#cccccc';
  
  const colorMap = {
    // Colores básicos
    'rojo': '#ff0000',
    'verde': '#00ff00',
    'azul': '#0000ff',
    'amarillo': '#ffff00',
    'negro': '#000000',
    'blanco': '#ffffff',
    'gris': '#808080',
    'naranja': '#ffa500',
    'morado': '#800080',
    'rosa': '#ffc0cb',
    'marrón': '#a52a2a',
    'celeste': '#87ceeb',
    'dorado': '#ffd700',
    'plateado': '#c0c0c0',
    'cromado': '#e8e8e8',
    
    // Tonos de rojo
    'rojo oscuro': '#8b0000',
    'rojo carmesí': '#dc143c',
    'rojo tomate': '#ff6347',
    'rojo coral': '#ff7f50',
    'rojo ladrillo': '#b22222',
    'rojo indian': '#cd5c5c',
    'rojo salmon': '#fa8072',
    'rojo cereza': '#de3163',
    'rojo vino': '#722f37',
    'rojo borgoña': '#800020',
    'rojo escarlata': '#ff2400',
    'rojo bermellón': '#e34234',
    'rojo óxido': '#a55d35',
    'rojo bordo': '#800020',

    // Tonos de azul
    'azul marino': '#000080',
    'azul claro': '#add8e6',
    'azul cielo': '#87ceeb',
    'azul acero': '#4682b4',
    'azul real': '#4169e1',
    'azul turquesa': '#40e0d0',
    'azul agua': '#00ffff',
    'azul medianoche': '#191970',
    'azul índigo': '#4b0082',
    'azul cobalto': '#0047ab',
    'azul cian': '#00ffff',
    'azul eléctrico': '#7df9ff',
    'azul petróleo': '#086375',
    'azul turquí': '#00008b',
    'azul zafiro': '#0f52ba',
    'azul navy': '#000080',
    'azul aqua': '#00ffff',
    'azul dodger': '#1e90ff',
    'azul polvo': '#b0e0e6',
    'azul pizarra': '#6a5acd',

    // Tonos de verde
    'verde claro': '#90ee90',
    'verde oscuro': '#006400',
    'verde oliva': '#808000',
    'verde lima': '#32cd32',
    'verde bosque': '#228b22',
    'verde menta': '#98ff98',
    'verde esmeralda': '#50c878',
    'verde teal': '#008080',
    'verde jade': '#00a86b',
    'verde musgo': '#8a9a5b',
    'verde pino': '#01796f',
    'verde agua': '#66cdaa',
    'verde primavera': '#00ff7f',
    'verde hierba': '#7cfc00',
    'verde cazador': '#355e3b',
    'verde militar': '#4b5320',
    'verde selva': '#29ab87',
    'verde salvia': '#9fa91f',
    'verde cactus': '#567d46',
    
    // Tonos de amarillo
    'amarillo claro': '#ffffe0',
    'amarillo oro': '#ffd700',
    'amarillo limón': '#fff44f',
    'amarillo mostaza': '#ffdb58',
    'amarillo ámbar': '#ffbf00',
    'amarillo canario': '#ffff99',
    'amarillo crema': '#fffdd0',
    'amarillo ocre': '#cc7722',
    'amarillo mantequilla': '#f3e5ab',
    'amarillo curry': '#c49102',
    'amarillo calabaza': '#ffc125',
    'amarillo miel': '#f0e68c',
    
    // Tonos de naranja
    'naranja oscuro': '#ff8c00',
    'naranja claro': '#ffa07a',
    'naranja mandarina': '#ff9966',
    'naranja melocotón': '#ffcc99',
    'naranja coral': '#ff7f50',
    'naranja zanahoria': '#ed9121',
    'naranja calabaza': '#ff7518',
    'naranja fuego': '#ff4500',
    'naranja ambar': '#ffbf00',
    'naranja caqui': '#ff6700',
    
    // Tonos de rosa
    'rosa pálido': '#fadadd',
    'rosa fuerte': '#ff69b4',
    'rosa chicle': '#ff66cc',
    'rosa fucsia': '#ff00ff',
    'rosa coral': '#f88379',
    'rosa salmón': '#ff91a4',
    'rosa lavanda': '#fba0e3',
    'rosa magenta': '#ff0090',
    'rosa frambuesa': '#e30b5d',
    'rosa orquídea': '#da70d6',
    'rosa pastel': '#ffc0cb',
    'rosa bebé': '#f4c2c2',
    'rosa hot': '#ff69b4',
    'rosa palo': '#fadadd',
    
    // Tonos de morado/púrpura
    'morado claro': '#9370db',
    'morado oscuro': '#4b0082',
    'morado lavanda': '#e6e6fa',
    'morado lila': '#c8a2c8',
    'morado violeta': '#8a2be2',
    'morado berenjena': '#614051',
    'morado ciruela': '#673147',
    'morado uva': '#6f2da8',
    'morado malva': '#b57edc',
    'morado amatista': '#9966cc',
    'púrpura': '#800080',
    'púrpura real': '#7851a9',
    'violeta': '#8a2be2',
    'lila': '#c8a2c8',
    
    // Tonos de marrón
    'marrón claro': '#d2b48c',
    'marrón oscuro': '#5c4033',
    'marrón chocolate': '#7b3f00',
    'marrón canela': '#d2691e',
    'marrón café': '#6f4e37',
    'marrón tostado': '#cd853f',
    'marrón siena': '#a0522d',
    'marrón caoba': '#a52a2a',
    'marrón roble': '#8b4513',
    'marrón caqui': '#c3b091',
    'marrón terracota': '#e2725b',
    'marrón nogal': '#654321',
    'marrón caramelo': '#af6e4d',
    'marrón avellana': '#a67b5b',
    'marrón beige': '#f5f5dc',
    'marrón castaño': '#cd5c5c',
    'marrón tierra': '#9b7653',
    'marrón arena': '#deb887',
    'marrón cobre': '#b87333',
    'marrón ocre': '#cc7722',
    'marrón coral': '#ff7f50',
    
    // Tonos de gris
    'gris claro': '#d3d3d3',
    'gris oscuro': '#a9a9a9',
    'gris pizarra': '#708090',
    'gris plata': '#c0c0c0',
    'gris humo': '#f5f5f5',
    'gris acero': '#71797e',
    'gris carbón': '#2c3539',
    'gris cemento': '#8d918d',
    'gris perla': '#eae0c8',
    'gris topo': '#817a72',
    'gris rata': '#8f8f8f',
    'gris piedra': '#928e85',
    'gris ceniza': '#b2beb5',
    'gris plomo': '#7f7f7f',
    
    // Colores metálicos
    'cobre': '#b87333',
    'oro': '#ffd700',
    'oro viejo': '#cfb53b',
    'plata': '#c0c0c0',
    'platino': '#e5e4e2',
    'acero': '#71797e',
    'bronce': '#cd7f32',
    'titanio': '#878681',
    'aluminio': '#848789',
    'metalizado': '#a9a9a9',
    
    // Colores diversos
    'turquesa': '#40e0d0',
    'crema': '#fffdd0',
    'caqui': '#c3b091',
    'burdeos': '#800020',
    'coral': '#ff7f50',
    'fucsia': '#ff00ff',
    'lavanda': '#e6e6fa',
    'aguamarina': '#7fffd4',
    'terracota': '#e2725b',
    'beige': '#f5f5dc',
    'ocre': '#cc7722',
    'magenta': '#ff00ff',
    'púrpura': '#800080',
    'cian': '#00ffff',
    'esmeralda': '#50c878',
    'chocolate': '#7b3f00',
    'miel': '#f0e68c',
    'marfil': '#fffff0',
    'menta': '#98ff98',
    'melocotón': '#ffcc99',
    'frambuesa': '#e30b5d',
    'vainilla': '#f3e5ab',
    'cereza': '#de3163',
    'caramelo': '#af6e4d',
    'castaño': '#cd5c5c',
    'jade': '#00a86b',
    'zafiro': '#0f52ba',
    'rubí': '#e0115f',
    'ámbar': '#ffbf00',
    'perla': '#f0eae0',
    'nácar': '#fdeef4',
    'hueso': '#e3dac9',
    'vino': '#722f37',
    'bermellón': '#e34234',
    'albaricoque': '#fbceb1',
    'pistache': '#93c572',
    'salmón': '#fa8072',
    'ciruela': '#8e4585',
    'ébano': '#555d50',
    'topo': '#817a72',
    'aceituna': '#3b3c36',
    'petróleo': '#086375',
    'armada': '#000080',
    'carmín': '#960018',
    'escarlata': '#ff2400',
    'beis': '#f5f5dc',
    'canela': '#d2691e',
    'cian': '#00ffff',
    'arena': '#deb887',
    'carbón': '#2c3539',
    'cuero': '#8b4513',
    'lima': '#32cd32',
    'visón': '#906a4e',
    'champán': '#f7e7ce',
    'malva': '#b57edc',
    'cerúleo': '#2a52be',
    'borgoña': '#800020',
    'bermellón': '#e34234',
    'amatista': '#9966cc',
    
    // Colores neutros
    'transparente': '#00000000',
    'natural': '#f5deb3',
    'neutro': '#efefef'
  };
  
  return colorMap[colorName.toLowerCase()] || '#cccccc';
};

/**
 * Función para obtener el nombre de color CSS estándar a partir de un nombre en español
 * @param {string} colorName - Nombre del color en español
 * @returns {string} Nombre del color en inglés para CSS
 */
export const getColorName = (colorName) => {
  if (!colorName) return 'gray';
  
  const nameMap = {
    // Colores básicos
    'rojo': 'red',
    'verde': 'green',
    'azul': 'blue',
    'amarillo': 'yellow',
    'negro': 'black',
    'blanco': 'white',
    'gris': 'gray',
    'naranja': 'orange',
    'morado': 'purple',
    'rosa': 'pink',
    'marrón': 'brown',
    'celeste': 'skyblue',
    'dorado': 'gold',
    'plateado': 'silver',
    'cromado': 'lightgray',
    
    // Tonos de rojo
    'rojo oscuro': 'darkred',
    'rojo carmesí': 'crimson',
    'rojo tomate': 'tomato',
    'rojo coral': 'coral',
    'rojo ladrillo': 'firebrick',
    'rojo indian': 'indianred',
    'rojo salmon': 'salmon',
    'rojo cereza': 'cherry',
    
    // Tonos de azul
    'azul marino': 'navy',
    'azul claro': 'lightblue',
    'azul cielo': 'skyblue',
    'azul acero': 'steelblue',
    'azul real': 'royalblue',
    'azul turquesa': 'turquoise',
    'azul agua': 'aqua',
    'azul medianoche': 'midnightblue',
    'azul índigo': 'indigo',
    
    // Tonos de verde
    'verde claro': 'lightgreen',
    'verde oscuro': 'darkgreen',
    'verde oliva': 'olive',
    'verde lima': 'limegreen',
    'verde bosque': 'forestgreen',
    'verde menta': 'mintcream',
    'verde esmeralda': 'emerald',
    'verde teal': 'teal',
    
    // Tonos de amarillo
    'amarillo claro': 'lightyellow',
    'amarillo oro': 'gold',
    'amarillo limón': 'lemon',
    'amarillo mostaza': 'mustard',
    
    // Tonos de naranja
    'naranja oscuro': 'darkorange',
    'naranja claro': 'lightsalmon',
    
    // Tonos de rosa
    'rosa pálido': 'lightpink',
    'rosa fuerte': 'hotpink',
    'rosa fucsia': 'fuchsia',
    
    // Tonos de morado/púrpura
    'morado claro': 'mediumpurple',
    'morado oscuro': 'indigo',
    'morado lavanda': 'lavender',
    'morado lila': 'lilac',
    'morado violeta': 'blueviolet',
    'púrpura': 'purple',
    'violeta': 'violet',
    'lila': 'lilac',
    
    // Tonos de marrón
    'marrón claro': 'tan',
    'marrón oscuro': 'saddlebrown',
    'marrón chocolate': 'chocolate',
    'marrón canela': 'peru',
    'marrón café': 'coffee',
    'marrón tostado': 'sandybrown',
    'marrón siena': 'sienna',
    
    // Tonos de gris
    'gris claro': 'lightgray',
    'gris oscuro': 'darkgray',
    'gris pizarra': 'slategray',
    'gris plata': 'silver',
    
    // Colores diversos
    'turquesa': 'turquoise',
    'crema': 'cream',
    'beige': 'beige',
    'magenta': 'magenta',
    'cian': 'cyan',
    'aguamarina': 'aquamarine',
    'lavanda': 'lavender',
    'coral': 'coral',
    'marfil': 'ivory',
    'menta': 'mintcream',
    'melocotón': 'peachpuff',
    'caramelo': 'caramel',
    'jade': 'jade',
    'perla': 'pearl',
    'hueso': 'bone',
    'teal': 'teal',
    'transparente': 'transparent'
  };
  
  return nameMap[colorName.toLowerCase()] || 'gray';
};

/**
 * Determina si un color es oscuro basado en su código hexadecimal
 * @param {string} hexColor - Código de color en formato hexadecimal
 * @returns {boolean} true si el color es oscuro, false si es claro
 */
export const isDarkColor = (hexColor) => {
  // Si es undefined o no es un string, considerarlo como claro
  if (!hexColor || typeof hexColor !== 'string') {
    return false;
  }

  // Eliminar el símbolo # si está presente
  const hex = hexColor.replace('#', '');
  
  // Verificar si es un código hexadecimal válido
  if (!/^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
    return false;  // Por defecto, considerarlo como claro si no es válido
  }
  
  let r, g, b;
  
  // Manejar el caso de los códigos de 3 dígitos
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else {
    // Código de 6 dígitos
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  
  // Calcular la luminosidad (fórmula estándar)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Si la luminosidad es menor a 0.5, es un color oscuro
  return luminance < 0.5;
};

export default {
  getColorCode,
  getColorName,
  isDarkColor
};