// ---------------------------------------------------------------------------
// Interruptor de la API
// ---------------------------------------------------------------------------
// false -> modo LOCAL (entrega actual):
//          - Tickets y usuarios se leen desde json-server (npm run api, puerto 3000).
//          - El login se simula con los usuarios ficticios de config/usuarios-demo.ts.
//
// true  -> modo REMOTO (API del curso, Django publicada con Dev Tunnel):
//          - Tickets y usuarios se leen desde la API del curso.
//          - El login llama a POST {API_BASE_URL}/auth/token y usa el token real.
//          - Requiere que el túnel esté activo y credenciales entregadas por el profesor.
// ---------------------------------------------------------------------------
export const USAR_API_REMOTA = false;

const API_LOCAL = 'http://localhost:3000';
const API_REMOTA = 'https://z1ppqjv1-3000.brs.devtunnels.ms';

// URL base que usan todos los servicios.
export const API_BASE_URL = USAR_API_REMOTA ? API_REMOTA : API_LOCAL;
