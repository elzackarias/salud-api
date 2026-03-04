import { Router } from 'express';
import { 
    obtenerRetosActivos, 
    otorgarInsignia, 
    obtenerInsigniasUsuario 
} from '../controllers/gamificacion.controller.js';

const router = Router();

// Endpoint: GET /api/gamificacion/retos/:usuario_id
router.get('/retos/:usuario_id', obtenerRetosActivos);

// Endpoint: POST /api/gamificacion/insignias
router.post('/insignias', otorgarInsignia);

// Endpoint: GET /api/gamificacion/insignias/:usuario_id
router.get('/insignias/:usuario_id', obtenerInsigniasUsuario);

export default router;
