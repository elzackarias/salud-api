import { Router } from 'express';
import { obtenerRecomendaciones } from '../controllers/recomendaciones.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Endpoint: GET /api/recomendaciones/:usuario_id
// Protegida - recomendaciones personalizadas basadas en el historial del usuario
router.get('/:usuario_id', verificarToken, obtenerRecomendaciones);

export default router;