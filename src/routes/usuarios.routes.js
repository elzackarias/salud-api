import { Router } from 'express';
import { obtenerPerfil, obtenerDashboard } from '../controllers/usuarios.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Endpoint: GET /api/usuarios/perfil/:usuario_id
// Protegida
router.get('/perfil/:usuario_id', verificarToken, obtenerPerfil);

// Endpoint: GET /api/usuarios/dashboard/:usuario_id
// Protegida - retorna todos los datos del usuario en una sola llamada (pantalla inicio de la app)
router.get('/dashboard/:usuario_id', verificarToken, obtenerDashboard);

export default router;