# Guía de ejecución, pruebas y entrega

Esta guía tiene tres partes:

1. **Método general**: pasos que sirven para ejecutar, probar y entregar casi cualquier proyecto web.
2. **Este proyecto**: los mismos pasos aplicados al Help Desk, con comandos concretos.
3. **Plan de pruebas de usuario**: casos listos para marcar mientras se prueba la aplicación.

---

## Parte 1. Método general para cualquier proyecto

### Paso 1. Obtener la versión correcta del código

- Clonar el repositorio la primera vez, o actualizarlo si ya existe (`git pull`).
- Confirmar la rama: la entrega se hace desde la rama principal (`main` o `master`) después de integrar los pull requests.
- Revisar que no queden cambios sin guardar (`git status`).

### Paso 2. Leer el README y revisar los requisitos

- Versión del lenguaje o del entorno (en Angular, la versión de Node.js).
- Servicios externos: base de datos, API, variables de entorno.
- Comandos disponibles: en proyectos JavaScript están en `package.json`, sección `scripts`.

### Paso 3. Instalar dependencias

- En proyectos con `package-lock.json`, `npm install` (o `npm ci` para instalar exactamente las versiones del lock).
- Si la instalación falla, revisar primero la versión del entorno (Paso 2).

### Paso 4. Levantar lo que el proyecto necesita, en orden

1. Primero los servicios de los que depende: base de datos o API.
2. Después la aplicación.
3. Cada servicio corre en su propia terminal, que debe quedar abierta.

### Paso 5. Verificar que compila

Un proyecto que no compila no se puede entregar. Ejecutar el build de producción (`npm run build`) y confirmar que termina sin errores. Las advertencias se anotan, pero no bloquean.

### Paso 6. Ejecutar las pruebas automáticas

- Las pruebas unitarias revisan piezas aisladas: un servicio, un componente o una función.
- Todas deben pasar. Si una falla, se corrige el código o la prueba; nunca se borra ni se salta una prueba para que quede en verde.

### Paso 7. Hacer pruebas de usuario (manuales)

Probar la aplicación como lo haría una persona real. Para cada funcionalidad, cubrir estos tipos de caso:

| Tipo de caso | Qué se revisa | Ejemplo |
|---|---|---|
| Camino feliz | La tarea principal funciona con datos correctos | Crear un ticket y verlo en la lista |
| Validaciones | Los datos incorrectos se rechazan con un mensaje claro | Guardar un formulario vacío |
| Permisos | Cada rol ve y hace solo lo que le corresponde | Un usuario sin permiso no entra a una sección |
| Errores | La app avisa cuando algo falla, sin quedar en blanco | API apagada, o un id que no existe |
| Persistencia | Los datos se guardan de verdad | Recargar la página y ver que el cambio sigue ahí |
| Navegación | Los enlaces y botones llevan donde deben | Volver, Cancelar, una ruta inexistente |
| Tamaños de pantalla | Se puede usar en un celular | Reducir la ventana o usar el modo dispositivo del navegador |

Cómo registrar cada caso:

- **ID** del caso (por ejemplo, `LOG-01`).
- **Pasos** concretos.
- **Resultado esperado**.
- **Resultado obtenido**: ✅ o ❌, con una nota si falla.
- Si algo falla: capturar la pantalla, revisar la consola del navegador (F12, pestaña *Console*), corregir y volver a probar el caso.

### Paso 8. Preparar la entrega

- Integrar los cambios en la rama principal y confirmar que el repositorio remoto está actualizado.
- El README debe explicar cómo ejecutar el proyecto y qué incluye la entrega.
- Repetir los pasos 3 a 7 desde una copia limpia, para confirmar que otra persona puede ejecutarlo.
- Si la entrega es un archivo comprimido, **no incluir** `node_modules`, `dist` ni `.angular`: se regeneran con `npm install` y ocupan cientos de MB.
- Adjuntar evidencia: capturas o el plan de pruebas con sus resultados.

---

## Parte 2. Ejecutar este proyecto (Help Desk)

### Requisitos

| Herramienta | Versión | Cómo comprobarla |
|---|---|---|
| Node.js | 22.22.3 o superior (o 24.15 o superior) | `node -v` |
| npm | viene con Node.js | `npm -v` |
| Git | cualquier versión reciente | `git --version` |

Si tu versión de Node.js es más antigua, instala la versión LTS desde nodejs.org.

### 1. Obtener el código

La primera vez:

```bash
git clone https://github.com/MatiCaro1/help-desk.git
```

```bash
cd help-desk
```

Si ya lo tienes clonado, actualízalo:

```bash
git checkout master
```

```bash
git pull origin master
```

### 2. Instalar dependencias (solo la primera vez o si cambia `package.json`)

```bash
npm install
```

### 3. Levantar la API local (terminal 1)

```bash
npm run api
```

