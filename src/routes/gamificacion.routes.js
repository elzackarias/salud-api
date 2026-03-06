import { Router } from 'express';
import {
    obtenerRetosActivos,
    iniciarReto,
    completarReto,
    otorgarInsignia,
    obtenerInsigniasUsuario
} from '../controllers/gamificacion.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Endpoint: GET /api/gamificacion/retos/:usuario_id
// Pública para ver los retos disponibles
router.get('/retos/:usuario_id', obtenerRetosActivos);

// Endpoint: POST /api/gamificacion/retos/iniciar
// Protegida - el usuario inicia un reto
router.post('/retos/iniciar', verificarToken, iniciarReto);

// Endpoint: PUT /api/gamificacion/retos/completar
// Protegida - el usuario marca un reto como completado
router.put('/retos/completar', verificarToken, completarReto);

// Endpoint: POST /api/gamificacion/insignias
// Protegida - otorgar insignia manualmente
router.post('/insignias', verificarToken, otorgarInsignia);

// Endpoint: GET /api/gamificacion/insignias/:usuario_id
router.get('/insignias/:usuario_id', obtenerInsigniasUsuario);

export default router;