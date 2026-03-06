import { Router } from 'express';
import {
    obtenerMicrocursos,
    obtenerQuizPorCurso,
    evaluarQuiz
} from '../controllers/educacion.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Endpoint: GET /api/educacion/cursos
// Pública - cualquiera puede ver los cursos disponibles
router.get('/cursos', obtenerMicrocursos);

// Endpoint: GET /api/educacion/cursos/:curso_id/quiz
// Pública - se puede ver el contenido del quiz sin autenticación
router.get('/cursos/:curso_id/quiz', obtenerQuizPorCurso);

// Endpoint: POST /api/educacion/evaluar
// Protegida - requiere login para guardar el progreso
router.post('/evaluar', verificarToken, evaluarQuiz);

export default router;