Debe mostrar que json-server escucha en `http://localhost:3000`. Deja esta terminal abierta. Para comprobar que funciona, abre `http://localhost:3000/tickets` en el navegador: debe mostrar la lista de tickets en JSON.

### 4. Levantar la aplicación (terminal 2)

```bash
npm start
```

Cuando aparezca `Local: http://localhost:4200/`, abre esa dirección en el navegador.

### 5. Iniciar sesión

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | Administrador |
| `soporte` | `soporte123` | Soporte |
| `usuario` | `usuario123` | Usuario |

En el modo local, la pantalla de login tiene botones que rellenan estas credenciales.

### 6. Compilar para producción

```bash
npm run build
```

Debe terminar con `Application bundle generation complete`. La advertencia de tamaño (`bundle initial exceeded maximum budget`) es conocida y no impide compilar.

### 7. Ejecutar las pruebas automáticas

```bash
npm test -- --watch=false
```

Resultado esperado: **24 archivos y 49 pruebas, todos en verde**. Sin `--watch=false`, las pruebas quedan esperando cambios; se sale con `q` o `Ctrl + C`.

Qué cubren las pruebas:

| Área | Qué se prueba |
|---|---|
| Sesión | Login correcto, contraseña incorrecta (401), sesión guardada en `sessionStorage`, cierre de sesión, roles |
| Guards | Sin sesión va al login, un rol sin permiso va a `/sin-acceso`, el login redirige a quien ya tiene sesión |
| Interceptor | Agrega `Bearer <token>` solo a las peticiones hacia la API |
| TicketService | Caché (una sola petición, se renueva al eliminar, no guarda errores) y filtros traducidos a `_where` |
| Formularios | Validaciones de ticket y de usuario |
| Componentes | Todos se crean correctamente; los chips de estado, prioridad y rol muestran su valor |
| App | Sin sesión no hay menú; con sesión, el menú depende del rol |

### Problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| "No se pudo conectar con la API" al iniciar sesión o "Ocurrió un error al cargar" | json-server no está corriendo | Ejecutar `npm run api` en otra terminal |
| `Port 4200 is already in use` | Ya hay otra instancia de la app abierta | Cerrarla, o ejecutar `npm start -- --port 4300` |
| `EADDRINUSE :3000` | json-server ya está corriendo en otra terminal | Usar esa terminal, o cerrarla y volver a ejecutar |
| `npm install` falla o advierte por `engines` | Versión de Node.js antigua | Instalar Node.js 22 LTS o superior |
| La app muestra datos viejos | Caché del navegador o datos cambiados a mano en `db.json` | Pulsar "Actualizar datos" en el Dashboard o recargar con `Ctrl + F5` |
| Quiero volver a los datos originales | Las pruebas modificaron `db.json` | `git checkout db.json` (descarta los cambios hechos a los datos) |

---

## Parte 3. Plan de pruebas de usuario

Marca cada caso con ✅ o ❌ mientras pruebas. Para partir con los datos originales, ejecuta `git checkout db.json` con la API detenida.

### Login y sesión

| ID | Pasos | Resultado esperado | ✅/❌ |
|---|---|---|---|
| LOG-01 | Abrir `http://localhost:4200/tickets` sin haber iniciado sesión | Redirige al login | |
| LOG-02 | Ingresar `admin` con la contraseña `mala` | Mensaje "Revisa el usuario y la contraseña." | |
| LOG-03 | Ingresar `admin` / `admin123` | Entra al Dashboard; la barra muestra "admin · Administrador" | |
| LOG-04 | Con la sesión iniciada, recargar la página (F5) | La sesión se mantiene | |
| LOG-05 | Con la sesión iniciada, abrir `/login` | Redirige al Dashboard | |
| LOG-06 | Pulsar "Cerrar sesión" | Vuelve al login y el menú desaparece | |
| LOG-07 | Con la API detenida, intentar iniciar sesión | Entra igual: el login es local y no depende de la API | |

### Permisos por rol

| ID | Pasos | Resultado esperado | ✅/❌ |
|---|---|---|---|
| ROL-01 | Entrar como `usuario` | El menú muestra Dashboard, Tickets y Acerca de | |
| ROL-02 | Como `usuario`, abrir `/kanban` | Página "Sin acceso" | |
| ROL-03 | Entrar como `soporte` | El menú agrega Kanban; no muestra Reportes ni Usuarios | |
| ROL-04 | Como `soporte`, abrir `/usuarios/nuevo` | Página "Sin acceso" | |
| ROL-05 | Entrar como `admin` | El menú muestra todas las secciones | |
| ROL-06 | Abrir una ruta que no existe, por ejemplo `/no-existe` | Página 404 | |

### Dashboard

