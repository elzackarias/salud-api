import { Router } from 'express';
import { calcularRiesgoIarri } from '../controllers/metabolismo.controller.js';

const router = Router();

// Endpoint: POST /api/iarri/calcular
router.post('/calcular', calcularRiesgoIarri);

export default router;
