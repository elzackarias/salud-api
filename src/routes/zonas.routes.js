import { Router } from 'express';
import { obtenerZonas, obtenerZonaPorId, obtenerHistorialIarri } from '../controllers/zonas.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Endpoint: GET /api/zonas
// Pública - cualquiera puede ver las zonas disponibles
router.get('/', obtenerZonas);

// Endpoint: GET /api/zonas/:zona_id
// Pública - perfil metabólico ambiental de una zona específica
router.get('/:zona_id', obtenerZonaPorId);

// Endpoint: GET /api/zonas/historial/:usuario_id
// Protegida - solo el propio usuario puede ver su historial
router.get('/historial/:usuario_id', verificarToken, obtenerHistorialIarri);

export default router;