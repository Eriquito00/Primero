# Primero

Creando el juego del Uno usando WebSockets con Typescript y Node.js

## Despliegue en Render

Este repo esta preparado para desplegarse como un unico servicio Node en Render.

### 1) Configuracion recomendada

- Usa `render.yaml` del proyecto (Blueprint) para crear el servicio automaticamente.
- Build command: `npm ci && npm run render:build`
- Start command: `npm run start`

### 2) Por que se instalan devDependencies

Para compilar TypeScript en build se necesitan herramientas de desarrollo (`typescript`, `@types/*`).
Por eso Render las instala en build. Despues se ejecuta `npm prune --omit=dev` en `render:build` para quitarlas del runtime final.

### 3) Variables importantes

- `PORT`: la inyecta Render automaticamente (el servidor ya la usa).
- `NODE_ENV=production`: configurada en `render.yaml`.

### 4) Frontend + backend juntos

- El backend sirve los estaticos desde `frontend/public`.
- El frontend se transpila en build con `npm run build:frontend`.
