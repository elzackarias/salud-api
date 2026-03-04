import { Router } from 'express';
import { registrarUsuario, loginUsuario } from '../controllers/auth.controller.js';

const router = Router();

// Endpoint: POST /api/auth/registro
router.post('/registro', registrarUsuario);

// Endpoint: POST /api/auth/login
router.post('/login', loginUsuario);

export default router;
