# Help Desk

Sistema de gestión de tickets de soporte hecho con **Angular 22** y **Angular Material**.

## Alcance de esta entrega

Esta entrega es un **avance funcional** que se ejecuta completo **en local**, sin depender de la API del curso:

- **Datos:** tickets y usuarios se leen y guardan en una API local con [json-server](https://github.com/typicode/json-server), usando el archivo `db.json`.
- **Login simulado:** se valida contra usuarios ficticios definidos en `src/app/config/usuarios-demo.ts`. Se genera un token de demostración y se mantiene la sesión al recargar la página (F5).
- **Seguridad en el frontend** (la misma estructura que se usa con la API real):
  - Interceptor que agrega `Authorization: Bearer <token>` a las peticiones (`src/app/interceptor/token-interceptor.ts`).
  - Guards de sesión y de rol (`src/app/interceptor/guards/acceso-guard.ts`).
  - Página **Sin acceso** para los roles sin permiso.
  - El menú muestra solo las secciones permitidas para el rol.
- **Lazy loading:** cada página se descarga solo cuando se visita.

El código para conectarse a la **API real del curso** (Django) ya está escrito y compila. Para usarlo se cambia un interruptor; ver [Cambiar a la API del curso](#cambiar-a-la-api-del-curso).

## Cómo ejecutarlo

Requisitos: Node.js 20 o superior y npm.

1. Instalar dependencias (solo la primera vez):

   ```bash
   npm install
   ```

2. Levantar la API local en `http://localhost:3000` (dejar esta terminal abierta):

   ```bash
   npm run api
   ```

3. En otra terminal, levantar la aplicación:

   ```bash
   npm start
   ```

4. Abrir `http://localhost:4200/` e iniciar sesión con alguno de los usuarios de prueba.

## Usuarios de prueba (modo local)

| Usuario   | Contraseña   | Rol           | Secciones visibles                                         |
|-----------|--------------|---------------|------------------------------------------------------------|
| `admin`   | `admin123`   | Administrador | Dashboard, Tickets, Kanban, Reportes, Usuarios, Acerca de  |
| `soporte` | `soporte123` | Soporte       | Dashboard, Tickets, Kanban, Acerca de                      |
| `usuario` | `usuario123` | Usuario       | Dashboard, Tickets, Acerca de                              |

En la pantalla de login, los botones de "Modo local" rellenan las credenciales automáticamente.

> **Advertencia:** estas contraseñas están en texto plano porque son datos de demostración. En un sistema real la validación ocurre en el servidor y las contraseñas nunca se guardan en el frontend.

## Permisos por ruta

| Ruta                                   | Acceso                     |
|----------------------------------------|----------------------------|
| `/login`                               | Solo sin sesión iniciada   |
| `/dashboard`, `/tickets/**`, `/acerca-de` | Cualquier sesión iniciada |
| `/kanban`                              | Soporte y Administrador    |
| `/reportes`, `/usuarios`               | Administrador              |
| Cualquier otra ruta                    | Página 404                 |

## Cambiar a la API del curso

En `src/app/config/api.ts`:

```ts
export const USAR_API_REMOTA = true; // false = modo local
```

Con `true`:

- Los servicios apuntan a la API del curso en lugar de `localhost:3000`.
- El login llama a `POST {API_BASE_URL}/auth/token` con `{ username, password }` y usa el `token` y el `rol` que responde la API (ver `src/app/services/sesion.ts`, método `iniciarSesionRemota`).
- Se oculta el recuadro de usuarios de prueba y el indicador "Modo local".

Para que funcione, el túnel de la API del curso tiene que estar activo y se necesitan credenciales válidas entregadas por el profesor.

## Estructura principal

```text
src/app/
├── config/
│   ├── api.ts                 # Interruptor local/remoto y URL base de la API
│   └── usuarios-demo.ts       # Usuarios ficticios del login simulado
├── interceptor/
│   ├── token-interceptor.ts   # Agrega el token Bearer
│   └── guards/acceso-guard.ts # sesionGuard, requiereRoles(...), invitadoGuard
├── models/                    # Ticket, Usuario
├── pages/                     # login, dashboard, tickets, kanban, reportes, usuarios, ...
├── services/
│   ├── sesion.ts              # Login (local o remoto), sesión y roles
│   ├── tickets.ts             # CRUD de tickets
│   └── usuario.ts             # CRUD de usuarios
└── shared/                    # Componentes reutilizables (diálogos, estado, prioridad, ...)
```

## Otros comandos

| Comando         | Descripción                              |
|-----------------|------------------------------------------|
| `npm run build` | Compila para producción en `dist/`       |
| `npm test`      | Ejecuta las pruebas unitarias (Vitest)   |
