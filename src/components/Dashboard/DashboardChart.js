// src/components/Dashboard/DashboardChart.js
import styled from 'styled-components';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const ChartContainer = styled.div`
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  padding: 20px;
  box-shadow: ${props => props.theme.shadows.small};
  margin-bottom: ${props => props.marginBottom || '30px'};
  height: ${props => props.height || '300px'};
  position: relative;
`;

const ChartTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  margin-bottom: 15px;
`;

const ChartPlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 250px;
  background-color: #f5f5f5;
  border-radius: 6px;
  color: #888;
  font-style: italic;
`;

const LoadingIndicator = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  z-index: 10;
`;

const NoDataMessage = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  color: ${props => props.theme.colors.textLight};
  font-style: italic;
`;

// Paleta de colores para los gráficos
const COLORS = [
  '#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0', 
  '#673ab7', '#3f51b5', '#00bcd4', '#009688', '#ffeb3b'
];

/**
 * Componente para mostrar diferentes tipos de gráficos en el dashboard
 * 
 * @param {string} title - Título del gráfico
 * @param {array} data - Datos para el gráfico
 * @param {string} type - Tipo de gráfico: 'line', 'bar', 'pie'
 * @param {string} dataKey - Clave de los datos a mostrar en el eje Y (para line y bar)
 * @param {string} xAxisKey - Clave para el eje X (para line y bar)
 * @param {string} height - Altura del gráfico
 * @param {boolean} loading - Indica si está cargando
 * @param {boolean} showLegend - Indica si se debe mostrar la leyenda
 */
const DashboardChart = ({ 
  title, 
  data = [], 
  type = 'line', 
  dataKey = 'amount', 
  xAxisKey = 'date',
  height = '300px',
  loading = false,
  showLegend = true,
  marginBottom = '30px',
  pieDataNameKey = 'name',
  pieDataValueKey = 'value',
  lineColor = '#4caf50'
}) => {
  
  // Formatear fecha para el tooltip
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit',
        month: 'short'
      });
    } catch (e) {
      return dateStr;
    }
  };
  
  // Formatear moneda
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '';
    
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Renderizar el tipo de gráfico correcto
  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <NoDataMessage>
          No hay datos para mostrar
        </NoDataMessage>
      );
    }
    
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey={xAxisKey} 
                tickFormatter={formatDate}
                minTickGap={15}
              />
              <YAxis tickFormatter={(value) => new Intl.NumberFormat('es-ES', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(value)} />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Monto']}
                labelFormatter={formatDate}
              />
              {showLegend && <Legend />}
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={lineColor}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
        case 'bar':
          // Agrupar datos por fecha
          const groupedData = data.reduce((acc, item) => {
            const existing = acc.find(d => d[xAxisKey] === item[xAxisKey]);
            if (existing) {
              existing[item.tipo] = item[dataKey];
            } else {
              acc.push({
                [xAxisKey]: item[xAxisKey],
                [item.tipo]: item[dataKey],
              });
            }
            return acc;
          }, []);
        
          return (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={groupedData}
                margin={{ top: 5, right: 30, left: 20, bottom: 15 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey={xAxisKey} 
                  tickFormatter={formatDate}
                  minTickGap={15}
                />
                <YAxis tickFormatter={(value) => new Intl.NumberFormat('es-ES', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(value)} />
                <Tooltip 
                  formatter={(value, name) => [formatCurrency(value), name]}
                  labelFormatter={formatDate}
                />
                {showLegend && <Legend />}
                <Bar dataKey="Ventas" fill="#4caf50" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Compras" fill="#2196f3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          );  
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, bottom: 15 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={pieDataValueKey}
                nameKey={pieDataNameKey}
                margin={{ top: 5, right: 30, left: 20, bottom: 15 }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              {showLegend && <Legend />}
              <Tooltip formatter={(value) => [value, 'Cantidad']} />
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return (
          <ChartPlaceholder>
            Tipo de gráfico no soportado
          </ChartPlaceholder>
        );
    }
  };
  
  return (
    <ChartContainer height={height} marginBottom={marginBottom}>
      <ChartTitle>{title}</ChartTitle>
      
      {loading && (
        <LoadingIndicator>
          Cargando...
        </LoadingIndicator>
      )}
      
      {renderChart()}
    </ChartContainer>
  );
};

export default DashboardChart;