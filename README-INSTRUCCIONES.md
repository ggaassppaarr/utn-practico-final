# Trabajo Práctico Final - Gestión de CSV

Este repo mantiene **tu frontend y estilos** y agrega un **backend** completo con:
- Persistencia SQLite + Prisma (migraciones)
- Carga CSV, inferencia de columnas
- CRUD de filas compatible con tus endpoints (`/data`, `/upload`, `/export`)
- Búsqueda/orden/paginación listas para extender (internamente ordenado por `createdAt`)
- Autenticación JWT + roles (endpoints /auth/* listos)
- **Merge** de archivos (`POST /merge`)

## Cómo ejecutar

### Backend
```
cd backend
cp .env.example .env
npm i
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### Frontend
```
cd frontend
npm i
npm run dev
```

> Tu frontend sigue usando `http://localhost:3001` para `/data`, `/upload`, `/export` y ahora funcionará contra la base de datos.

## Notas
- Si subís más de un CSV, `/data` y `/export` usan el **último** archivo cargado.
- Endpoints extra (para el TP): `/auth/register`, `/auth/login`, `/merge`.
