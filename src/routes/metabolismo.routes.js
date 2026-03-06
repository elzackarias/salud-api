import { Router } from 'express';
import { calcularRiesgoIarri } from '../controllers/metabolismo.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Endpoint: POST /api/iarri/calcular
// Protegida - solo usuarios autenticados pueden calcular su IARRI
router.post('/calcular', verificarToken, calcularRiesgoIarri);

export default router;