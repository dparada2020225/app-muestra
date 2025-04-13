# Sistema Multi-Tenant de Inventario - Frontend

Frontend para el sistema de inventario multi-tenant construido con React.

## Características

- Soporte multi-tenant con aislamiento de datos
- Sistema de autenticación y autorización basado en roles
- Personalización por tenant (temas, logos, colores)
- Dashboard específico por tenant
- Gestión de productos, ventas y compras
- Panel de administración para superadmins

## Requisitos

- Node.js >= 14.0.0
- npm >= 6.0.0

## Instalación

1. Clonar el repositorio:
cd inventario-app

2. Instalar dependencias:
npm install

3. Configurar variables de entorno:
- Crear un archivo `.env` con el siguiente contenido:
REACT_APP_API_URL='http://localhost:5000'

## Desarrollo

Para ejecutar en modo desarrollo:
npm start

La aplicación será accesible en `http://demo.localhost:3000`.

## Acceso a Tenants

- En desarrollo, puedes acceder a diferentes tenants usando subdominios de localhost:
  - Tenant demo: `http://demo.localhost:3000`
  - Puedes simular otros tenants usando: `http://[nombre].localhost:3000`

## Estructura del Proyecto

- `src/components/` - Componentes reutilizables
- `src/context/` - Contextos de React (AuthContext, TenantContext, etc.)
- `src/pages/` - Páginas de la aplicación
- `src/services/` - Servicios para comunicación con la API
- `src/utils/` - Utilidades y funciones auxiliares

## Usuarios de Prueba

- **Superadmin**:
  - Usuario: superadmin
  - Contraseña: superadmin123

- **Admin de Tenant (Demo)**:
  - Usuario: admin
  - Contraseña: admin123

- **Manager de Tenant (Demo)**:
  - Usuario: manager
  - Contraseña: manager123

- **Usuario de Tenant (Demo)**:
  - Usuario: user
  - Contraseña: user123