| ID | Pasos | Resultado esperado | ✅/❌ |
|---|---|---|---|
| DAS-01 | Entrar al Dashboard | Tarjetas con total, abiertos, en proceso y cerrados; los números suman el total | |
| DAS-02 | Filtrar por prioridad "Alta" | Todas las tarjetas y gráficos se recalculan; "Ver todas" se activa | |
| DAS-03 | Pasar el mouse sobre una barra del gráfico | Muestra la categoría, la cantidad y el porcentaje | |
| DAS-04 | Pulsar "Actualizar datos" | Vuelve a cargar los indicadores | |

### Tickets

| ID | Pasos | Resultado esperado | ✅/❌ |
|---|---|---|---|
| TIC-01 | Abrir Tickets | Tabla con 5 tickets y el paginador "1 – 5 of N" | |
| TIC-02 | Pasar a la página siguiente y cambiar a 10 por página | El paginador y las filas cambian correctamente | |
| TIC-03 | Escribir "pantalla" en Buscar | Solo aparecen tickets que contienen esa palabra; el filtro vuelve a la página 1 | |
| TIC-04 | Agregar el estado "En proceso" y una fecha "Desde" | Los resultados se combinan con la búsqueda | |
| TIC-05 | Pulsar "Limpiar" | Vuelve la lista completa | |
| TIC-06 | "Nuevo ticket" → escribir un asunto, entrar y salir de Descripción sin escribir | "Guardar" queda desactivado y aparece "La descripción debe tener entre 10 y 500 caracteres" | |
| TIC-07 | Crear un ticket válido | Vuelve a la lista y el total aumenta en 1 | |
| TIC-08 | Ver el detalle del ticket (ícono del ojo) | Muestra todos sus datos | |
| TIC-09 | Editar el ticket y cambiarle el estado | El cambio se ve en la lista y en el Dashboard | |
| TIC-10 | Eliminar el ticket y confirmar | Desaparece de la lista y el total baja en 1 | |
| TIC-11 | Eliminar y pulsar "Cancelar" en el diálogo | No se elimina nada | |

### Kanban (Soporte o Administrador)

| ID | Pasos | Resultado esperado | ✅/❌ |
|---|---|---|---|
| KAN-01 | Abrir Kanban | Tres columnas con los tickets según su estado | |
| KAN-02 | Arrastrar un ticket de "Abierto" a "En proceso" | Queda en la nueva columna | |
| KAN-03 | Recargar la página | El ticket sigue en la columna nueva (se guardó en la API) | |
| KAN-04 | Filtrar por texto o prioridad | Las columnas muestran solo los tickets que coinciden | |

### Usuarios (Administrador)

| ID | Pasos | Resultado esperado | ✅/❌ |
|---|---|---|---|
| USU-01 | Abrir Usuarios | Tabla con nombre, email, rol y acciones | |
| USU-02 | "Nuevo usuario" → Guardar con todo vacío | "El nombre es obligatorio" y "El email es obligatorio" | |
| USU-03 | Nombre "Al" y email "correo-malo" | "Debe tener al menos 3 caracteres" e "Ingresa un email válido" | |
| USU-04 | Crear un usuario válido | Aparece en la lista | |
| USU-05 | Ver su detalle | Muestra el ID, el nombre, el email y el rol | |
| USU-06 | Editarlo y cambiarle el rol | La lista muestra el nuevo rol | |
| USU-07 | Eliminarlo | Desaparece de la lista | |
| USU-08 | Abrir `/usuarios/no-existe` | "No fue posible cargar el usuario." | |

### Errores y pantallas pequeñas

| ID | Pasos | Resultado esperado | ✅/❌ |
|---|---|---|---|
| ERR-01 | Con la sesión iniciada, detener la API (`Ctrl + C` en la terminal 1) y abrir Tickets | Mensaje de error con el botón "Reintentar" | |
| ERR-02 | Volver a levantar la API y pulsar "Reintentar" | Los tickets cargan | |
| RES-01 | Abrir las herramientas del navegador (F12) → modo dispositivo → iPhone | Login y Dashboard se ven sin desplazamiento horizontal | |
| CON-01 | Recorrer todas las pantallas con la consola abierta (F12 → *Console*) | Sin errores en rojo, salvo los provocados a propósito en ERR-01 y USU-08 | |

---

## Checklist final de entrega

- [ ] Todos los pull requests están integrados en `master`.
- [ ] `git pull origin master` en una copia limpia; luego `npm install`.
- [ ] `npm run build` compila sin errores.
- [ ] `npm test -- --watch=false` muestra todas las pruebas en verde.
- [ ] El plan de pruebas de usuario está completo y los ❌ se corrigieron o quedaron explicados.
- [ ] `db.json` vuelve a tener datos de ejemplo presentables (`git checkout db.json` si se ensució al probar).
- [ ] En `src/app/config/api.ts`, el interruptor `USAR_API_REMOTA` está en `false`.
- [ ] El README explica el alcance (API local y login simulado) y cómo ejecutar el proyecto.
- [ ] Si se entrega un .zip: sin `node_modules`, `dist` ni `.angular`.
- [ ] Capturas de las pantallas principales (opcional, pero ayudan en la revisión).
