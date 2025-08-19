# 📊 Web App CSV Manager

Aplicación web fullstack para **cargar, visualizar, editar y persistir datos CSV** con autenticación de usuarios y manejo de proyectos.

## 🚀 Tecnologías

### Backend
- **Node.js + Express**
- **SQLite** con **Prisma ORM**
- **Multer** para manejo de uploads
- **CSV-Parse / CSV-Stringify** para procesar archivos CSV
- **Express-Rate-Limit** para limitar requests
- Autenticación básica con rutas de login (`/auth`)

### Frontend
- **React 18 + Vite**
- **TailwindCSS** para estilos
- **Lucide Icons** para íconos
- Fetch API para comunicación con el backend

---

## ⚙️ Funcionalidades Implementadas

### Backend
- API REST con Express (`/backend/index.js`).
- Endpoints principales:
  - `POST /auth/login` → Autenticación de usuario.
  - `GET /data` → Devuelve los registros cargados desde CSV/DB.
  - `POST /data` → Inserta un nuevo registro.
  - `POST /upload` → Permite subir un archivo CSV y guardarlo.
- Persistencia con **SQLite + Prisma**.
- Esquema de base de datos:
  - **User**: email, password (hash), role, timestamps.
  - **Project**: nombre, relación con `User`.
- Middleware de seguridad:
  - CORS habilitado.
  - Rate limiting para proteger la API.

### Frontend
- Interfaz en React con Vite.
- Carga de archivos CSV y preview de los datos.
- Tabla editable de registros.
- Formulario para agregar nuevos registros manualmente.
- Estado visual de carga (`isUploading`, `isLoading`).
- Conexión con el backend (`http://localhost:3001`).
- Estilos modernos con Tailwind + Lucide.

---

## 📂 Estructura del Proyecto

```
base-proyecto-999199990/
│── backend/
│   ├── index.js            # Servidor Express principal
│   ├── routes/auth.js      # Rutas de autenticación
│   ├── prisma/schema.prisma # Definición de la DB con Prisma
│   ├── prisma/dev.db       # Base SQLite
│   └── export.csv          # Ejemplo de CSV exportado
│
│── frontend/
│   ├── index.html
│   ├── src/                # Componentes React
│   ├── tailwind.config.js  # Configuración Tailwind
│   └── vite.config.js      # Configuración Vite
│
└── README.md (este archivo)
```

---

## ▶️ Instalación y Uso

### 1. Clonar el repositorio
```bash
git clone <url-del-repo>
cd base-proyecto-999199990
```

### 2. Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```
- Corre en `http://localhost:3001`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
- Corre en `http://localhost:5173`.

---

## 🔑 Variables de Entorno

En `/backend/.env`:
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="supersecretkey"
```

---

## ✅ Próximas mejoras sugeridas
- Autenticación con JWT + roles más detallados.
- Soporte para exportar datos en distintos formatos (JSON, Excel).
- Test unitarios e2e.
- Deploy en Vercel (frontend) + Railway/Render (backend).

---

👨‍💻 Proyecto desarrollado como **app de gestión de CSV con persistencia, autenticación y edición desde UI.**
