import { Router } from 'express';
import { obtenerRecomendaciones } from '../controllers/recomendaciones.controller.js';

const router = Router();

// Endpoint: GET /api/recomendaciones/:usuario_id
router.get('/:usuario_id', obtenerRecomendaciones);

export default router;
